import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Sorteio } from '../types';

const SORTEIO_COLLECTION = 'sorteio';
const PARTICIPANTES_COLLECTION = 'paricipantes';

export async function getSorteioAtivo(): Promise<Sorteio | null> {
  const sorteiosRef = collection(firestore, SORTEIO_COLLECTION);
  const querySnapshot = await getDocs(sorteiosRef);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const sorteioDoc = querySnapshot.docs[0];
  const data = sorteioDoc.data();
  
  let aberto = false;
  if (data.aberto === true || data.aberto === 'true') {
    aberto = true;
  }
  
  return {
    id: sorteioDoc.id,
    status: aberto ? 'aberto' : 'fechado', // Mapeia boolean para status
    aberto: aberto,
    dataInicio: data.dataInicio?.toDate() || new Date(),
    dataFim: data.dataFim?.toDate(),
    vencedorId: data.vencedorId,
    totalParticipantes: data.totalParticipantes || 0
  };
}

export async function criarSorteio(): Promise<string> {
  const sorteiosRef = collection(firestore, SORTEIO_COLLECTION);
  const querySnapshot = await getDocs(sorteiosRef);
  
  let sorteioRef: any;
  
  if (querySnapshot.empty) {
    sorteioRef = doc(sorteiosRef);
    await setDoc(sorteioRef, {
      aberto: false, // Começa fechado
      dataInicio: Timestamp.now(),
      totalParticipantes: 0
    });
  } else {
    sorteioRef = querySnapshot.docs[0].ref;
    await updateDoc(sorteioRef, {
      aberto: false, // Fecha ao criar/resetar
      totalParticipantes: 0,
      vencedorId: null
    });
    
    const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
    const participantesSnapshot = await getDocs(participantesRef);
    const batch = writeBatch(firestore);
    
    participantesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
  
  return sorteioRef.id;
}

export async function abrirSorteio(sorteioId: string): Promise<void> {
  const sorteioRef = doc(firestore, SORTEIO_COLLECTION, sorteioId);
  await updateDoc(sorteioRef, {
    aberto: true
  });
}

export async function encerrarSorteio(sorteioId: string): Promise<void> {
  const batch = writeBatch(firestore);
  
  const sorteioRef = doc(firestore, SORTEIO_COLLECTION, sorteioId);
  batch.update(sorteioRef, {
    aberto: false,
    dataFim: Timestamp.now()
  });
  
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const participantesSnapshot = await getDocs(participantesRef);
  
  participantesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

export async function executarSorteio(sorteioId: string): Promise<string | null> {
  const participantesRef = collection(firestore, PARTICIPANTES_COLLECTION);
  const participantesSnapshot = await getDocs(participantesRef);
  
  if (participantesSnapshot.empty) {
    return null;
  }
  
  const participantes = participantesSnapshot.docs;
  const indiceVencedor = Math.floor(Math.random() * participantes.length);
  const vencedorDoc = participantes[indiceVencedor];
  const vencedorId = vencedorDoc.id;
  
  const sorteioRef = doc(firestore, SORTEIO_COLLECTION, sorteioId);
  await updateDoc(sorteioRef, {
    vencedorId: vencedorId
  });
  
  return vencedorId;
}

export async function resetarSorteio(): Promise<string> {
  const sorteioAtivo = await getSorteioAtivo();
  if (sorteioAtivo) {
    await encerrarSorteio(sorteioAtivo.id);
  }
  
  return await criarSorteio();
}
