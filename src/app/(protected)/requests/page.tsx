'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function RequestsPage() {
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: received = [], refetch: refetchReceived } = useQuery({
    queryKey: ['requests', 'received'],
    queryFn: async () => {
      const res = await apiClient.get('/requests/received');
      return res?.requests || [];
    }
  });

  const { data: sent = [], refetch: refetchSent } = useQuery({
    queryKey: ['requests', 'sent'],
    queryFn: async () => {
      const res = await apiClient.get('/requests/sent');
      return res?.requests || [];
    }
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

  const ReceivedRequestCard = ({ r }: { r: any }) => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white">Join Request</CardTitle>
            <CardDescription>from User #{r.requester?.id}</CardDescription>
          </div>
          <Badge>Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-800 rounded p-3">
          <p className="text-white font-semibold">{r.profile?.title}</p>
          <p className="text-slate-400 text-sm">{r.profile?.location}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleUpdate(r.id, 'APPROVED')}
            disabled={updating === `${r.id}-APPROVED`}
            size="sm"
            className="flex-1"
          >
            {updating === `${r.id}-APPROVED` ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept
              </>
            )}
          </Button>
          <Button
            onClick={() => handleUpdate(r.id, 'REJECTED')}
            disabled={updating === `${r.id}-REJECTED`}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            {updating === `${r.id}-REJECTED` ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const SentRequestCard = ({ r }: { r: any }) => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white">{r.profile?.title}</CardTitle>
            <CardDescription>{r.profile?.location}</CardDescription>
          </div>
          <Badge variant={r.status === 'APPROVED' ? 'default' : r.status === 'REJECTED' ? 'destructive' : 'secondary'}>
            {r.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">{r.profile?.moreInfo}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Requests</h1>
          <p className="text-slate-400">Manage your session requests</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="received" className="data-[state=active]:bg-blue-600">
              Received ({received.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-blue-600">
              Sent ({sent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {received.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">No incoming requests yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {received.map((r: any) => (
                  <ReceivedRequestCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sent.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">No outgoing requests yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sent.map((r: any) => (
                  <SentRequestCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
