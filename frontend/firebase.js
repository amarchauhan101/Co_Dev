// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBKlMvScAMqPpufKD4QE6qsvSXQnXCHazY",
//   authDomain: "aiproject-e8b36.firebaseapp.com",
//   projectId: "aiproject-e8b36",
//   storageBucket: "aiproject-e8b36.appspot.com",
//   messagingSenderId: "236347592280",
//   appId: "1:236347592280:web:031b2a88277bbc09ce442d",
//   measurementId: "G-W5GDPNN74Q"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKlMvScAMqPpufKD4QE6qsvSXQnXCHazY",
  authDomain: "aiproject-e8b36.firebaseapp.com",
  projectId: "aiproject-e8b36",
  storageBucket: "aiproject-e8b36.appspot.com",
  messagingSenderId: "236347592280",
  appId: "1:236347592280:web:031b2a88277bbc09ce442d",
  measurementId: "G-W5GDPNN74Q"
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Export storage and analytics
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
