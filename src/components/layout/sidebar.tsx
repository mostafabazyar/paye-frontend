'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, MessageCircle, Calendar, User, Settings, Heart 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Discover', icon: Home },
  { href: '/explore', label: 'Explore', icon: Users },
  { href: '/create-listing', label: 'Create Listing', icon: Heart },
  { href: '/requests', label: 'Requests', icon: Users },
  { href: '/sessions', label: 'Sessions', icon: Calendar },
  { href: '/chat', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 border-r border-slate-800 bg-slate-950 h-full hidden lg:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tighter">Paye</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <Link href="/settings" className="flex items-center gap-3 text-slate-400 hover:text-slate-200">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}