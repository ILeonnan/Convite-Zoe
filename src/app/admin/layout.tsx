'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { adminLogoutAction } from '@/app/actions';

const NAV = [
  { label: 'Painel',     href: '/admin',               Icon: LayoutDashboard, exact: true },
  { label: 'Convidados', href: '/admin/families',       Icon: Users },
  { label: 'Config.',    href: '/admin/configuracoes',  Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await adminLogoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FFF8EC 0%, #FFF3DC 50%, #FFF8F0 100%)' }}>

      {/* Header */}
      <header className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(90deg, #E8891A 0%, #F5A623 50%, #FFD95A 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl drop-shadow">🐝</span>
            <div>
              <h1 className="font-title text-base font-extrabold text-white leading-tight drop-shadow-sm">Doce Colmeia</h1>
              <p className="text-[9px] text-white/70 uppercase tracking-widest font-bold">Central · Zoe 1 Aninho</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-5xl w-full mx-auto md:p-6 md:gap-6">

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <nav className="flex flex-col gap-1.5 sticky top-24">
            {NAV.map(({ label, href, Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition shadow-xs ${
                    active
                      ? 'text-white shadow-md'
                      : 'bg-white/70 border border-amber-100 text-soft-brown/80 hover:bg-amber-50/80'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, #F5A623 0%, #E8891A 100%)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 p-4 pb-28 md:pb-8 md:bg-white/80 md:border md:border-amber-100/60 md:rounded-3xl md:p-8 md:shadow-sm overflow-hidden" style={{ backdropFilter: 'blur(8px)' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 md:hidden z-40 shadow-lg"
        style={{ background: 'linear-gradient(90deg, #E8891A 0%, #F5A623 60%, #FFD95A 100%)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex">
          {NAV.map(({ label, href, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition ${
                  active ? 'text-white' : 'text-white/55'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/50'}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
