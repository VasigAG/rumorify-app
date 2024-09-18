// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import getAuth for authentication

const firebaseConfig = {
    apiKey: "AIzaSyBvowjyh30EEaqD54evtREniDdl5yjhHRk",
    authDomain: "try-rumor.firebaseapp.com",
    projectId: "try-rumor",
    storageBucket: "try-rumor.appspot.com",
    messagingSenderId: "553087887753",
    appId: "1:553087887753:web:ced4f8eb974b961b9bd958",
    measurementId: "G-E9CYHJ125R"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
