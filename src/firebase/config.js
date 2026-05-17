import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyYJKiglDql2661RsmR5g-ifTHKL5H7cY",
  authDomain: "mixto-cliza.firebaseapp.com",
  databaseURL: "https://mixto-cliza-default-rtdb.firebaseio.com",
  projectId: "mixto-cliza",
  storageBucket: "mixto-cliza.firebasestorage.app",
  messagingSenderId: "999027171156",
  appId: "1:999027171156:web:c9f1b8c7bfdb1c23d2b2c1",
  measurementId: "G-WYT1F3QX20"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);