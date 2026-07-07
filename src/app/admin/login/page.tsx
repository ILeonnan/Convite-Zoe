import { Lock, ArrowRight } from 'lucide-react';
import { adminLoginFormAction } from '@/app/actions';
import FlowerSway from '@/components/FlowerSway';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === 'wrong';

  return (
    <div className="min-h-screen bg-vanilla-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      <FlowerSway />

      <div className="w-full max-w-sm bg-daisy-white border border-rose-cream/45 p-8 rounded-3xl shadow-xl space-y-6 relative z-20">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-honey-yellow/20 rounded-full flex items-center justify-center mx-auto text-golden-honey">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-title text-2xl text-soft-brown font-bold">Painel dos Pais</h1>
          <p className="text-xs text-soft-brown/65">
            Apenas para a mamãe e o papai da Zoe 🐝
          </p>
        </div>

        <form action={adminLoginFormAction} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-soft-brown/75 uppercase tracking-wider mb-1">
              Senha de Acesso:
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoFocus
                className="w-full pl-10 pr-3 py-3 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl text-sm focus:outline-none focus:border-golden-honey text-soft-brown font-bold"
              />
              <Lock className="w-4 h-4 text-soft-brown/40 absolute left-3 top-3.5" />
            </div>
          </div>

          {hasError && (
            <p className="text-xs text-rose-500 text-center font-medium bg-rose-50 py-2 px-3 rounded-lg border border-rose-100">
              ⚠️ Senha incorreta! Tente novamente.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-golden-honey hover:bg-honey-yellow hover:text-soft-brown text-white font-bold rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            Entrar no Painel <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
