import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDon3z_S33DsxZrgISCqROxmbya2-2lWYs",
  authDomain: "cobroker-ff2db.firebaseapp.com",
  projectId: "cobroker-ff2db",
  storageBucket: "cobroker-ff2db.firebasestorage.app",
  messagingSenderId: "508198462754",
  appId: "1:508198462754:web:84e2e1d5b570f51047717b",
  measurementId: "G-6FN5L22JXP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
