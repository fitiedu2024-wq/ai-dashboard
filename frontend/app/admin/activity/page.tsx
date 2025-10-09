'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, User } from 'lucide-react';

export default function AdminActivity() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setLogs(data.logs || []))
        .catch(console.error);
    }
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Activity Logs
          </h1>
          <p className="text-gray-200 text-lg">Monitor system activity</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
          </div>

          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div key={idx} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-white">{log.action}</span>
                    </div>
                    {log.details && (
                      <div className="text-sm text-gray-400 ml-7">{log.details}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(log.created_at).toLocaleString()}
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
