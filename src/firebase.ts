import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789012:web:demo1234567890'
};

if (!process.env.REACT_APP_FIREBASE_API_KEY || !process.env.REACT_APP_FIREBASE_PROJECT_ID) {
  console.warn('Firebase env variables not configured. Add your Firebase values to your .env file.')
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
