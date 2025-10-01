'use client'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

interface User {
  id: number
  email: string
  full_name?: string
  role: string
  quota: number
  is_active: boolean
  created_at: string
  last_login?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    role: 'user', 
    quota: 15 
  })

  const fetchUsers = () => {
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    })

    if (res.ok) {
      setShowModal(false)
      setNewUser({ email: '', password: '', full_name: '', role: 'user', quota: 15 })
      fetchUsers()
    } else {
      const error = await res.json()
      alert(error.detail || 'Failed to create user')
    }
  }

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
    fetchUsers()
  }

  const toggleActive = (user: User) => {
    handleUpdateUser(user.id, { is_active: !user.is_active })
  }

  const increaseQuota = (user: User) => {
    handleUpdateUser(user.id, { quota: user.quota + 10 })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users, permissions, and quotas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          + Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-1">Total Users</div>
          <div className="text-3xl font-bold">{users.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-1">Active Users</div>
          <div className="text-3xl font-bold">{users.filter(u => u.is_active).length}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-1">Admin Users</div>
          <div className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-1">Total Quota</div>
          <div className="text-3xl font-bold">{users.reduce((sum, u) => sum + u.quota, 0)}</div>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.email[0].toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{user.full_name || user.email}</h3>
                    {user.role === 'admin' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Admin
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                    {user.last_login && (
                      <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-purple-600">{user.quota}</div>
                  <div className="text-xs text-gray-500">Jobs Available</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => increaseQuota(user)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
                  title="Add +10 quota"
                >
                  +10 Quota
                </button>
                <button
                  onClick={() => toggleActive(user)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    user.is_active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Quota</label>
                <input
                  type="number"
                  value={newUser.quota}
                  onChange={e => setNewUser({...newUser, quota: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium transition shadow-lg"
                >
                  Create User
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
