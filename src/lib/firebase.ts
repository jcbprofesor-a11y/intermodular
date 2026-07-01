import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCc5i_S7nINaF021870fNFwmlHRJIHznW0",
  authDomain: "studio-2572894554-33ff8.firebaseapp.com",
  projectId: "studio-2572894554-33ff8",
  storageBucket: "studio-2572894554-33ff8.firebasestorage.app",
  messagingSenderId: "44165043870",
  appId: "1:44165043870:web:00d25e4d9f7b9ce119cd8f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-plataformadegest-1b43570d-9e16-42d3-9b3d-2aac59ccfe3d");
export const auth = getAuth(app);
