import InviteContainer from '@/components/InviteContainer';

// Preview com família mockada — em produção cada família acessa /invite/[token]
const mockFamily = {
  id: 'preview',
  name: 'Família Silva',
  responsible: 'João Silva',
  phone: '',
  token: 'preview',
  status: 'pending',
  sent_at: null,
};

const mockGuests = [
  { id: '1', name: 'João Silva', type: 'adult' as const, status: 'pending' as const },
  { id: '2', name: 'Maria Silva', type: 'adult' as const, status: 'pending' as const },
  { id: '3', name: 'Pedro Silva', type: 'child' as const, status: 'pending' as const },
];

export default function Home() {
  return <InviteContainer family={mockFamily} guests={mockGuests} />;
}
