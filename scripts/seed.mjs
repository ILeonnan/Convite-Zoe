import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-supabase-url')) {
  console.error('Erro: Configure as credenciais do Supabase no arquivo .env.local antes de executar o seed.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Iniciando inserção de dados de teste...');

  // Delete previous items to clear DB
  console.log('Limpando dados anteriores...');
  await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const testFamilies = [
    {
      name: 'Família Silva',
      responsible: 'José Silva',
      phone: '11999998888',
      token: 'SILVA123',
      status: 'pending',
      guests: [
        { name: 'José Silva', type: 'adult' },
        { name: 'Maria Silva', type: 'adult' },
        { name: 'Pedrinho Silva', type: 'child' },
        { name: 'Bebê Silva', type: 'baby' },
      ],
    },
    {
      name: 'Família Oliveira',
      responsible: 'Ana Oliveira',
      phone: '21988887777',
      token: 'OLIVEIRA99',
      status: 'pending',
      guests: [
        { name: 'Ana Oliveira', type: 'adult' },
        { name: 'Carlos Oliveira', type: 'adult' },
      ],
    },
  ];

  for (const item of testFamilies) {
    const { data: family, error: famError } = await supabase
      .from('families')
      .insert({
        name: item.name,
        responsible: item.responsible,
        phone: item.phone,
        token: item.token,
        status: item.status,
      })
      .select()
      .single();

    if (famError || !family) {
      console.error(`Erro ao criar família ${item.name}:`, famError?.message);
      continue;
    }

    console.log(`Família ${item.name} criada! Token correspondente: ${item.token}`);

    const guestsToInsert = item.guests.map((g) => ({
      family_id: family.id,
      name: g.name,
      type: g.type,
      status: 'pending',
    }));

    const { error: guestError } = await supabase.from('guests').insert(guestsToInsert);
    if (guestError) {
      console.error(`Erro ao criar convidados para ${item.name}:`, guestError.message);
    } else {
      console.log(`Adicionados ${guestsToInsert.length} convidados para a família ${item.name}`);
    }
  }

  console.log('Banco de dados de teste populado com sucesso! 🐝');
}

seed();
