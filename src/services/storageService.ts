import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadPrintConta(file: File): Promise<string> {
  const nomeArquivo = `prints/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  const storageRef = ref(storage, nomeArquivo);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
