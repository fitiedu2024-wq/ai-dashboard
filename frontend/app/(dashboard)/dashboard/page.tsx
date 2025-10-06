'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load recent jobs
      const jobsRes = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      setRecentJobs(jobsData.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">AI Marketing Intelligence</h1>
      <p className="text-gray-600 mb-8">Deep competitive analysis powered by Gemini AI</p>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/analyze" className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition">
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-bold text-lg">Deep Analysis</div>
          <div className="text-sm opacity-90">Multi-page site crawl</div>
        </Link>
        
        <Link href="/ads-analysis" className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition">
          <div className="text-3xl mb-2">📱</div>
          <div className="font-bold text-lg">Ads Intelligence</div>
          <div className="text-sm opacity-90">Cross-platform ads</div>
        </Link>
        
        <Link href="/seo-comparison" className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition">
          <div className="text-3xl mb-2">📊</div>
          <div className="font-bold text-lg">SEO Compare</div>
          <div className="text-sm opacity-90">Side-by-side metrics</div>
        </Link>
        
        <Link href="/keyword-analysis" className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition">
          <div className="text-3xl mb-2">🔑</div>
          <div className="font-bold text-lg">Keyword Gaps</div>
          <div className="text-sm opacity-90">Find opportunities</div>
        </Link>
      </div>

      {/* Recent Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Analysis</h2>
        
        {recentJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-xl mb-2">No analysis yet</p>
            <p>Start your first deep competitive analysis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.slice(0, 10).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{job.domain}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                  {job.status === 'completed' && (
                    <button className="text-blue-600 hover:underline">View</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
