'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Clock, MapPin, User, RefreshCw } from 'lucide-react';
import { adminAPI, authAPI } from '../../lib/api';
import { useToast } from '../../lib/toast';
import type { ActivityLog } from '../../lib/types';

export default function AdminActivity() {
  const router = useRouter();
  const { error: showError } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

    loadLogs();
  };

  const loadLogs = async () => {
    const response = await adminAPI.getActivityLogs(100);
    if (response.data) {
      setLogs(response.data.logs || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'text-green-400';
      case 'deep analysis':
        return 'text-purple-400';
      case 'seo comparison':
        return 'text-blue-400';
      case 'keyword analysis':
        return 'text-cyan-400';
      case 'ads analysis':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
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
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Activity Logs
            </h1>
            <p className="text-gray-200 text-lg">{logs.length} activities recorded</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No activity logs yet</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-white">{log.user_email}</span>
                        <span className="text-sm text-gray-500">→</span>
                        <span className={`font-medium ${getActionColor(log.action)}`}>{log.action}</span>
                      </div>
                      {log.details && (
                        <div className="text-sm text-gray-400 ml-7 mb-2">{log.details}</div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 ml-7">
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
