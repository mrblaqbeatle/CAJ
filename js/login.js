// Firebase config from SMAU project
const firebaseConfig = {
  apiKey: "AIzaSyDcxwqjoFEUYKTwiuQKMkAfG9y9HZFPCVg",
  authDomain: "smau-256.firebaseapp.com",
  databaseURL: "https://smau-256-default-rtdb.firebaseio.com",
  projectId: "smau-256",
  storageBucket: "smau-256.firebasestorage.app",
  messagingSenderId: "76824679086",
  appId: "1:76824679086:web:c15949b85fa59e9dc3533f",
  measurementId: "G-LFRPZYFLG5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');
  const buttonText = document.getElementById('buttonText');
  const spinner = document.getElementById('spinner');
  const loginError = document.getElementById('login-error');

  auth.onAuthStateChanged(user => {
    if (user) window.location.href = 'admin.html';
  });

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateForm(email, password)) return;

    loginButton.disabled = true;
    buttonText.textContent = 'Logging in...';
    spinner.classList.remove('hidden');
    loginError.textContent = '';

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'admin.html';
    } catch (error) {
      handleLoginError(error);
    } finally {
      loginButton.disabled = false;
      buttonText.textContent = 'Login';
      spinner.classList.add('hidden');
    }
  });

  function validateForm(email, password) {
    let isValid = true;
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    loginError.textContent = '';

    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      document.getElementById('email-error').textContent = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      document.getElementById('password-error').textContent = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
      isValid = false;
    }

    return isValid;
  }

  function handleLoginError(error) {
    let message = 'Login failed. Please try again.';
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No user found with this email.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Try again later.';
        break;
    }
    loginError.textContent = message;
  }
});