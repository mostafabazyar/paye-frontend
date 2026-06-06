'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

export default function DashboardPage() {
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['matching', 'suggestions'],
    queryFn: () => apiClient.get('/matching/suggestions'),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Find Your Hambash</h1>
        <p className="text-slate-400">People nearby who share your sports passion</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800 animate-pulse h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((user: User) => (
            <Card key={user.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-blue-600 transition-all">
              <div className="relative h-64">
                <img
                  src={user.photos?.[0] || '/placeholder.jpg'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {user.avgRating} ★
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{user.name}</h3>
                    <p className="text-slate-400">{user.age} • {user.gender}</p>
                  </div>
                  <div className="text-right text-sm text-emerald-400">2.4 km</div>
                </div>

                {user.bio && (
                  <p className="text-slate-400 line-clamp-2 mb-4">{user.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Add sports badges here later */}
                </div>

                <Button className="w-full" size="lg">
                  Send Request
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}