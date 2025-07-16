import { initializeApp } from 'firebase/app';
import { browser } from '$app/environment';
import { getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtdZ2k5ZYwjDGgk7-3Ma5_jvM5ANZMLDI",
  authDomain: "ekolicalendar.firebaseapp.com",
  projectId: "ekolicalendar",
  storageBucket: "ekolicalendar.firebasestorage.app",
  messagingSenderId: "379559760559",
  appId: "1:379559760559:web:c52fa6d576d7cfdb223a5a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.DEV && browser) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
