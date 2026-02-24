import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBBcUEU87UrHAF_7KIOfNOMmU5Qi3tiw54",
  authDomain: "brunoprofilepage.firebaseapp.com",
  projectId: "brunoprofilepage",
  storageBucket: "brunoprofilepage.appspot.com",
  messagingSenderId: "991761924358",
  appId: "1:991761924358:web:50222a6a75bc7d04a05e87",
  measurementId: "G-6X0F6QVQME"
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
