'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';

type RequestProfile = {
  id?: number | string;
  title?: string;
  location?: string;
  moreInfo?: string;
  exerciseType?: string;
  genderPreference?: string;
  sports?: string[] | string;
};

type Requester = {
  id?: number | string;
  name?: string;
  photos?: string[];
};

type RequestItem = {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  requester?: Requester;
  profile?: RequestProfile;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
};

function formatRequestDate(value?: string) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getStatusMeta(status: RequestItem['status']) {
  if (status === 'APPROVED') {
    return {
      label: 'Approved',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (status === 'REJECTED') {
    return {
      label: 'Rejected',
      className: 'border-slate-200 bg-slate-100 text-slate-600',
    };
  }

  return {
    label: 'Pending',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  };
}

function getSportsLabel(sports?: string[] | string) {
  if (Array.isArray(sports)) {
    return sports.filter(Boolean);
  }

  if (typeof sports === 'string') {
    return sports
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function RequestsPage() {
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: received = [], refetch: refetchReceived } = useQuery({
    queryKey: ['requests', 'received'],
    queryFn: async () => {
      const res = await apiClient.get('/requests/received');
      return res?.requests || [];
    },
  });

  const { data: sent = [], refetch: refetchSent } = useQuery({
    queryKey: ['requests', 'sent'],
    queryFn: async () => {
      const res = await apiClient.get('/requests/sent');
      return res?.requests || [];
    },
  });

  const handleUpdate = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setUpdating(`${id}-${status}`);
    try {
      await apiClient.put(`/requests/${id}`, { status });
      toast.success(`Request ${status.toLowerCase()}!`);
      refetchReceived();
      refetchSent();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const RequestPreview = ({ profile }: { profile?: RequestProfile }) => {
    const sports = getSportsLabel(profile?.sports);

    return (
      <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-950">{profile?.title || 'Session request'}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{profile?.location || 'Location pending'}</span>
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-slate-400" />
        </div>

        {profile?.moreInfo && <p className="mt-3 text-sm leading-6 text-slate-600">{profile.moreInfo}</p>}

        {sports.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sports.slice(0, 3).map((sport) => (
              <Badge key={sport} variant="secondary" className="border border-slate-200 bg-white text-slate-700">
                {sport}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ReceivedRequestCard = ({ request }: { request: RequestItem }) => {
    const status = getStatusMeta(request.status);

    return (
      <Card className="overflow-hidden border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <CardHeader className="space-y-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-slate-950">Join request</CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                From {request.requester?.name || `User #${request.requester?.id || 'unknown'}`}
              </CardDescription>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock3 className="h-4 w-4" />
            <span>{formatRequestDate(request.createdAt)}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <RequestPreview profile={request.profile} />

          {request.message && (
            <div className="rounded-[1.2rem] border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
              {request.message}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => handleUpdate(request.id, 'APPROVED')}
              disabled={updating === `${request.id}-APPROVED`}
              className="h-11 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
            >
              {updating === `${request.id}-APPROVED` ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept
                </>
              )}
            </Button>

            <Button
              onClick={() => handleUpdate(request.id, 'REJECTED')}
              disabled={updating === `${request.id}-REJECTED`}
              variant="secondary"
              className="h-11 rounded-full border border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50"
            >
              {updating === `${request.id}-REJECTED` ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SentRequestCard = ({ request }: { request: RequestItem }) => {
    const status = getStatusMeta(request.status);

    return (
      <Card className="overflow-hidden border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-slate-950">{request.profile?.title || 'Your request'}</CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                {request.profile?.location || 'Location pending'}
              </CardDescription>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <RequestPreview profile={request.profile} />

          <div className="flex items-center justify-between rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              Sent on
            </span>
            <span className="font-medium text-slate-900">{formatRequestDate(request.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Requests</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Manage incoming and outgoing session requests.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Review approvals, follow up on pending invites, and keep all of your matches in one clean place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">Received</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{received.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-slate-700">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">Sent</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{sent.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-slate-700">
                  <Clock3 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-1" style={{ height: 'calc(var(--spacing) * 15)' }}>
            <TabsTrigger
              value="received"
              className="rounded-[1.1rem] px-4 py-3 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
            >
              Received ({received.length})
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-[1.1rem] px-4 py-3 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
            >
              Sent ({sent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {received.length === 0 ? (
              <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <CardContent className="py-16 text-center">
                  <p className="text-slate-500">No incoming requests yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {received.map((request: RequestItem) => (
                  <ReceivedRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sent.length === 0 ? (
              <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <CardContent className="py-16 text-center">
                  <p className="text-slate-500">No outgoing requests yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sent.map((request: RequestItem) => (
                  <SentRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
