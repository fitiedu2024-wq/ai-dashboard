'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/ads-analysis', label: 'Ads Analysis', icon: '📱' },
    { href: '/seo-comparison', label: 'SEO Compare', icon: '📊' },
    { href: '/keyword-analysis', label: 'Keywords', icon: '🔑' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AI Dashboard</h1>
      </div>
      
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === link.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
