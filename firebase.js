// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdZtKGmzTuDa4dp_K6bcB7LVFvkE1D7IM",
  authDomain: "inventoryapp-c4a81.firebaseapp.com",
  projectId: "inventoryapp-c4a81",
  storageBucket: "inventoryapp-c4a81.appspot.com",
  messagingSenderId: "591979134594",
  appId: "1:591979134594:web:44e981c80b023af4323e9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
