'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Home, Search, Smartphone, BarChart3, Key, Settings, Users, Activity,
  LogOut, Zap, Eye, MessageSquare, TrendingUp, Sparkles
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
          setIsAdmin(data.is_admin);
        })
        .catch(() => {});
    }
  }, []);

  const mainLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/analyze', label: 'Deep Analysis', icon: Search },
    { href: '/ads-analysis', label: 'Ads Intel', icon: Smartphone },
    { href: '/seo-comparison', label: 'SEO Compare', icon: BarChart3 },
    { href: '/keyword-analysis', label: 'Keywords', icon: Key },
  ];

  const aiLinks = [
    { href: '/ai-recommendations', label: 'AI Recommendations', icon: Sparkles },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/vision-ai', label: 'Vision AI', icon: Eye },
    { href: '/sentiment', label: 'Sentiment', icon: MessageSquare },
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

  const NavLink = ({ href, label, icon: Icon }: any) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
          isActive
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
            : 'text-gray-300 hover:bg-gray-800/50'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-80 min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white p-6 flex flex-col border-r border-gray-800">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold">G</div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Grinners</h1>
            <p className="text-xs text-gray-400">Marketing Intelligence</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-1 mb-8">
        {mainLinks.map((link) => <NavLink key={link.href} {...link} />)}
      </nav>

      <div className="border-t border-gray-800 my-6"></div>
      
      <div className="space-y-1 mb-8">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
          <Zap className="w-3 h-3" />AI Tools
        </div>
        {aiLinks.map((link) => <NavLink key={link.href} {...link} />)}
      </div>

      {isAdmin && (
        <>
          <div className="border-t border-gray-800 my-6"></div>
          <div className="space-y-1 mb-8">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4">Admin</div>
            {adminLinks.map((link) => <NavLink key={link.href} {...link} />)}
          </div>
        </>
      )}

      <div className="mt-auto border-t border-gray-800 pt-6 space-y-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
            <span>Quota</span>
            <span className="text-white font-bold">{user?.quota || 15}/20</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{width: `${((user?.quota || 15)/20)*100}%`}}></div>
          </div>
        </div>
        <button onClick={logout} className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />Logout
        </button>
      </div>
    </div>
  );
}
