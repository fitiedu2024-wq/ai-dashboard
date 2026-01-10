'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Mail, Plus, Edit, Trash2, Shield, Check, X } from 'lucide-react';
import { adminAPI, authAPI } from '../../lib/api';
import { useToast } from '../../lib/toast';
import type { User } from '../../lib/types';

export default function AdminUsers() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const userResponse = await authAPI.getUser();

    if (userResponse.error) {
      router.push('/login');
      return;
    }

    if (!userResponse.data?.is_admin) {
      showError('Access Denied', 'Admin access required');
      router.push('/dashboard');
      return;
    }

    loadUsers();
  };

  const loadUsers = async () => {
    const response = await adminAPI.getUsers();
    if (response.data) {
      setUsers(response.data.users || []);
    }
    setLoading(false);
  };

  const createUser = async (email: string, password: string, quota: number) => {
    const response = await adminAPI.createUser(email, password, quota);
    if (response.data?.success) {
      success('User Created', `User ${email} has been created`);
      loadUsers();
      setShowCreate(false);
    } else {
      showError('Error', response.error || 'Failed to create user');
    }
  };

  const updateUser = async (userId: number, updates: { quota?: number; is_active?: boolean; password?: string }) => {
    const response = await adminAPI.updateUser(userId, updates);
    if (response.data?.success) {
      success('User Updated', 'User has been updated successfully');
      loadUsers();
      setEditUser(null);
    } else {
      showError('Error', response.error || 'Failed to update user');
    }
  };

  const deleteUser = async (userId: number, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    const response = await adminAPI.deleteUser(userId);
    if (response.data?.success) {
      success('User Deleted', `User ${email} has been deleted`);
      loadUsers();
    } else {
      showError('Error', response.error || 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (user: User) => {
    await updateUser(user.id, { is_active: !user.is_active });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-200 text-lg">{users.length} users registered</p>
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
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400"
                    required
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400"
                    required
                  />
                  <input
                    name="quota"
                    type="number"
                    placeholder="Quota"
                    defaultValue="15"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
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
                      {user.role === 'admin' && <Shield className="w-4 h-4 text-yellow-400" title="Admin" />}
                      {!user.is_active && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div>Quota: <span className="text-white font-bold">{user.quota}</span></div>
                      <div>Last Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</div>
                      {user.last_geo && <div>📍 {user.last_geo}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`p-2 rounded-lg transition-colors ${user.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditUser(user)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                const updates: { quota?: number; password?: string } = {};
                const quota = formData.get('quota');
                const password = formData.get('password');
                if (quota) updates.quota = parseInt(quota as string);
                if (password) updates.password = password as string;
                updateUser(editUser.id, updates);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Quota</label>
                    <input
                      name="quota"
                      type="number"
                      defaultValue={editUser.quota}
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password (leave empty to keep current)</label>
                    <input
                      name="password"
                      type="password"
                      placeholder="New password"
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                    Update
                  </button>
                  <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
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
