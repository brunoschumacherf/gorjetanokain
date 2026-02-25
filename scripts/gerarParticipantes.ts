import { collection, doc, setDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../src/config/firebase';

const PARTICIPANTES_COLLECTION = 'paricipantes';

const nomes = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza',
  'Juliana Ferreira', 'Ricardo Alves', 'Fernanda Lima', 'Bruno Martins', 'Camila Rocha',
  'Lucas Pereira', 'Isabela Gomes', 'Rafael Dias', 'Beatriz Carvalho', 'Thiago Ribeiro',
  'Larissa Araújo', 'Gabriel Monteiro', 'Mariana Barbosa', 'Felipe Nunes', 'Amanda Teixeira',
  'Rodrigo Castro', 'Patricia Mendes', 'Gustavo Freitas', 'Vanessa Cardoso', 'Diego Ramos',
  'Renata Moura', 'André Correia', 'Tatiana Azevedo', 'Marcelo Pires', 'Priscila Machado'
];

const emails = [
  'joao.silva@email.com', 'maria.santos@email.com', 'pedro.oliveira@email.com', 'ana.costa@email.com', 'carlos.souza@email.com',
  'juliana.ferreira@email.com', 'ricardo.alves@email.com', 'fernanda.lima@email.com', 'bruno.martins@email.com', 'camila.rocha@email.com',
  'lucas.pereira@email.com', 'isabela.gomes@email.com', 'rafael.dias@email.com', 'beatriz.carvalho@email.com', 'thiago.ribeiro@email.com',
  'larissa.araujo@email.com', 'gabriel.monteiro@email.com', 'mariana.barbosa@email.com', 'felipe.nunes@email.com', 'amanda.teixeira@email.com',
  'rodrigo.castro@email.com', 'patricia.mendes@email.com', 'gustavo.freitas@email.com', 'vanessa.cardoso@email.com', 'diego.ramos@email.com',
  'renata.moura@email.com', 'andre.correia@email.com', 'tatiana.azevedo@email.com', 'marcelo.pires@email.com', 'priscila.machado@email.com'
];

function gerarCPF(): string {
  const n1 = Math.floor(Math.random() * 9);
  const n2 = Math.floor(Math.random() * 9);
  const n3 = Math.floor(Math.random() * 9);
  const n4 = Math.floor(Math.random() * 9);
  const n5 = Math.floor(Math.random() * 9);
  const n6 = Math.floor(Math.random() * 9);
  const n7 = Math.floor(Math.random() * 9);
  const n8 = Math.floor(Math.random() * 9);
  const n9 = Math.floor(Math.random() * 9);
  
  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  
  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  
  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}

function gerarChavePix(cpf: string, index: number): string {
  const tipos = ['cpf', 'email', 'telefone', 'aleatoria'];
  const tipo = tipos[index % tipos.length];
  
  switch (tipo) {
    case 'cpf':
      return cpf;
    case 'email':
      return emails[index];
    case 'telefone':
      return `+551199999${String(index).padStart(4, '0')}`;
    case 'aleatoria':
      return `chave${index}@pix.com`;
    default:
      return cpf;
  }
}

async function verificarCPFExistente(cpf: string): Promise<boolean> {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const q = query(participantesRef, where('cpf', '==', cpf));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function verificarIdExistente(id: string): Promise<boolean> {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const q = query(participantesRef, where('id', '==', id));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function gerarParticipantes() {
  console.log('🚀 Iniciando geração de participantes...\n');
  
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  let criados = 0;
  let erros = 0;
  
  for (let i = 0; i < 30; i++) {
    try {
      let cpf = gerarCPF();
      let tentativasCPF = 0;
      
      while (await verificarCPFExistente(cpf) && tentativasCPF < 10) {
        cpf = gerarCPF();
        tentativasCPF++;
      }
      
      if (tentativasCPF >= 10) {
        console.log(`⚠️  Não foi possível gerar CPF único para ${nomes[i]}`);
        erros++;
        continue;
      }
      
      const idUsuario = `user${String(i + 1).padStart(3, '0')}`;
      let tentativasId = 0;
      let idFinal = idUsuario;
      
      while (await verificarIdExistente(idFinal) && tentativasId < 10) {
        idFinal = `user${String(i + 1).padStart(3, '0')}_${tentativasId}`;
        tentativasId++;
      }
      
      if (tentativasId >= 10) {
        console.log(`⚠️  Não foi possível gerar ID único para ${nomes[i]}`);
        erros++;
        continue;
      }
      
      const chavePix = gerarChavePix(cpf, i);
      const novoParticipanteRef = doc(participantesRef);
      
      await setDoc(novoParticipanteRef, {
        nome: nomes[i],
        cpf: cpf,
        email: emails[i],
        chave_pix: chavePix,
        id: idFinal,
        dataCadastro: Timestamp.now()
      });
      
      criados++;
      console.log(`✅ ${criados}/30 - ${nomes[i]} cadastrado (CPF: ${cpf}, ID: ${idFinal})`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      erros++;
      console.error(`❌ Erro ao cadastrar ${nomes[i]}:`, error.message);
    }
  }
  
  console.log(`\n✨ Processo concluído!`);
  console.log(`✅ Participantes criados: ${criados}`);
  console.log(`❌ Erros: ${erros}`);
}

gerarParticipantes()
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
