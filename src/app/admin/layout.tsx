'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, MessageSquare, BarChart3, Download, LogOut } from 'lucide-react';
import { adminLogoutAction } from '@/app/actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Painel', href: '/admin', icon: <Home className="w-4 h-4" /> },
    { label: 'Famílias', href: '/admin/families', icon: <Users className="w-4 h-4" /> },
    { label: 'Cápsula', href: '/admin/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Métricas', href: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Exportar', href: '/admin/export', icon: <Download className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await adminLogoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-vanilla-white flex flex-col">
      {/* Header */}
      <header className="bg-daisy-white border-b border-rose-cream/40 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐝</span>
            <div>
              <h1 className="font-title text-base md:text-lg font-bold text-soft-brown">Doce Colmeia</h1>
              <p className="text-[10px] text-soft-brown/50 uppercase tracking-widest font-bold">Zoe 1 Aninho</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-500 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Main Content & Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-golden-honey text-white shadow-xs'
                      : 'bg-daisy-white border border-rose-cream/20 text-soft-brown/85 hover:bg-rose-cream/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-daisy-white border border-rose-cream/35 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
