'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      // First, check if user is admin
      const userResponse = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/user', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        console.log('User check failed, redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      console.log('User data:', userData);

      if (!userData.is_admin) {
        alert('Admin access required');
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);

      // Now fetch stats
      const statsResponse = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      alert('Error checking admin access. Please try logging in again.');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white">Checking admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.total_users || 0}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.online_users || 0}</div>
            <div className="text-sm text-gray-400">Online Now</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.total_reports || 0}</div>
            <div className="text-sm text-gray-400">Total Reports</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-orange-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.reports_today || 0}</div>
            <div className="text-sm text-gray-400">Reports Today</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Link href="/admin/users" className="glass rounded-2xl p-8 border border-white/20 card-hover">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">User Management</h3>
            <p className="text-gray-300">Manage all platform users</p>
          </Link>
          <Link href="/admin/activity" className="glass rounded-2xl p-8 border border-white/20 card-hover">
            <Activity className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Activity Logs</h3>
            <p className="text-gray-300">Monitor system activity</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
