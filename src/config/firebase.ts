import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCjnNdfFZ9ciYsmr0KvMpLVB0vHQdR2hSw",
  authDomain: "fhirtoomop.firebaseapp.com",
  projectId: "fhirtoomop",
  storageBucket: "fhirtoomop.appspot.com",
  messagingSenderId: "564897597169",
  appId: "1:564897597169:web:YOUR_APP_ID" // Replace with your app ID from Firebase console
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);