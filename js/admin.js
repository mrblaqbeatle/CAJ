// admin.js - Fixed with SMAU-style auth logic

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config (your CAJ config)
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

// EXACT SAME AUTH LOGIC AS SMAU
onAuthStateChanged(auth, user => {
  if (!user) {
    // Not logged in - redirect to login (identical to SMAU)
    window.location.href = 'login.html';
    return;
  }

  // Logged in - initialize admin panel
  initAdminPanel();
});

// EXACT SAME LOGOUT LOGIC AS SMAU
function setupLogout() {
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = 'login.html'; 
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }
}

// Your existing admin panel code - unchanged
function initAdminPanel() {
  setupLogout();
  
  // --- Your Existing Code Below ---
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.admin-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');

      if (target) {
        sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === target) {
            section.classList.add('active');
          }
        });

        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  const modal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('add-product-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const productForm = document.getElementById('product-form');
  const productList = document.querySelector('.products-list');

  openModalBtn?.addEventListener('click', () => {
    modal.style.display = 'flex';
    productForm.reset();
    document.getElementById('modal-title').textContent = 'Add Product';
  });

  closeModalBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  productForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(productForm);
    const name = formData.get('name');
    const category = formData.get('category');
    const price = formData.get('price');
    const stock = formData.get('stock');
    const image = formData.get('image');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${image || 'images/placeholder.png'}" alt="${name}">
      </div>
      <div class="product-info">
        <div class="product-name">${name}</div>
        <div class="product-category">${category}</div>
        <div class="product-price">₱${parseFloat(price).toFixed(2)}</div>
        <div class="product-stock">${stock} in stock</div>
      </div>
      <div class="product-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;
    productList.appendChild(card);
    modal.style.display = 'none';

    attachActionHandlers(card);
  });

  function attachActionHandlers(card) {
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');

    editBtn?.addEventListener('click', () => {
      const name = card.querySelector('.product-name').textContent;
      const category = card.querySelector('.product-category').textContent;
      const price = card.querySelector('.product-price').textContent.replace(/[₱,]/g, '');
      const stock = parseInt(card.querySelector('.product-stock').textContent);
      const image = card.querySelector('.product-image img').src;

      productForm.name.value = name;
      productForm.category.value = category;
      productForm.price.value = price;
      productForm.stock.value = stock;
      productForm.image.value = image;

      document.getElementById('modal-title').textContent = 'Edit Product';
      modal.style.display = 'flex';

      productForm.onsubmit = function (e) {
        e.preventDefault();
        card.remove();
        productForm.dispatchEvent(new Event('submit'));
        productForm.onsubmit = null;
      };
    });

    deleteBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this product?')) {
        card.remove();
      }
    });
  }
}