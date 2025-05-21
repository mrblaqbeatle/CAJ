// js/firebase-config.js
var firebaseConfig = {
  apiKey: "AIzaSyCRR-dm2pTkb09WNalKrrDCD0HFgHHH0W4",
  authDomain: "caj-website-256.firebaseapp.com",
  projectId: "caj-website-256",
  storageBucket: "caj-website-256.firebasestorage.app",
  messagingSenderId: "138259158609",
  appId: "1:138259158609:web:483bbdc82dd5abca884a70",
  measurementId: "G-DHQCJ2C0FB"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Auth check
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  }
});