'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Loader2, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/profile/me');
        setUser(res.user);
      } catch (e) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header Card */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.photos?.[0]} alt={user.name} />
                  <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-white text-2xl">{user.name}</CardTitle>
                  <CardDescription>{user.bio}</CardDescription>
                </div>
              </div>
              <Button onClick={() => router.push('/profile/edit')} size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Details Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-400">Age</label>
                <p className="text-white text-lg mt-1">{user.age || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Gender</label>
                <p className="text-white text-lg mt-1">{user.gender || 'Not specified'}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-400">Phone</label>
                <p className="text-white text-lg mt-1">{user.phone}</p>
              </div>
              {user.location && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Location</label>
                  <p className="text-white text-lg mt-1">{user.location}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
