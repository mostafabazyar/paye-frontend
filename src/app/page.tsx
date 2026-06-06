'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, ArrowRight } from 'lucide-react'; // Elegant iconography

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckingAuth(true); // Only reveal landing if they're actually a guest
    }
  }, [isAuthenticated, router]);

  // Prevent flash of landing page if user is logged in and about to redirect
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      
      {/* Dynamic Background Radial Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.07),transparent_50%)]" />
      
      {/* Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

      <Card className="relative w-full max-w-md text-center bg-slate-900/40 border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-black/40 p-2 sm:p-4">
        <CardHeader className="space-y-4">
          
          {/* Animated Icon Container */}
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 animate-pulse">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-1.5">
            <CardTitle className="text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Paye
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-slate-400 font-medium tracking-wide">
              Find your perfect workout partner
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          <Button 
            onClick={() => router.push('/login')} 
            className="group relative w-full text-base font-semibold py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>

          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <button 
              onClick={() => router.push('/login')} 
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}