'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Fetch admin stats
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, []);

  const adminCards = [
    {
      title: 'Users',
      value: stats.total_users || 0,
      icon: Users,
      color: 'blue',
      href: '/admin/users'
    },
    {
      title: 'Total Analyses',
      value: stats.total_analyses || 0,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Active Today',
      value: stats.active_today || 0,
      icon: Activity,
      color: 'purple',
      href: '/admin/activity'
    },
    {
      title: 'Quota Used',
      value: `${stats.quota_used || 0}%`,
      icon: Zap,
      color: 'orange',
    }
  ];

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-200 text-lg">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href || '#'}
                className="glass rounded-2xl p-6 border border-white/20 card-hover"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-${card.color}-500/20 rounded-xl`}>
                    <Icon className={`w-6 h-6 text-${card.color}-400`} />
                  </div>
                  <div className="text-sm text-gray-400">{card.title}</div>
                </div>
                <div className="text-4xl font-bold text-white">{card.value}</div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="glass rounded-2xl p-8 border border-white/20 card-hover group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">User Management</h3>
                <p className="text-gray-300">Manage user accounts and permissions</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/activity" className="glass rounded-2xl p-8 border border-white/20 card-hover group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Activity Logs</h3>
                <p className="text-gray-300">View system activity and user actions</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
