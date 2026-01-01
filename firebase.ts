import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoeCw5hvj25T1FiWJ53XSFOi_YWzFgyZ4",
  authDomain: "mexoramart.firebaseapp.com",
  projectId: "mexoramart",
  storageBucket: "mexoramart.appspot.com", 
  messagingSenderId: "270620341178",
  appId: "1:270620341178:web:7a1ecf6395f45d56eaa383",
  measurementId: "G-7E9PPKJX8Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Storage removed as we are using Google Drive
// const storage = getStorage(app); 

export { app, analytics, db, auth };