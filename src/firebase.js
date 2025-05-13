
// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFkazNzog52Iie5moVZ38aC1oACBm4_ko",
  authDomain: "phishnet-cb0e7.firebaseapp.com",
  projectId: "phishnet-cb0e7",
  storageBucket: "phishnet-cb0e7.firebasestorage.app",
  messagingSenderId: "139029514079",
  appId: "1:139029514079:web:10090269ee1f0eded118ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
