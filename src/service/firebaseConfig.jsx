// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwYcEE762yekDgcZgzNygN31f7dxXSADA",
  authDomain: "ai-travel-planner-9c9e3.firebaseapp.com",
  projectId: "ai-travel-planner-9c9e3",
  storageBucket: "ai-travel-planner-9c9e3.appspot.com",
  messagingSenderId: "23049802696",
  appId: "1:23049802696:web:081a27afce8078598ce6fd",
  measurementId: "G-4C73RJQWFZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);

//const analytics = getAnalytics(app);