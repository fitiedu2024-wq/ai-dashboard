'use client';

import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Don't show sidebar on admin pages (they have their own layout)
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
