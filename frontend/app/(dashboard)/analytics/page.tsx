'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Target } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-200 text-lg mb-8">Platform insights & metrics</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">1,284</div>
            <div className="text-sm text-gray-400">Total Analyses</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Target className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">428</div>
            <div className="text-sm text-gray-400">Competitors Tracked</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">3.2K</div>
            <div className="text-sm text-gray-400">Insights Generated</div>
          </div>
        </div>

        {data?.daily && (
          <div className="glass rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Daily Activity</h3>
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
                <Line type="monotone" dataKey="total" stroke="#7C3AED" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
