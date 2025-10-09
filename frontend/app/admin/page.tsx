'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const userRes = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (!userData.is_admin) {
          alert('Admin access required');
          router.push('/dashboard');
          return;
        }
        const statsRes = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        setStats(statsData);
        setLoading(false);
      } catch (error) {
        router.push('/login');
      }
    };
    checkAdmin();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Admin Dashboard</h1>
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.total_users || 0}</div>
            <div className="text-sm text-gray-400">Users</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.total_analyses || 0}</div>
            <div className="text-sm text-gray-400">Analyses</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.active_today || 0}</div>
            <div className="text-sm text-gray-400">Active Today</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-orange-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.quota_used || 0}%</div>
            <div className="text-sm text-gray-400">Quota Used</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Link href="/admin/users" className="glass rounded-2xl p-8 border border-white/20 card-hover">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white">User Management</h3>
          </Link>
          <Link href="/admin/activity" className="glass rounded-2xl p-8 border border-white/20 card-hover">
            <Activity className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white">Activity Logs</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}
