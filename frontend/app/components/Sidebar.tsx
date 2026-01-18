'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home, Search, Smartphone, BarChart3, Key, Settings, Users, Activity,
  LogOut, Zap, Eye, MessageSquare, TrendingUp, Sparkles, Menu, X, Moon, Sun,
  Building2, Target, Calendar, Rocket, Waves, SearchCheck
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useToast } from '../lib/toast';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const mainLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/analyze', label: 'Deep Analysis', icon: Search },
    { href: '/ads-analysis', label: 'Ads Intel', icon: Smartphone },
    { href: '/seo-comparison', label: 'SEO Compare', icon: BarChart3 },
    { href: '/keyword-analysis', label: 'Keywords', icon: Key },
  ];

  const aiLinks = [
    { href: '/ai-recommendations', label: 'AI Insights', icon: Sparkles },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/vision-ai', label: 'Vision AI', icon: Eye },
    { href: '/sentiment', label: 'Sentiment', icon: MessageSquare },
  ];

  const advancedLinks = [
    { href: '/vertex-search', label: 'Marketing Hub', icon: SearchCheck },
    { href: '/business-intel', label: 'Business Intel', icon: Building2 },
    { href: '/keyword-intent', label: 'Keyword Intent', icon: Target },
    { href: '/content-calendar', label: 'Content Calendar', icon: Calendar },
    { href: '/growth-roadmap', label: 'Growth Roadmap', icon: Rocket },
    { href: '/blue-ocean', label: 'Blue Ocean', icon: Waves },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Panel', icon: Settings },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/activity', label: 'Activity', icon: Activity },
  ];

  const handleLogout = () => {
    success('Goodbye!', 'You have been logged out');
    setTimeout(() => logout(), 500);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Future: Implement actual theme switching
  };

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
          isActive
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25'
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
        onClick={() => setIsMobileOpen(false)}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold shadow-lg">
            G
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Grinners
            </h1>
            <p className="text-xs text-gray-400">Marketing Intelligence</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 mb-6">
        {mainLinks.map((link) => <NavLink key={link.href} {...link} />)}
      </nav>

      <div className="border-t border-white/10 my-6"></div>

      {/* AI Tools */}
      <div className="space-y-1 mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
          <Zap className="w-3 h-3" />AI Tools
        </div>
        {aiLinks.map((link) => <NavLink key={link.href} {...link} />)}
      </div>

      <div className="border-t border-white/10 my-6"></div>

      {/* Advanced Marketing */}
      <div className="space-y-1 mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
          <Sparkles className="w-3 h-3" />Advanced
        </div>
        {advancedLinks.map((link) => <NavLink key={link.href} {...link} />)}
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <>
          <div className="border-t border-white/10 my-6"></div>
          <div className="space-y-1 mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4">Admin</div>
            {adminLinks.map((link) => <NavLink key={link.href} {...link} />)}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-white/10 pt-6 space-y-4">
        {/* User Info */}
        {user && (
          <div className="px-4 py-2 text-sm text-gray-400">
            <p className="truncate font-medium text-white">{user.email}</p>
            <p className="text-xs">{isAdmin ? 'Administrator' : 'User'}</p>
          </div>
        )}

        {/* Quota */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-sm text-gray-400 mb-2 flex items-center justify-between">
            <span>Analysis Quota</span>
            <span className="text-white font-bold">{user?.quota || 0}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{width: `${Math.min(((user?.quota || 0) / 20) * 100, 100)}%`}}
            />
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-white"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900/90 backdrop-blur-xl rounded-xl border border-white/10 text-white"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white p-6 flex flex-col border-r border-white/10 transform transition-transform duration-300 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white p-6 flex-col border-r border-white/10">
        <SidebarContent />
      </div>
    </>
  );
}
