import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readEnv(): FirebaseEnv {
  const env = import.meta.env;
  const required: Array<[keyof FirebaseEnv, string | undefined]> = [
    ['apiKey', env.VITE_FIREBASE_API_KEY],
    ['authDomain', env.VITE_FIREBASE_AUTH_DOMAIN],
    ['projectId', env.VITE_FIREBASE_PROJECT_ID],
    ['storageBucket', env.VITE_FIREBASE_STORAGE_BUCKET],
    ['messagingSenderId', env.VITE_FIREBASE_MESSAGING_SENDER_ID],
    ['appId', env.VITE_FIREBASE_APP_ID],
  ];

  const missing = required
    .filter(([, value]) => !value)
    .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missing.join(', ')}. ` +
        'Copy frontend/.env.example to frontend/.env.local and fill in the values.',
    );
  }

  return {
    apiKey: env.VITE_FIREBASE_API_KEY as string,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: env.VITE_FIREBASE_APP_ID as string,
  };
}

const config = readEnv();

export const app: FirebaseApp = initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
