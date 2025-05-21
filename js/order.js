// order.js - Order Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
  setupOrderForm();
});

function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderItemsContainer = document.getElementById('order-items');
  const orderTotalElement = document.getElementById('order-total');

  if (orderItemsContainer) {
    if (cart.length === 0) {
      orderItemsContainer.innerHTML = '<p>Your cart is empty</p>';
      orderTotalElement.textContent = 'UGX 0';
      document.querySelector('#order-form button').disabled = true;
      return;
    }

    orderItemsContainer.innerHTML = cart.map(item => `
      <div class="order-item" data-id="${item.productId}">
        <div class="item-info">
          <h3>${item.name}</h3>
          <p>UGX ${item.price.toLocaleString()} each</p>
        </div>
        <div class="item-actions">
          <div class="item-quantity">
            <button class="quantity-decrease" data-id="${item.productId}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-increase" data-id="${item.productId}">+</button>
          </div>
          <button class="remove-item" data-id="${item.productId}">Remove</button>
        </div>
      </div>
    `).join('');

    const total = getCartTotal();
    orderTotalElement.textContent = `UGX ${total.toLocaleString()}`;

    document.querySelectorAll('.quantity-decrease').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.dataset.id;
        updateCartItemQuantity(productId, cart.find(item => item.productId === productId).quantity - 1);
        loadCartItems();
      });
    });

    document.querySelectorAll('.quantity-increase').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.dataset.id;
        updateCartItemQuantity(productId, cart.find(item => item.productId === productId).quantity + 1);
        loadCartItems();
      });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.dataset.id;
        removeFromCart(productId);
        loadCartItems();
      });
    });
  }
}

function setupOrderForm() {
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('customer-name').value;
      const phone = document.getElementById('customer-phone').value;
      const email = document.getElementById('customer-email').value;
      const address = document.getElementById('delivery-address').value;
      const instructions = document.getElementById('delivery-instructions').value;

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const total = getCartTotal();

      const order = {
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        customer: { name, phone, email, address, instructions },
        items: cart,
        total,
        status: 'pending'
      };

      db.collection('orders').add(order)
        .then(() => {
          localStorage.setItem('cart', JSON.stringify([]));
          updateCartCount();
          alert('Thank you for your order! You will receive a confirmation soon.');
          window.location.href = 'index.html';
        })
        .catch(error => {
          alert('Failed to submit order: ' + error.message);
        });
    });
  }
}

function getCartTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function updateCartItemQuantity(productId, newQuantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(item => item.productId === productId);
  if (item) {
    if (newQuantity <= 0) {
      cart = cart.filter(item => item.productId !== productId);
    } else {
      item.quantity = newQuantity;
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.productId !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = totalItems;
}