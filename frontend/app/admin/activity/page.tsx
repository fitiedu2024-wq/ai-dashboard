'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

interface ActivityLog {
  id: number
  user_id?: number
  email?: string
  action: string
  ip_address?: string
  country?: string
  city?: string
  os?: string
  browser?: string
  device_type?: string
  timestamp: string
  success: boolean
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const router = useRouter()

  const fetchLogs = (userId?: number) => {
    const token = localStorage.getItem('token')
    const url = userId 
      ? `${API_URL}/api/admin/users/${userId}/activity`
      : `${API_URL}/api/admin/activity?limit=100`
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setLogs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleUserClick = (userId: number) => {
    setSelectedUser(userId)
    setLoading(true)
    fetchLogs(userId)
  }

  const clearFilter = () => {
    setSelectedUser(null)
    setLoading(true)
    fetchLogs()
  }

  if (loading) {
    return <div className="text-center py-12">Loading activity logs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
        {selectedUser && (
          <button
            onClick={clearFilter}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            Show All Users
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Browser/OS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No activity logs yet
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.user_id ? (
                        <button
                          onClick={() => handleUserClick(log.user_id!)}
                          className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          {log.email || 'Unknown'}
                        </button>
                      ) : (
                        <span className="text-gray-600">{log.email || 'Unknown'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.country && log.city ? (
                        <div className="flex items-center gap-1">
                          <span>🌍</span>
                          <span>{log.city}, {log.country}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.device_type && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.device_type === 'mobile' 
                            ? 'bg-blue-100 text-blue-700' 
                            : log.device_type === 'tablet'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {log.device_type === 'mobile' ? '📱 Mobile' : 
                           log.device_type === 'tablet' ? '📱 Tablet' : 
                           '💻 PC'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="text-xs">{log.browser || '-'}</span>
                        <span className="text-xs text-gray-400">{log.os || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.success 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.success ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Showing activity for User ID: <span className="font-bold">{selectedUser}</span>
          </p>
        </div>
      )}
    </div>
  )
}
