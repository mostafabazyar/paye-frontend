'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form/form';
import { toast } from 'sonner'; // Switched from useToast hook to direct sonner import
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const profileSetupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(16, "Must be at least 16").max(70, "Must be 70 or younger"),
  gender: z.enum(["male", "female", "other"]),
  interestedIn: z.enum(["MEN", "WOMEN", "EVERYONE"]),
  preferredSports: z.array(z.string()).default([]),
  preferredSessionTypes: z.array(z.enum(["ONE_ON_ONE", "ONE_ON_MANY", "MANY_ON_MANY"])).default([]),
  bio: z.string().max(500).optional(),
});

type ProfileSetupForm = z.infer<typeof profileSetupSchema>;

export default function ProfileSetupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  const form = useForm<ProfileSetupForm>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      name: user?.name || '',
      age: user?.age || 25,
      gender: (user?.gender as "male" | "female" | "other") || "male",
      interestedIn: (user?.interestedIn as "MEN" | "WOMEN" | "EVERYONE") || "EVERYONE",
      preferredSports: user?.preferredSports || [],
      preferredSessionTypes: user?.preferredSessionTypes || [],
      bio: user?.bio || '',
    },
  });

  const sportOptions = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Gym', 'Yoga', 'Boxing', 'Hiking', 'Badminton', 'Volleyball'] as const;
  const sessionTypeOptions = [
    { value: 'ONE_ON_ONE', label: '1:1 Session' },
    { value: 'ONE_ON_MANY', label: 'Small Group' },
    { value: 'MANY_ON_MANY', label: 'Open Session' },
  ] as const;

  const onSubmit = async (data: ProfileSetupForm) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/profile/setup', data);
      setAuth(res.user, res.token || ''); // Update user data with returned token
      toast.success("Profile Completed!");
      router.push('/explore');
    } catch (error: unknown) {
      toast.error("Error", { description: (error as { message?: string }).message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Full Name */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          field.onChange(isNaN(val) ? '' : val); // Prevents crash if input is empty
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Gender */}
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="interestedIn" render={({ field }) => (
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
                )} />
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

              {/* Bio */}
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell others about yourself..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving Profile..." : "Continue to Dashboard"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
