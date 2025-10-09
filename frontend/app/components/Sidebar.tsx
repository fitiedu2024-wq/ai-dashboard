'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Smartphone, 
  BarChart3, 
  Key, 
  Settings, 
  Users, 
  Activity,
  LogOut,
  Zap
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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
    { href: '/dashboard', label: 'Dashboard', icon: Home, gradient: 'from-purple-600 to-pink-600' },
    { href: '/dashboard/analyze', label: 'Deep Analysis', icon: Search, gradient: 'from-purple-600 to-pink-600' },
    { href: '/ads-analysis', label: 'Ads Intel', icon: Smartphone, gradient: 'from-purple-600 to-pink-600' },
    { href: '/seo-comparison', label: 'SEO Compare', icon: BarChart3, gradient: 'from-purple-600 to-pink-600' },
    { href: '/keyword-analysis', label: 'Keywords', icon: Key, gradient: 'from-purple-600 to-pink-600' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Panel', icon: Settings },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/activity', label: 'Activity', icon: Activity },
  ];

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="w-80 min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white p-6 flex flex-col border-r border-gray-800">
      
      {/* Logo Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="/api/placeholder/48/48" 
            alt="AI Grinners" 
            className="w-12 h-12 rounded-xl"
            style={{background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'}}
          />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Grinners
            </h1>
            <p className="text-xs text-gray-400">Marketing Intelligence</p>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="space-y-1 mb-8">
        {mainLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${link.gradient} shadow-lg shadow-purple-500/30`
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:text-purple-400'} transition-colors`} />
              <span className="font-medium">{link.label}</span>
              {isActive && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Section */}
      {isAdmin && (
        <>
          <div className="border-t border-gray-800 my-6"></div>
          <div className="space-y-1 mb-8">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Admin
            </div>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/30'
                      : 'text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:text-red-400'} transition-colors`} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* User Info */}
      <div className="mt-auto border-t border-gray-800 pt-6 space-y-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
            <span>Analysis Quota</span>
            <span className="text-white font-bold">{user?.quota || 15}/20</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{width: `${((user?.quota || 15)/20)*100}%`}}
            ></div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2 group border border-red-500/20"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
