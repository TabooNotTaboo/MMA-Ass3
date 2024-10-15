import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBB7gVeUzdm19fFp46ZMXbok7p3KFLlhbQ",
    authDomain: "ass3-taboo.firebaseapp.com",
    projectId: "ass3-taboo",
    storageBucket: "ass3-taboo.appspot.com",
    messagingSenderId: "854199543139",
    appId: "1:854199543139:web:72a0f99a18f8c91e225f56",
    measurementId: "G-FZ3SEBJXYN",
    databaseURL: "https://ass3-taboo-default-rtdb.asia-southeast1.firebasedatabase.app"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});


export { auth, database, db, storage };

