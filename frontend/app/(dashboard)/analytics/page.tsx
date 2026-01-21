'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Target, Info } from 'lucide-react';
import { analyticsAPI } from '../../lib/api';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getDashboard();
      if (response.data) {
        // Handle double-nested structure from API wrapper
    const analyticsData = response.data;        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-200 text-lg mb-8">Platform activity and usage metrics</p>

        {/* Data Source Note */}
        <div className="glass rounded-2xl p-4 mb-6 border border-blue-400/30 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              <strong className="text-white">Data Source:</strong> These metrics show simulated platform activity. 
              In production, this will track real user analyses, reports generated, and system usage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">{data?.total_analyses || '1,284'}</div>
            <div className="text-sm text-gray-400 mb-1">Total Analyses</div>
            <div className="text-xs text-green-400">+12% from last month</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Target className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">{data?.competitors_tracked || '428'}</div>
            <div className="text-sm text-gray-400 mb-1">Competitors Tracked</div>
            <div className="text-xs text-green-400">+8% from last month</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">{data?.insights_generated || '3.2K'}</div>
            <div className="text-sm text-gray-400 mb-1">Insights Generated</div>
            <div className="text-xs text-green-400">+15% from last month</div>
          </div>
        </div>

        {data?.daily && (
          <div className="glass rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Daily Activity Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#7C3AED" strokeWidth={3} name="Analyses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        {data?.recent_activity && data.recent_activity.length > 0 && (
          <div className="glass rounded-2xl p-8 border border-white/20 mt-8">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {data.recent_activity.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                  <div>
                    <div className="font-bold text-white">{activity.action}</div>
                    <div className="text-sm text-gray-400">{activity.domain}</div>
                  </div>
                  <div className="text-sm text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
