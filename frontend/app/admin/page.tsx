'use client'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{stats.total_users}</p>
          <p className="text-sm opacity-75 mt-2">{stats.active_users} active</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Jobs</h3>
          <p className="text-4xl font-bold">{stats.total_jobs}</p>
          <p className="text-sm opacity-75 mt-2">{stats.completed_jobs} completed</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm font-medium opacity-90 mb-2">Active Users</h3>
          <p className="text-4xl font-bold">{stats.active_users}</p>
          <p className="text-sm opacity-75 mt-2">{stats.inactive_users} inactive</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <a href="/admin/users" className="p-4 border-2 border-purple-200 hover:border-purple-400 rounded-lg text-center transition">
            <div className="text-purple-600 font-semibold">Manage Users</div>
            <div className="text-sm text-gray-600 mt-1">Add, edit, or remove users</div>
          </a>
          <a href="/admin/activity" className="p-4 border-2 border-blue-200 hover:border-blue-400 rounded-lg text-center transition">
            <div className="text-blue-600 font-semibold">View Activity</div>
            <div className="text-sm text-gray-600 mt-1">Monitor system activity</div>
          </a>
        </div>
      </div>
    </div>
  )
}
