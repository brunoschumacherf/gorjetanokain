import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query,
  orderBy,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Vencedor, Participante } from '../types';
import { buscarParticipantePorId } from './participanteService';

const VENCEDORES_COLLECTION = 'vencedores';

export async function salvarVencedor(
  participanteId: string,
  sorteioId: string
): Promise<string> {
  const participante = await buscarParticipantePorId(participanteId);
  
  if (!participante) {
    throw new Error('Participante não encontrado');
  }
  
  const vencedoresRef = collection(firestore, VENCEDORES_COLLECTION);
  const novoVencedorRef = doc(vencedoresRef);
  
  await setDoc(novoVencedorRef, {
    participanteId: participanteId,
    participanteNome: participante.nome,
    participanteCpf: participante.cpf,
    participanteEmail: participante.email,
    participanteWhatsapp: participante.whatsapp,
    participanteChavePix: participante.chavePix,
    participanteIdUsuario: participante.idUsuario,
    participanteFotoConta: participante.fotoContaUrl || '',
    sorteioId: sorteioId,
    dataSorteio: Timestamp.now()
  });
  
  return novoVencedorRef.id;
}

export async function listarVencedores(): Promise<Vencedor[]> {
  const vencedoresRef = collection(firestore, VENCEDORES_COLLECTION);
  const q = query(vencedoresRef, orderBy('dataSorteio', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const vencedores: Vencedor[] = [];
  
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    
    // Buscar dados completos do participante
    const participante = await buscarParticipantePorId(data.participanteId);
    
    if (participante) {
      vencedores.push({
        id: docSnap.id,
        participante: participante,
        dataSorteio: data.dataSorteio?.toDate() || new Date(),
        sorteioId: data.sorteioId || ''
      });
    } else {
      // Se não encontrar o participante, usar dados salvos
      const participanteFallback: Participante = {
        id: data.participanteId || '',
        nome: data.participanteNome || '',
        cpf: data.participanteCpf || '',
        email: data.participanteEmail || '',
        whatsapp: data.participanteWhatsapp || '',
        chavePix: data.participanteChavePix || '',
        idUsuario: data.participanteIdUsuario || '',
        dataCadastro: new Date(),
        fotoContaUrl: data.participanteFotoConta || ''
      };
      
      vencedores.push({
        id: docSnap.id,
        participante: participanteFallback,
        dataSorteio: data.dataSorteio?.toDate() || new Date(),
        sorteioId: data.sorteioId || ''
      });
    }
  }
  
  return vencedores;
}

export async function getTotalVencedores(): Promise<number> {
  const vencedoresRef = collection(firestore, VENCEDORES_COLLECTION);
  const querySnapshot = await getDocs(vencedoresRef);
  return querySnapshot.size;
}

export async function getIdsParticipantesJaSorteados(): Promise<string[]> {
  const vencedoresRef = collection(firestore, VENCEDORES_COLLECTION);
  const querySnapshot = await getDocs(vencedoresRef);
  return querySnapshot.docs
    .map((d) => d.data().participanteId as string)
    .filter(Boolean);
}

export async function limparVencedores(): Promise<void> {
  const vencedoresRef = collection(firestore, VENCEDORES_COLLECTION);
  const querySnapshot = await getDocs(vencedoresRef);
  const batch = writeBatch(firestore);
  
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}
