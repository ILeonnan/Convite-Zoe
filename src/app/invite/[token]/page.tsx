import { getFamilyByTokenAction } from '@/app/actions';
import InviteContainer from '@/components/InviteContainer';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const result = await getFamilyByTokenAction(token);

  const notFound = !result.success || !result.family || !result.guests;

  if (notFound) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: '#FFFBEA' }}
      >
        <div className="max-w-sm w-full bg-white/90 backdrop-blur border border-rose-100 p-8 rounded-3xl shadow-xl text-center">
          <span className="text-5xl block mb-4">🐝</span>
          <h1 className="font-title text-2xl text-soft-brown font-bold mb-3">
            Convite Não Encontrado
          </h1>
          <p className="text-soft-brown/70 text-sm leading-relaxed mb-4">
            Não conseguimos encontrar esse convite. Verifique se o link está correto.
          </p>
          <p className="text-xs text-soft-brown/40">
            O link correto é enviado pelos pais da Zoe no formato /invite/TOKEN
          </p>
        </div>
      </main>
    );
  }

  return <InviteContainer family={result.family!} guests={result.guests!} />;
}
