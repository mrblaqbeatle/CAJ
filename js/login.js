// login.js - Login Page with Firebase Authentication (ES Module)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config (your real values)
const firebaseConfig = {
  apiKey: "AIzaSyCRR-dm2pTkb09WNalKrrDCD0HFgHHH0W4",
  authDomain: "caj-website-256.firebaseapp.com",
  projectId: "caj-website-256",
  storageBucket: "caj-website-256.firebasestorage.app",
  messagingSenderId: "138259158609",
  appId: "1:138259158609:web:483bbdc82dd5abca884a70",
  measurementId: "G-DHQCJ2C0FB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('spinner');
    const loginError = document.getElementById('login-error');

    // Redirect if already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = 'admin.html';
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateForm(email, password)) return;

        loginButton.disabled = true;
        buttonText.textContent = 'Logging in...';
        spinner.classList.remove('hidden');
        loginError.textContent = '';

        try {
            await signInWithEmailAndPassword(auth, email, password);
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
        let errorMessage = 'Login failed. Please try again.';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No user found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Try again later.';
                break;
        }
        loginError.textContent = errorMessage;
    }
});