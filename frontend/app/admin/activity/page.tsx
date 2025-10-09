'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, MapPin, User } from 'lucide-react';

export default function AdminActivity() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Activity Logs
          </h1>
          <p className="text-gray-200 text-lg">Monitor all platform activity</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-white">{log.user_email}</span>
                      <span className="text-sm text-gray-400">→</span>
                      <span className="text-purple-400">{log.action}</span>
                    </div>
                    {log.details && (
                      <div className="text-sm text-gray-400 ml-7">{log.details}</div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 ml-7">
                      {log.ip_address && (
                        <div className="flex items-center gap-1">
                          🌐 {log.ip_address}
                        </div>
                      )}
                      {log.geo_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {log.geo_location}
                        </div>
                      )}
                    </div>
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
