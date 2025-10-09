'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          setUser(data);
          setIsAdmin(data.email === '3ayoty@gmail.com');
        });
    }
  }, []);

  const mainLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', gradient: 'from-blue-500 to-cyan-500' },
    { href: '/dashboard/analyze', label: 'Deep Analysis', icon: '🔍', gradient: 'from-purple-500 to-pink-500' },
    { href: '/ads-analysis', label: 'Ads Intel', icon: '📱', gradient: 'from-pink-500 to-rose-500' },
    { href: '/seo-comparison', label: 'SEO Compare', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
    { href: '/keyword-analysis', label: 'Keywords', icon: '🔑', gradient: 'from-orange-500 to-amber-500' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin', icon: '⚙️', gradient: 'from-red-500 to-pink-500' },
    { href: '/admin/users', label: 'Users', icon: '👥', gradient: 'from-indigo-500 to-purple-500' },
    { href: '/admin/activity', label: 'Activity', icon: '📈', gradient: 'from-cyan-500 to-blue-500' },
  ];

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="w-80 min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            AI Grinners
          </h1>
          <p className="text-sm text-gray-400">Marketing Intelligence</p>
        </div>
        
        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                pathname === link.href
                  ? `bg-gradient-to-r ${link.gradient} shadow-lg scale-105`
                  : 'text-gray-300 hover:bg-white/10 hover:scale-105'
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {link.icon}
              </span>
              <span className="font-medium">{link.label}</span>
              {pathname === link.href && (
                <span className="ml-auto w-2 h-2 bg-white rounded-full animate-ping"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-700 my-6"></div>
            <div className="space-y-2 mb-8">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>⚡</span>
                Admin Panel
              </div>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    pathname === link.href
                      ? `bg-gradient-to-r ${link.gradient} shadow-lg scale-105`
                      : 'text-gray-300 hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* User Info & Quota */}
        <div className="border-t border-gray-700 pt-6 space-y-4 mt-auto">
          <div className="glass rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-2">Analysis Quota</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{width: `${(user?.quota || 15)/20*100}%`}}
                ></div>
              </div>
              <span className="text-sm font-bold">{user?.quota || 15}/20</span>
            </div>
          </div>

          <div className="text-sm text-gray-400 italic px-2">
            💡 "Turn data into decisions"
          </div>

          <button
            onClick={logout}
            className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:rotate-12 transition-transform">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
