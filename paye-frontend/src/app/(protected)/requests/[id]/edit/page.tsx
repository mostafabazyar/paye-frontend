'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  DollarSign,
  Users,
  Layers,
  Sparkle
} from 'lucide-react';

type RequestProfile = {
  id: number | string;
  title: string;
  location: string;
  moreInfo?: string;
  exerciseType: string;
  genderPreference: string;
  sports?: string[] | string;
  tags?: string[] | string;
  isActive: boolean;
  maxInvites?: number;
  goDutch?: boolean;
  scheduledAt?: string;
};

// Type for the update payload - matches what your backend expects
type UpdateProfilePayload = {
  title: string;
  location: string;
  exerciseType: string;
  genderPreference: string;
  maxInvites: number;
  goDutch: boolean;
  moreInfo?: string;  // Changed from string | null to optional string
  sports: string[];
  isActive: boolean;
};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const listingId = params.id;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [exerciseType, setExerciseType] = useState('ONE_ON_ONE');
  const [genderPreference, setGenderPreference] = useState('ANY');
  const [maxInvites, setMaxInvites] = useState(1);
  const [goDutch, setGoDutch] = useState(false);
  const [moreInfo, setMoreInfo] = useState('');
  const [sportsInput, setSportsInput] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch all listings and find the specific one
  const { data: profile, isLoading, error } = useQuery<{ success: boolean; profiles?: RequestProfile[] }>({
    queryKey: ['profiles', 'my-listings'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/my-listings');
      return response;
    },
  });

  // Populate form with existing listing data
  useEffect(() => {
    if (profile?.profiles) {
      const currentListing = profile.profiles.find(
        (p) => String(p.id) === String(listingId)
      );

      if (currentListing) {
        setTitle(currentListing.title || '');
        setLocation(currentListing.location || '');
        setExerciseType(currentListing.exerciseType || 'ONE_ON_ONE');
        setGenderPreference(currentListing.genderPreference || 'ANY');
        setMaxInvites(currentListing.maxInvites || 1);
        setGoDutch(!!currentListing.goDutch);
        setMoreInfo(currentListing.moreInfo || '');
        setIsActive(currentListing.isActive !== undefined ? currentListing.isActive : true);

        // Handle sports/tags input
        if (Array.isArray(currentListing.tags)) {
          setSportsInput(currentListing.tags.join(', '));
        } else if (typeof currentListing.tags === 'string') {
          setSportsInput(currentListing.tags);
        } else if (Array.isArray(currentListing.sports)) {
          setSportsInput(currentListing.sports.join(', '));
        } else if (typeof currentListing.sports === 'string') {
          setSportsInput(currentListing.sports);
        }
      }
    }
  }, [profile, listingId]);

  // Update mutation using PATCH
  const updateMutation = useMutation({
    mutationFn: async (updatedData: UpdateProfilePayload) => {
      // Using PATCH method for partial updates
      const response = await apiClient.patch(`/profile/my-listings/${listingId}`, updatedData);
      return response;
    },
    onSuccess: () => {
      toast.success('Listing updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profiles', 'my-listings'] });
      router.push('/requests');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update listing profile.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !location.trim()) {
      toast.error('Title and Location fields are required.');
      return;
    }

    // Convert comma-separated sports input to array
    const sportsArray = sportsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    // Prepare the update payload - only include defined values
    const updatePayload: UpdateProfilePayload = {
      title: title.trim(),
      location: location.trim(),
      exerciseType,
      genderPreference,
      maxInvites: Number(maxInvites),
      goDutch: Boolean(goDutch),
      sports: sportsArray,
      isActive: Boolean(isActive),
    };

    // Only add moreInfo if it has a value (don't send null)
    if (moreInfo.trim()) {
      updatePayload.moreInfo = moreInfo.trim();
    }

    updateMutation.mutate(updatePayload);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-slate-800 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading session settings...</p>
        </div>
      </div>
    );
  }

  if (error || (profile?.profiles && !profile.profiles.find((p) => String(p.id) === String(listingId)))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="max-w-md w-full border-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.06)] text-center p-6">
          <p className="text-slate-900 font-semibold text-lg">Listing profile not found</p>
          <p className="text-sm text-slate-500 mt-2">The listing might have been removed, or you do not have permission to view it.</p>
          <Button asChild className="mt-5 rounded-full bg-slate-900 text-white" variant="default">
            <Link href="/requests">Return to Requests</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        
        <div className="mb-6">
          <Button asChild variant="ghost" className="rounded-full text-slate-600 hover:text-slate-900 -ml-2">
            <Link href="/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Link>
          </Button>
        </div>

        <div className="mb-8 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Workspace Management</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Edit Session Listing
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Modify structural information, attendance constraints, preferences, or update status toggles for this targeted host profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="overflow-hidden border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
              <CardTitle className="text-xl text-slate-950 flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-slate-700" />
                Listing Parameters
              </CardTitle>
              <CardDescription>Update your public session invite configuration.</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              
              {/* Listing Visibility Status */}
              <div className="flex items-center justify-between rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Layers className="h-4 w-4 text-slate-400" />
                  Listing Visibility Status
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isActive 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      !isActive 
                        ? 'border-slate-300 bg-slate-100 text-slate-700 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Expired / Paused
                  </button>
                </div>
              </div>

              {/* Session Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-950">Session Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Morning Tennis Match"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-950 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Downtown Sports Complex, Court 3"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              {/* Sports / Activity Tags */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-950 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" /> Sports / Activity Tags
                </label>
                <input
                  type="text"
                  value={sportsInput}
                  onChange={(e) => setSportsInput(e.target.value)}
                  placeholder="Tennis, Basketball, Cardio (comma separated)"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-xs text-slate-400">Separate values with commas to render clean interface badges.</p>
              </div>

              {/* Exercise Type & Gender Preference */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-950">Exercise Type</label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ONE_ON_ONE">One on One</option>
                    <option value="GROUP">Group Training</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-950">Gender Preference</label>
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ANY">Anyone Welcome</option>
                    <option value="WOMEN_ONLY">Women Only</option>
                    <option value="MEN_ONLY">Men Only</option>
                  </select>
                </div>
              </div>

              {/* Max Invites & Go Dutch */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" /> Max Invites
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={maxInvites}
                    onChange={(e) => setMaxInvites(Number(e.target.value))}
                    className="w-16 h-8 text-center rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setGoDutch(!goDutch)}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-all text-left ${
                    goDutch 
                      ? 'border-slate-900 bg-slate-950 text-white shadow-sm' 
                      : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className={`h-4 w-4 ${goDutch ? 'text-white' : 'text-slate-400'}`} /> Split Costs (Go Dutch)
                  </span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${goDutch ? 'border-white bg-white' : 'border-slate-300 bg-white'}`}>
                    {goDutch && <div className="h-2 w-2 rounded-full bg-slate-950" />}
                  </div>
                </button>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-950">Additional Information</label>
                <textarea
                  value={moreInfo}
                  onChange={(e) => setMoreInfo(e.target.value)}
                  placeholder="Share details regarding equipment availability, expected match level skill levels, or directions..."
                  rows={4}
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none leading-6"
                />
              </div>

            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              className="h-11 px-6 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => router.push('/requests')}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="h-11 px-6 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving updates...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}