// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4zb92vSBA7lgBo9RJ4-ikjwJVdpoRUTA",
  authDomain: "clean-portfolio-2981e.firebaseapp.com",
  projectId: "clean-portfolio-2981e",
  storageBucket: "clean-portfolio-2981e.appspot.com",
  messagingSenderId: "412582927326",
  appId: "1:412582927326:web:63a7f0deee81ebbe895b4f"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);