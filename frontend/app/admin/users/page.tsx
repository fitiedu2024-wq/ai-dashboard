'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Mail, Calendar, Plus, Edit, Trash2, Shield } from 'lucide-react';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createUser = async (email: string, password: string, quota: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, quota })
      });
      loadUsers();
      setShowCreate(false);
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const updateUser = async (userId: number, updates: any) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`https://ai-dashboard-backend-7dha.onrender.com/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      loadUsers();
      setEditUser(null);
    } catch (error) {
      alert('Failed to update user');
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-200 text-lg">Manage all platform users</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Create User Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass rounded-2xl p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Create New User</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createUser(
                  formData.get('email') as string,
                  formData.get('password') as string,
                  parseInt(formData.get('quota') as string)
                );
              }}>
                <div className="space-y-4">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white"
                    required
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white"
                    required
                  />
                  <input
                    name="quota"
                    type="number"
                    placeholder="Quota"
                    defaultValue="15"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white"
                    required
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-lg text-white">{user.email}</span>
                      {user.role === 'admin' && <Shield className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div>Quota: <span className="text-white font-bold">{user.quota}/20</span></div>
                      <div>Last Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</div>
                      {user.last_geo && <div>📍 {user.last_geo}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditUser(user)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass rounded-2xl p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Edit User: {editUser.email}</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updates: any = {};
                const quota = formData.get('quota');
                const password = formData.get('password');
                if (quota) updates.quota = parseInt(quota as string);
                if (password) updates.password = password;
                updateUser(editUser.id, updates);
              }}>
                <div className="space-y-4">
                  <input
                    name="quota"
                    type="number"
                    placeholder="New Quota"
                    defaultValue={editUser.quota}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="New Password (optional)"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">
                    Update
                  </button>
                  <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
