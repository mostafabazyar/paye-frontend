'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router, hasHydrated]);

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-slate-700">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-auto px-4 py-5 pb-28 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <Sidebar />
    </div>
  );
}
