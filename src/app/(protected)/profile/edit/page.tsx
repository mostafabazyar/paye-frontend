'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form/form';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type EditProfileForm = {
  name: string;
  phone: string;
  age?: number;
  gender?: string;
  interestedIn?: 'MEN' | 'WOMEN' | 'EVERYONE';
  preferredSports?: string[];
  preferredSessionTypes?: ('ONE_ON_ONE' | 'ONE_ON_MANY' | 'MANY_ON_MANY')[];
  bio?: string;
  location?: string;
};

const sportOptions = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Gym', 'Yoga', 'Boxing', 'Hiking', 'Badminton', 'Volleyball'] as const;
const sessionTypeOptions = [
  { value: 'ONE_ON_ONE', label: '1:1 Session' },
  { value: 'ONE_ON_MANY', label: 'Small Group' },
  { value: 'MANY_ON_MANY', label: 'Open Session' },
] as const;

export default function EditProfilePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<EditProfileForm>();
  const { reset } = form;

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/profile/me');
        reset(res.user);
      } catch {
        toast.error('Failed to load profile');
      }
    })();
  }, [reset]);

  const onSubmit = async (data: EditProfileForm) => {
    setLoading(true);
    try {
      await apiClient.post('/profile/setup', data);
      toast.success('Profile updated successfully!');
      router.push('/profile');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your phone number" type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Your age" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interestedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interested in</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Who are you interested in?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MEN">Men</SelectItem>
                            <SelectItem value="WOMEN">Women</SelectItem>
                            <SelectItem value="EVERYONE">Everyone</SelectItem>
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
                          <Input {...field} placeholder="City, State" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferredSports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interested sports</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {sportOptions.map((sport) => {
                          const selected = (field.value || []).includes(sport);
                          return (
                            <Button
                              key={sport}
                              type="button"
                              variant={selected ? 'default' : 'outline'}
                              onClick={() => {
                                const next = selected
                                  ? (field.value || []).filter((item) => item !== sport)
                                  : [...(field.value || []), sport];
                                field.onChange(next);
                              }}
                              className="rounded-full"
                            >
                              {sport}
                            </Button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredSessionTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred session style</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {sessionTypeOptions.map((option) => {
                          const selected = (field.value || []).includes(option.value);
                          return (
                            <Button
                              key={option.value}
                              type="button"
                              variant={selected ? 'default' : 'outline'}
                              onClick={() => {
                                const next = selected
                                  ? (field.value || []).filter((item) => item !== option.value)
                                  : [...(field.value || []), option.value];
                                field.onChange(next);
                              }}
                              className="rounded-full"
                            >
                              {option.label}
                            </Button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Tell us about yourself..." rows={4} className="resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
