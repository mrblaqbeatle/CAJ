// js/auth-guard.js
// Relies on firebase-config.js for Firebase initialization
const auth = firebase.auth();

// Redirect to login if not authenticated
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  }
});