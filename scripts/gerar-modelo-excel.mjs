import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Cabeçalhos das colunas
const cabecalhos = [
  'Responsável',
  'Telefone',
  'Nome do Grupo',
  'Membro 1',
  'Tipo 1',
  'Membro 2',
  'Tipo 2',
  'Membro 3',
  'Tipo 3',
  'Membro 4',
  'Tipo 4',
  'Membro 5',
  'Tipo 5',
];

// Exemplos de dados
const exemplos = [
  ['Ana Lima',     '21999990001', 'Família Lima',     'Ana Lima',     'adulto', 'Carlos Lima',  'adulto', 'Pedro Lima',   'criança', '',              '',       '',             ''],
  ['Juliana Costa','21999990002', 'Família Costa',    'Juliana Costa','adulto', 'Marcos Costa', 'adulto', 'Sofia Costa',  'bebê',    '',              '',       '',             ''],
  ['Roberto Alves','21999990003', 'Família Alves',    'Roberto Alves','adulto', 'Patrícia Alves','adulto', 'Lucas Alves',  'criança', 'Bia Alves',    'criança','',             ''],
  ['Carla Mendes', '21999990004', 'Carla Mendes',     'Carla Mendes', 'adulto', '',              '',       '',             '',        '',              '',       '',             ''],
  ['Diego Souza',  '21999990005', 'Família Souza',    'Diego Souza',  'adulto', 'Renata Souza', 'adulto', '',             '',        '',              '',       '',             ''],
];

// Notas explicativas
const notas = [
  [],
  ['INSTRUÇÕES:'],
  ['• Responsável: nome de quem vai receber o convite no WhatsApp (obrigatório)'],
  ['• Telefone: somente números, com DDD. Ex: 21999990001 (obrigatório)'],
  ['• Nome do Grupo: como o grupo aparece no sistema. Se vazio, usa o nome do Responsável'],
  ['• Membro 1 a 5: nome de cada pessoa do grupo (pode deixar em branco se tiver menos membros)'],
  ['• Tipo: adulto | criança | bebê (exatamente assim, em minúsculas)'],
  [],
  ['• Não altere os cabeçalhos da linha 1'],
  ['• Cada linha = um grupo/família'],
  ['• Salve como .xlsx antes de importar'],
];

const wsData = [
  cabecalhos,
  ...exemplos,
  ...notas,
];

const ws = XLSX.utils.aoa_to_sheet(wsData);

// Largura das colunas
ws['!cols'] = [
  { wch: 20 }, // Responsável
  { wch: 16 }, // Telefone
  { wch: 20 }, // Nome do Grupo
  { wch: 18 }, // Membro 1
  { wch: 10 }, // Tipo 1
  { wch: 18 }, // Membro 2
  { wch: 10 }, // Tipo 2
  { wch: 18 }, // Membro 3
  { wch: 10 }, // Tipo 3
  { wch: 18 }, // Membro 4
  { wch: 10 }, // Tipo 4
  { wch: 18 }, // Membro 5
  { wch: 10 }, // Tipo 5
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Convidados');

const outPath = './public/modelo-convidados.xlsx';
XLSX.writeFile(wb, outPath);
console.log('Arquivo criado:', outPath);
