'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ExplorePage() {
  const [joining, setJoining] = useState<string | null>(null);
  const [searchSport, setSearchSport] = useState('');

  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['profiles', 'explore', searchSport],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchSport) params.append('sport', searchSport);
      const res = await apiClient.get(`/profile/explore?${params.toString()}`);
      return res?.profiles || [];
    }
  });

  const handleJoin = async (profileId: number) => {
    setJoining(String(profileId));
    try {
      await apiClient.post('/requests', { profileId });
      toast.success('Request sent successfully!');
      refetch();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to send request');
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Explore Listings</h1>
          <p className="text-slate-400">Find sports partners and join sessions</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="Search by sport..."
            value={searchSport}
            onChange={(e) => setSearchSport(e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((p: any) => (
              <Card key={p.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white">{p.title}</CardTitle>
                      <CardDescription>{p.user?.name} • {p.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.sports && Array.isArray(p.sports) && p.sports.map((sport: string) => (
                      <Badge key={sport} variant="secondary">{sport}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">{p.moreInfo}</p>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>Type: {p.exerciseType}</span>
                      <span>Gender: {p.genderPreference}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleJoin(p.id)} 
                    disabled={joining === String(p.id)}
                    className="w-full"
                  >
                    {joining === String(p.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Join Session'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
