// js/order.js
// Initialize EmailJS with your public key
emailjs.init('pgYzRP8y_b1l2VIcg');

document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
  setupOrderForm();
});

function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderItemsContainer = document.getElementById('order-items');
  const orderTotalElement = document.getElementById('order-total');

  if (!orderItemsContainer || !orderTotalElement) {
    console.error('Order items container or total element not found');
    return;
  }

  if (cart.length === 0) {
    orderItemsContainer.innerHTML = '<p>Your cart is empty</p>';
    orderTotalElement.textContent = 'UGX 0';
    const submitButton = document.querySelector('#order-form button');
    if (submitButton) submitButton.disabled = true;
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

function setupOrderForm() {
  const orderForm = document.getElementById('order-form');
  const modal = document.getElementById('order-confirmation-modal');
  const closeModalBtn = document.getElementById('close-confirmation-modal');
  const returnHomeBtn = document.getElementById('return-home');

  if (!orderForm) {
    console.error('Order form not found. Check if #order-form exists in order.html');
    return;
  }

  orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Order form submitted'); // Debug submit event

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const address = document.getElementById('delivery-address').value.trim();
    const instructions = document.getElementById('delivery-instructions').value.trim();

    if (!validateForm(name, phone, email, address)) {
      console.log('Validation failed');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before submitting.');
      return;
    }

    const total = getCartTotal();
    const orderId = db.collection('orders').doc().id;

    const order = {
      orderId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      customer: { name, phone, email, address, instructions },
      items: cart,
      total,
      status: 'pending'
    };

    try {
      console.log('Saving order to Firestore:', order);
      await db.collection('orders').doc(orderId).set(order);
      console.log('Order saved, sending email');
      await sendOrderConfirmation(order);
      console.log('Showing confirmation modal');
      showConfirmationModal(order);
      localStorage.setItem('cart', JSON.stringify([]));
      updateCartCount();
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to submit order: ' + error.message);
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      window.location.href = 'index.html';
    });
  }

  if (returnHomeBtn) {
    returnHomeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      window.location.href = 'index.html';
    });
  }

  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        window.location.href = 'index.html';
      }
    });
  }
}

function validateForm(name, phone, email, address) {
  let isValid = true;
  document.getElementById('name-error').textContent = '';
  document.getElementById('phone-error').textContent = '';
  document.getElementById('email-error').textContent = '';
  document.getElementById('address-error').textContent = '';

  if (!name) {
    document.getElementById('name-error').textContent = 'Name is required';
    isValid = false;
  }

  if (!phone) {
    document.getElementById('phone-error').textContent = 'Phone number is required';
    isValid = false;
  } else if (!/^\+?\d{9,12}$/.test(phone)) {
    document.getElementById('phone-error').textContent = 'Invalid phone number (e.g., +256123456789)';
    isValid = false;
  }

  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    document.getElementById('email-error').textContent = 'Invalid email address';
    isValid = false;
  }

  if (!address) {
    document.getElementById('address-error').textContent = 'Address is required';
    isValid = false;
  }

  return isValid;
}

function sendOrderConfirmation(order) {
  const itemsList = order.items.map(item => 
    `${item.name} (x${item.quantity}) - UGX ${item.price.toLocaleString()}`
  ).join('\n');

  const emailParams = {
    'to_email': order.customer.email,
    'customer_name': order.customer.name,
    'order_id': order.orderId,
    'items': itemsList,
    'total': `UGX ${order.total.toLocaleString()}`,
    'address': order.customer.address,
    'phone': order.customer.phone,
    'instructions': order.customer.instructions || 'None',
    'status': order.status
  };

  return emailjs.send('service_k8mbggr', 'template_xw2h6sm', emailParams)
    .then(() => {
      console.log('Order confirmation email sent to:', order.customer.email);
    })
    .catch(error => {
      console.error('Failed to send email:', error);
      alert('Order placed, but failed to send confirmation email. Contact support.');
    });
}

function showConfirmationModal(order) {
  const modal = document.getElementById('order-confirmation-modal');
  if (!modal) {
    console.error('Confirmation modal not found');
    return;
  }
  const details = document.getElementById('confirmation-details');
  if (!details) {
    console.error('Confirmation details element not found');
    return;
  }
  details.innerHTML = `
    <p><strong>Order #${order.orderId}</strong></p>
    <p><strong>Name:</strong> ${order.customer.name}</p>
    <p><strong>Email:</strong> ${order.customer.email}</p>
    <p><strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Address:</strong> ${order.customer.address}</p>
    <p><strong>Instructions:</strong> ${order.customer.instructions || 'None'}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - UGX ${item.price.toLocaleString()}</li>`).join('')}
    </ul>
    <p><strong>Total:</strong> UGX ${order.total.toLocaleString()}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p>A confirmation email has been sent to ${order.customer.email}.</p>
  `;
  modal.style.display = 'flex';
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