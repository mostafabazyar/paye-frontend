'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Loader2, Edit2, Heart, MapPin, UserRound } from 'lucide-react';

type ProfileUser = {
  name?: string;
  bio?: string;
  photos?: string[];
  age?: number;
  gender?: string;
  interestedIn?: 'MEN' | 'WOMEN' | 'EVERYONE';
  preferredSports?: string[];
  preferredSessionTypes?: string[];
  phone?: string;
  location?: string;
};

const interestedInLabel: Record<NonNullable<ProfileUser['interestedIn']>, string> = {
  MEN: 'Men',
  WOMEN: 'Women',
  EVERYONE: 'Everyone',
};

const sessionTypeLabel: Record<string, string> = {
  ONE_ON_ONE: '1:1 Session',
  ONE_ON_MANY: 'Small Group',
  MANY_ON_MANY: 'Open Session',
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/profile/me');
        setUser(res.user);
      } catch {
        console.log('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="overflow-hidden border-slate-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="h-2 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400" />
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-18 w-18 border border-slate-100 shadow-sm">
                  <AvatarImage src={user.photos?.[0]} alt={user.name} />
                  <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Profile</p>
                  <CardTitle className="text-3xl text-slate-950">{user.name || 'Your profile'}</CardTitle>
                  <CardDescription className="mt-2 max-w-xl text-slate-600">
                    {user.bio || 'Add a short bio so people know what kind of partner you are looking for.'}
                  </CardDescription>
                </div>
              </div>

              <Button onClick={() => router.push('/profile/edit')} className="rounded-full bg-slate-900 text-white hover:bg-slate-700">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3">
              <CardDescription>Interested in</CardDescription>
              <CardTitle className="text-2xl text-slate-950">
                {interestedInLabel[user.interestedIn || 'EVERYONE']}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-500">Dating-style preference for discovery and suggestions.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3">
              <CardDescription>Identity</CardDescription>
              <CardTitle className="text-2xl text-slate-950">{user.gender || 'Not specified'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-500">Age {user.age || 'n/a'} and profile basics.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Discovery preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-400">Interested sports</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user.preferredSports || []).length > 0 ? (
                  user.preferredSports?.map((sport) => (
                    <Badge key={sport} variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                      {sport}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No sports selected yet.</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400">Preferred session style</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user.preferredSessionTypes || []).length > 0 ? (
                  user.preferredSessionTypes?.map((type) => (
                    <Badge key={type} variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                      {sessionTypeLabel[type] || type}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No session style selected yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Personal information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-400">Age</label>
                <p className="mt-1 text-lg text-slate-900">{user.age || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Gender</label>
                <p className="mt-1 text-lg text-slate-900">{user.gender || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Interested in</label>
                <p className="mt-1 text-lg text-slate-900">
                  {interestedInLabel[user.interestedIn || 'EVERYONE']}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Phone</label>
                <p className="mt-1 text-lg text-slate-900">{user.phone || 'Not specified'}</p>
              </div>
              {user.location && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Location</label>
                  <p className="mt-1 flex items-center gap-2 text-lg text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {user.location}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                Clean profile
              </Badge>
              <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                Dating-style interest
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
