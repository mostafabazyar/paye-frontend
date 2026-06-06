'use client';

import { useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form/form';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  phone: z.string().min(9, 'Valid phone number is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/login', data);
      toast.success("OTP Sent! Check your messages.");
      router.push(`/verify?phone=${encodeURIComponent(data.phone)}`);
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Paye</CardTitle>
          <CardDescription className="text-lg">Find your perfect Hambash</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }: { field: ControllerRenderProps<LoginForm, 'phone'> }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+213 5XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}