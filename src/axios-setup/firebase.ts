import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDb_lEAA1_Y2zKEIPvrkjteqNjWZZLMR78',
  authDomain: 'boiler-plate-react.firebaseapp.com',
  projectId: 'boiler-plate-react',
  storageBucket: 'boiler-plate-react.appspot.com',
  messagingSenderId: '305277373638',
  appId: '1:305277373638:web:5554261a7e0eb34642dbc7',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Failed:', error);
    throw error;
  }
};

export { auth, app };
