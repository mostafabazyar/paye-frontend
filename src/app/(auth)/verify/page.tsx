'use client';

import { useState, useEffect } from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useSearchParams } from 'next/navigation';

const verifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type VerifyForm = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const { setAuth } = useAuthStore();

  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { otp: '' },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyForm) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/verify', { phone, otp: data.otp });
      
      setAuth(res.user, res.token);

      if (res.user?.name) {
        router.push('/dashboard');
      } else {
        router.push('/profile-setup');
      }
      
      toast.success("Successfully logged in!");
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
          <p className="text-sm text-muted-foreground">Sent to {phone}</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }: { field: ControllerRenderProps<VerifyForm, 'otp'> }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="123456" 
                        maxLength={6} 
                        className="text-center text-3xl tracking-[0.5em]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p>Resend available in {countdown}s</p>
            ) : (
              <Button variant="link" onClick={() => router.push('/login')}>
                Resend OTP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}