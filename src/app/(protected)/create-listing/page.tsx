// paye-frontend/src/app/(protected)/create-listing/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form/form';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateListingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

    type CreateListingForm = {
        title: string;
        sports: string;
        exerciseType: 'ONE_ON_ONE' | 'ONE_ON_MANY' | 'MANY_ON_MANY';
        location: string;
        genderPreference: 'ANY' | 'MALE' | 'FEMALE';
        maxInvites: string;
        moreInfo: string;
        goDutch: boolean;
    };

  // 1. Define the form hook with default values
const form = useForm<CreateListingForm>({
  defaultValues: {
    title: '',
    sports: '',
    exerciseType: 'ONE_ON_ONE',
    location: '',
    genderPreference: 'ANY',
    maxInvites: '1',
    moreInfo: '',
    goDutch: false,
  },
});


  const onSubmit = async (data: CreateListingForm) => {
    setLoading(true);
    try {
      // 2. Prepare payload
      const payload = {
        ...data,
        sports: data.sports ? data.sports.split(',').map((s: string) => s.trim()) : [],
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle>Create a Listing</CardTitle>
            <CardDescription>Find your perfect sports partner</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 3. Pass the 'form' object to the Form component */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Tennis - Weekend" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sports (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Football, Tennis" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="exerciseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ONE_ON_ONE">One on One</SelectItem>
                          <SelectItem value="ONE_ON_MANY">One on Many</SelectItem>
                          <SelectItem value="MANY_ON_MANY">Many on Many</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. New York, NY" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="genderPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ANY">Any</SelectItem>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxInvites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Invites</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" placeholder="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <FormField
                control={form.control}
                name="moreInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Share details about your session..." className="resize-none" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}