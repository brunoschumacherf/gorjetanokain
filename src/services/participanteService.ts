import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query,
  where,
  Timestamp,
  increment,
  updateDoc
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Participante } from '../types';
import { cleanCPF } from '../utils/cpfValidator';
import { getSorteioAtivo } from './sorteioService';

const PARTICIPANTES_COLLECTION = 'paricipantes';
const SORTEIO_COLLECTION = 'sorteio';

export async function cpfJaCadastrado(cpf: string): Promise<boolean> {
  const cpfLimpo = cleanCPF(cpf);
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const q = query(participantesRef, where('cpf', '==', cpfLimpo));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function idJaCadastrado(idUsuario: string): Promise<boolean> {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const q = query(participantesRef, where('id', '==', idUsuario));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function cadastrarParticipante(
  dados: Omit<Participante, 'id' | 'dataCadastro'>
): Promise<void> {
  const sorteioAtivo = await getSorteioAtivo();
  if (!sorteioAtivo || !sorteioAtivo.aberto) {
    throw new Error('Sorteio não está aberto para cadastros');
  }
  
  const cpfLimpo = cleanCPF(dados.cpf);
  if (await cpfJaCadastrado(cpfLimpo)) {
    throw new Error('CPF já cadastrado neste sorteio');
  }
  
  if (await idJaCadastrado(dados.idUsuario)) {
    throw new Error('Nome do usuário já cadastrado neste sorteio');
  }
  
  try {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const novoParticipanteRef = doc(participantesRef);
  await setDoc(novoParticipanteRef, {
    nome: dados.nome,
    cpf: cpfLimpo,
    email: dados.email,
    chave_pix: dados.chavePix,
    id: dados.idUsuario,
    foto_conta: dados.fotoContaUrl || '',
    dataCadastro: Timestamp.now()
  });
  
  try {
      const sorteioRef = doc(firestore, SORTEIO_COLLECTION, sorteioAtivo.id);
      await updateDoc(sorteioRef, {
        totalParticipantes: increment(1)
      });
    } catch (updateError) {
      console.warn('Erro ao atualizar contador de participantes:', updateError);
    }
  } catch (firestoreError: any) {
    console.error('Erro ao salvar participante no Firestore:', firestoreError);
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Erro de permissão. Verifique as regras do Firestore.');
    } else if (firestoreError.message) {
      throw new Error(firestoreError.message);
    } else {
      throw new Error('Erro ao salvar participante. Tente novamente.');
    }
  }
}

export async function listarParticipantes(): Promise<Participante[]> {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const querySnapshot = await getDocs(participantesRef);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data.nome || '',
      cpf: data.cpf || '',
      email: data.email || '',
      chavePix: data.chave_pix || data.chavePix || '',
      idUsuario: data.id || data.idUsuario || '',
      dataCadastro: data.dataCadastro?.toDate() || new Date(),
      fotoContaUrl: data.foto_conta || ''
    };
  });
}

export async function buscarParticipantePorId(id: string): Promise<Participante | null> {
  const participanteRef = doc(firestore, PARTICIPANTES_COLLECTION, id);
  const participanteDoc = await getDoc(participanteRef);
  
  if (participanteDoc.exists()) {
    const data = participanteDoc.data();
    return {
      id: participanteDoc.id,
      nome: data.nome || '',
      cpf: data.cpf || '',
      email: data.email || '',
      chavePix: data.chave_pix || data.chavePix || '',
      idUsuario: data.id || data.idUsuario || '',
      dataCadastro: data.dataCadastro?.toDate() || new Date(),
      fotoContaUrl: data.foto_conta || ''
    };
  }
  
  const cpfLimpo = cleanCPF(id);
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const q = query(participantesRef, where('cpf', '==', cpfLimpo));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      nome: data.nome || '',
      cpf: data.cpf || '',
      email: data.email || '',
      chavePix: data.chave_pix || data.chavePix || '',
      idUsuario: data.id || data.idUsuario || '',
      dataCadastro: data.dataCadastro?.toDate() || new Date(),
      fotoContaUrl: data.foto_conta || ''
    };
  }
  
  return null;
}

export async function getTotalParticipantes(): Promise<number> {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const querySnapshot = await getDocs(participantesRef);
  return querySnapshot.size;
}
