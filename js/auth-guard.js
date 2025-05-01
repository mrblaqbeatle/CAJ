// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDcxwqjoFEUYKTwiuQKMkAfG9y9HZFPCVg",
  authDomain: "smau-256.firebaseapp.com",
  databaseURL: "https://smau-256-default-rtdb.firebaseio.com",
  projectId: "smau-256",
  storageBucket: "smau-256.appspot.com",
  messagingSenderId: "76824679086",
  appId: "1:76824679086:web:c15949b85fa59e9dc3533f"
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