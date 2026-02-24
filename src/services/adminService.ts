import { 
  collection, 
  getDocs, 
  query,
  where
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const ADMIN_USERS_COLLECTION = 'admin_users';

/**
 * Verifica credenciais do administrador
 */
export async function verificarAdmin(user: string, password: string): Promise<boolean> {
  try {
    const adminUsersRef = collection(firestore, ADMIN_USERS_COLLECTION);
    const q = query(
      adminUsersRef, 
      where('user', '==', user),
      where('password', '==', password)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
}

/**
 * Lista todos os usuários admin
 */
export async function listarAdmins(): Promise<Array<{ user: string; id: string }>> {
  try {
    const adminUsersRef = collection(firestore, ADMIN_USERS_COLLECTION);
    const querySnapshot = await getDocs(adminUsersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      user: doc.data().user || ''
    }));
  } catch (error) {
    console.error('Erro ao listar admins:', error);
    return [];
  }
}
