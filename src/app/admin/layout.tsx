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
    <div className="min-h-screen bg-vanilla-white flex flex-col">

      {/* Header */}
      <header className="bg-daisy-white border-b border-rose-cream/40 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐝</span>
            <div>
              <h1 className="font-title text-base font-bold text-soft-brown leading-tight">Doce Colmeia</h1>
              <p className="text-[9px] text-soft-brown/45 uppercase tracking-widest font-bold">Central · Zoe 1 Aninho</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-500 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-5xl w-full mx-auto md:p-6 md:gap-6">

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-44 shrink-0">
          <nav className="flex flex-col gap-1 sticky top-24">
            {NAV.map(({ label, href, Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? 'bg-golden-honey text-white shadow-xs'
                      : 'bg-daisy-white border border-rose-cream/20 text-soft-brown/80 hover:bg-rose-cream/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 p-4 pb-28 md:pb-8 md:bg-daisy-white md:border md:border-rose-cream/35 md:rounded-3xl md:p-8 md:shadow-xs overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 md:hidden bg-daisy-white/95 backdrop-blur border-t border-rose-cream/30 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex">
          {NAV.map(({ label, href, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition ${
                  active ? 'text-golden-honey' : 'text-soft-brown/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-golden-honey' : 'text-soft-brown/35'}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
