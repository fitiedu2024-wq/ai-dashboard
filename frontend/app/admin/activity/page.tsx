'use client'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

interface ActivityLog {
  id: number
  email?: string
  action: string
  ip_address?: string
  os?: string
  browser?: string
  timestamp: string
  success: boolean
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/api/admin/activity?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setLogs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading activity logs...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No activity logs yet
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {log.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span>{log.os || '-'}</span>
                      <span className="text-xs text-gray-400">{log.browser || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.success 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
