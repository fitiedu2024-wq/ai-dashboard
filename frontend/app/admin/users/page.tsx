'use client';

import { useEffect, useState } from 'react';
import { Users, Mail, Calendar } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setUsers(data.users || []))
        .catch(console.error);
    }
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-200 text-lg">Manage all platform users</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">All Users</h2>
          </div>

          <div className="space-y-3">
            {users.map((user, idx) => (
              <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-lg text-white">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div>Quota: {user.quota}/20</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    user.is_active 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
