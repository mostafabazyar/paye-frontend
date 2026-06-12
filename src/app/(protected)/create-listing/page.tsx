'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form/form';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  ClipboardList,
  HeartHandshake,
  LocateFixed,
  Sparkles,
  Users,
} from 'lucide-react';

type CreateListingForm = {
  title: string;
  sports: string;
  exerciseType: 'ONE_ON_ONE' | 'ONE_ON_MANY' | 'MANY_ON_MANY';
  location: string;
  scheduledAt: string;
  genderPreference: 'ANY' | 'MALE' | 'FEMALE';
  maxInvites: string;
  moreInfo: string;
  goDutch: boolean;
};

const exerciseTypeOptions = [
  { value: 'ONE_ON_ONE', label: 'One on One', description: 'A focused session with one partner.' },
  { value: 'ONE_ON_MANY', label: 'One on Many', description: 'Lead a small group workout.' },
  { value: 'MANY_ON_MANY', label: 'Many on Many', description: 'Open the session to a larger crew.' },
] as const;

const genderOptions = [
  { value: 'ANY', label: 'Any', description: 'Open to everyone.' },
  { value: 'MALE', label: 'Male', description: 'Male partners only.' },
  { value: 'FEMALE', label: 'Female', description: 'Female partners only.' },
] as const;

const sportOptions = [
  'Football',
  'Basketball',
  'Tennis',
  'Swimming',
  'Running',
  'Cycling',
  'Gym',
  'Yoga',
  'Boxing',
  'Hiking',
  'Badminton',
  'Volleyball',
] as const;

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getDefaultScheduleTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60);
  date.setSeconds(0, 0);
  return formatDateTimeLocal(date);
};

async function reverseGeocode(lat: number, lon: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Unable to resolve location');
  }

  const data = await response.json();
  const address = data?.address || {};

  return (
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  );
}

export default function CreateListingPage() {
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const router = useRouter();

  const form = useForm<CreateListingForm>({
    defaultValues: {
      title: '',
      sports: sportOptions[0],
      exerciseType: 'ONE_ON_ONE',
      location: '',
      scheduledAt: '',
      genderPreference: 'ANY',
      maxInvites: '1',
      moreInfo: '',
      goDutch: false,
    },
  });

  const { getValues, setValue } = form;

  useEffect(() => {
    if (!getValues('scheduledAt')) {
      setValue('scheduledAt', getDefaultScheduleTime(), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [getValues, setValue]);

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Location is not available in this browser');
      return;
    }

    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const locationName = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      setValue('location', locationName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      toast.success('Location added');
    } catch {
      toast.error('Could not get your location');
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = async (data: CreateListingForm) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        sports: data.sports ? [data.sports] : [],
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        maxInvites: Number(data.maxInvites) || 1,
        goDutch: !!data.goDutch,
      };

      await apiClient.post('/profile/create', payload);
      toast.success('Listing created successfully!');
      router.push('/explore');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <div className="h-2 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400" />
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-slate-900 to-slate-600 text-white shadow-[0_18px_35px_rgba(15,23,42,0.14)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Create</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Post a new listing</h1>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                Build a clean session listing that shows who you want to meet, where it happens, and how people can join.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                  <Users className="h-5 w-5 text-slate-700" />
                  <p className="mt-3 text-sm font-medium text-slate-950">Quick setup</p>
                  <p className="mt-1 text-sm text-slate-500">Most fields are one tap away.</p>
                </div>
                <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                  <HeartHandshake className="h-5 w-5 text-slate-700" />
                  <p className="mt-3 text-sm font-medium text-slate-950">Better match quality</p>
                  <p className="mt-1 text-sm text-slate-500">Clear preferences reduce bad joins.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                  Clean cards
                </Badge>
                <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                  Mobile friendly
                </Badge>
                <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-700">
                  Fast sharing
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-slate-50 shadow-none">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-900">Tips</p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Keep the title short, use clear sports keywords, and add a friendly note so the right people know what to expect.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="text-2xl text-slate-950">Listing details</CardTitle>
            <CardDescription className="text-slate-500">
              Fill in the essentials to create a polished session card.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Morning Tennis Run"
                          className="rounded-[1rem] border-slate-200 bg-slate-50"
                        />
                      </FormControl>
                      <FormDescription>
                        Short, direct titles work best in the feed.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full rounded-[1rem] border-slate-200 bg-slate-50">
                            <SelectValue placeholder="Choose a sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sportOptions.map((sport) => (
                            <SelectItem key={sport} value={sport}>
                              {sport}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pick the main sport for this listing.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="exerciseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-[1rem] border-slate-200 bg-slate-50">
                              <SelectValue placeholder="Choose type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {exerciseTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {exerciseTypeOptions.find((option) => option.value === field.value)?.description}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Location</FormLabel>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleUseLocation}
                            disabled={locating}
                            className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <LocateFixed className="mr-2 h-3.5 w-3.5" />
                            {locating ? 'Locating...' : 'Use my location'}
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. New York, NY"
                            className="rounded-[1rem] border-slate-200 bg-slate-50"
                          />
                        </FormControl>
                        <FormDescription>
                          Show where the session will happen.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="genderPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-[1rem] border-slate-200 bg-slate-50">
                              <SelectValue placeholder="Choose preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {genderOptions.find((option) => option.value === field.value)?.description}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxInvites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max invites</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="1"
                            className="rounded-[1rem] border-slate-200 bg-slate-50"
                          />
                        </FormControl>
                        <FormDescription>
                          How many people can join this listing.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule time</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          min={getDefaultScheduleTime()}
                          className="rounded-[1rem] border-slate-200 bg-slate-50"
                        />
                      </FormControl>
                      <FormDescription>
                        Pick a future time. Past times are blocked and expired events are auto-disabled.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="moreInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional information</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Share the pace, level, or anything useful for people joining."
                          className="min-h-[140px] resize-none rounded-[1rem] border-slate-200 bg-slate-50"
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Add helpful context to improve responses.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    You can review and edit the listing after it is created.
                  </p>
                  <Button
                    type="submit"
                    className="h-12 rounded-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 px-6 text-white shadow-[0_18px_35px_rgba(15,23,42,0.16)]"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Listing'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
