'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ email: 'admin@grinners.com', quota: 15 });
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', color: 'from-blue-500 to-blue-600' },
    { href: '/dashboard/analyze', label: 'Deep Analysis', icon: '🔍', color: 'from-purple-500 to-purple-600' },
    { href: '/ads-analysis', label: 'Ads Intel', icon: '📱', color: 'from-pink-500 to-pink-600' },
    { href: '/seo-comparison', label: 'SEO Compare', icon: '📊', color: 'from-green-500 to-green-600' },
    { href: '/keyword-analysis', label: 'Keywords', icon: '🔑', color: 'from-orange-500 to-orange-600' },
  ];

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">Marketing Intelligence</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === link.href
                ? `bg-gradient-to-r ${link.color} shadow-lg shadow-${link.color.split('-')[1]}-500/50`
                : 'text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-700 pt-6 space-y-4">
        <div className="glass rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-2">Analysis Quota</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                   style={{width: `${(user.quota/20)*100}%`}}></div>
            </div>
            <span className="text-sm font-bold">{user.quota}/20</span>
          </div>
        </div>

        <div className="text-sm text-gray-400 italic px-2">
          "Data is the new oil, but insights are the new gold."
        </div>

        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
