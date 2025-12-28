'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings, Users, Activity, ArrowLeft, LogOut } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useToast } from '../lib/toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { error: showError } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getUser();
      if (response.error) {
        router.push('/login');
        return;
      }
      if (!response.data?.is_admin) {
        showError('Access Denied', 'Admin access required');
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white">Checking admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: Settings },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white flex">
      <div className="w-80 p-6 border-r border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-2">Manage platform settings</p>
        </div>
        <nav className="space-y-2">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' : 'text-gray-300 hover:bg-gray-800/50'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-8">
          <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
