// js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  setupLogout();
  setupNavigation();
  setupProductModal();
  setupOrderModal();
  loadProducts();
  loadOrders();
  setupNewOrdersBadge();
});

function setupLogout() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = 'login.html';
    }).catch(error => {
      console.error('Logout failed:', error);
      showError('products-error', 'Logout failed. Please try again.');
    });
  });
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar a');
  const sections = document.querySelectorAll('.admin-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(target).classList.add('active');
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');
      if (target === 'products') loadProducts();
      if (target === 'orders') {
        loadOrders();
        // Clear badge when viewing Orders
        const badge = document.getElementById('new-orders-badge');
        badge.textContent = '0';
        badge.classList.add('hidden');
      }
    });
  });
}

function setupNewOrdersBadge() {
  const badge = document.getElementById('new-orders-badge');
  db.collection('orders')
    .where('status', '==', 'pending')
    .onSnapshot(snapshot => {
      let pendingCount = snapshot.size;
      badge.textContent = pendingCount;
      badge.classList.toggle('hidden', pendingCount === 0);
    }, error => {
      console.error('Failed to fetch pending orders:', error);
    });
}

function loadProducts(sortBy = 'createdAt-desc') {
  const productList = document.querySelector('.products-list');
  const loadingSpinner = document.getElementById('products-loading');
  const errorMessage = document.getElementById('products-error');

  loadingSpinner.classList.add('active');
  errorMessage.classList.remove('active');

  let query = db.collection('products');
  const [field, direction] = sortBy.split('-');
  query = query.orderBy(field, direction === 'asc' ? 'asc' : 'desc');

  query.onSnapshot(snapshot => {
    productList.innerHTML = '';
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      createProductCard(product);
    });
    loadingSpinner.classList.remove('active');
  }, error => {
    loadingSpinner.classList.remove('active');
    showError('products-error', 'Failed to load products: ' + error.message);
  });

  document.getElementById('sort-filter').addEventListener('change', (e) => {
    loadProducts(e.target.value);
  });
}

function createProductCard(product) {
  const productList = document.querySelector('.products-list');
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', product.id);
  card.innerHTML = `
    <div class="product-image"><img src="${product.image || 'images/placeholder.png'}" alt="${product.name}"></div>
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-price">UGX ${parseFloat(product.price).toLocaleString()}</div>
      <div class="product-stock">${product.stock} in stock</div>
      <div class="product-added">Added: ${new Date(product.createdAt.toDate()).toLocaleDateString()}</div>
    </div>
    <div class="product-actions">
      <button class="edit-btn" aria-label="Edit Product">Edit</button>
      <button class="delete-btn" aria-label="Delete Product">Delete</button>
    </div>
  `;
  productList.appendChild(card);
}

function setupProductModal() {
  const modal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('add-product-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const productForm = document.getElementById('product-form');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  const imageError = document.getElementById('image-error');
  const modalLoading = document.getElementById('modal-loading');
  const modalError = document.getElementById('modal-error');

  openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    productForm.reset();
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    imageError.style.display = 'none';
    modalError.style.display = 'none';
    document.getElementById('modal-title').textContent = 'Add Product';
    productForm.dataset.mode = 'add';
  });

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    imagePreview.innerHTML = '';
    imageError.style.display = 'none';
    modalError.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      imagePreview.innerHTML = '';
      imageError.style.display = 'none';
      modalError.style.display = 'none';
    }
  });

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    imageError.style.display = 'none';
    imagePreview.style.display = 'none';
    imagePreview.innerHTML = '';

    if (file) {
      if (!file.type.startsWith('image/')) {
        imageError.textContent = 'Please select an image file (e.g., JPG, PNG).';
        imageError.style.display = 'block';
        imageInput.value = '';
        return;
      }
      if (file.size > 500 * 1024) {
        imageError.textContent = 'Image file size must be less than 500 KB.';
        imageError.style.display = 'block';
        imageInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        imagePreview.appendChild(img);
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    modalLoading.classList.add('active');
    modalError.classList.remove('active');

    const formData = new FormData(productForm);
    const name = formData.get('name');
    const category = formData.get('category');
    const price = parseFloat(formData.get('price'));
    const stock = parseInt(formData.get('stock'));
    const file = imageInput.files[0];

    const productData = {
      name,
      category,
      price,
      stock,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const mode = productForm.dataset.mode;
    const productId = mode === 'edit' ? productForm.dataset.id : db.collection('products').doc().id;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        productData.image = e.target.result;
        saveProduct(productId, productData, mode);
      };
      reader.readAsDataURL(file);
    } else {
      productData.image = mode === 'edit' ? productForm.dataset.image : 'images/placeholder.png';
      saveProduct(productId, productData, mode);
    }
  });

  function saveProduct(productId, productData, mode) {
    const operation = mode === 'edit' ? db.collection('products').doc(productId).set(productData) : db.collection('products').doc(productId).set(productData);
    operation
      .then(() => {
        modalLoading.classList.remove('active');
        modal.style.display = 'none';
        productForm.reset();
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
      })
      .catch(error => {
        modalLoading.classList.remove('active');
        showError('modal-error', 'Failed to save product: ' + error.message);
      });
  }
}

function loadOrders(status = 'all') {
  const orderList = document.querySelector('.orders-list');
  const loadingSpinner = document.getElementById('orders-loading');
  const errorMessage = document.getElementById('orders-error');

  loadingSpinner.classList.add('active');
  errorMessage.classList.remove('active');

  let query = db.collection('orders').orderBy('createdAt', 'desc');
  if (status !== 'all') {
    query = query.where('status', '==', status);
  }

  query.onSnapshot(snapshot => {
    orderList.innerHTML = '';
    snapshot.forEach(doc => {
      const order = { id: doc.id, ...doc.data() };
      createOrderCard(order);
    });
    loadingSpinner.classList.remove('active');
  }, error => {
    loadingSpinner.classList.remove('active');
    showError('orders-error', 'Failed to load orders: ' + error.message);
  });

  document.getElementById('status-filter').addEventListener('change', (e) => {
    loadOrders(e.target.value);
  });
}

function createOrderCard(order) {
  const orderList = document.querySelector('.orders-list');
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', order.id);
  card.innerHTML = `
    <div class="product-info">
      <div class="product-name">Order #${order.orderId}</div>
      <div class="product-category">Customer: ${order.customer.name}</div>
      <div class="product-price">Total: UGX ${order.total.toLocaleString()}</div>
      <div class="product-stock">Status: ${order.status}</div>
      <div class="product-added">Date: ${new Date(order.createdAt.toDate()).toLocaleString()}</div>
      <div class="product-details">
        <p><strong>Items:</strong></p>
        <ul>
          ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - UGX ${item.price.toLocaleString()}</li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="product-actions">
      <button class="edit-btn view-order-btn" aria-label="View Order">View</button>
    </div>
  `;
  orderList.appendChild(card);
}

function setupOrderModal() {
  const modal = document.getElementById('order-modal');
  const closeModalBtn = document.getElementById('order-close-modal');
  const updateStatusBtn = document.getElementById('update-order-status');
  const modalLoading = document.getElementById('order-modal-loading');
  const modalError = document.getElementById('order-modal-error');

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  updateStatusBtn.addEventListener('click', () => {
    const orderId = modal.dataset.id;
    const newStatus = document.getElementById('order-status').value;
    modalLoading.classList.add('active');
    modalError.classList.remove('active');

    db.collection('orders').doc(orderId).update({ status: newStatus })
      .then(() => {
        modalLoading.classList.remove('active');
        modal.style.display = 'none';
      })
      .catch(error => {
        modalLoading.classList.remove('active');
        showError('order-modal-error', 'Failed to update status: ' + error.message);
      });
  });
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn') && !e.target.classList.contains('view-order-btn')) {
    const card = e.target.closest('.product-card');
    const productId = card.dataset.id;
    const modal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const modalLoading = document.getElementById('modal-loading');
    const modalError = document.getElementById('modal-error');

    modalLoading.classList.add('active');
    modalError.classList.remove('active');
    db.collection('products').doc(productId).get().then(doc => {
      modalLoading.classList.remove('active');
      if (doc.exists) {
        const product = doc.data();
        productForm.name.value = product.name;
        productForm.category.value = product.category;
        productForm.price.value = product.price;
        productForm.stock.value = product.stock;
        productForm.dataset.image = product.image;
        productForm.dataset.id = productId;
        productForm.dataset.mode = 'edit';
        document.getElementById('image-preview').innerHTML = product.image ? `<img src="${product.image}" alt="Preview">` : '';
        document.getElementById('image-preview').style.display = product.image ? 'block' : 'none';
        document.getElementById('image-error').style.display = 'none';
        document.getElementById('modal-title').textContent = 'Edit Product';
        modal.style.display = 'flex';
      }
    }).catch(error => {
      modalLoading.classList.remove('active');
      showError('modal-error', 'Failed to load product: ' + error.message);
    });
  }

  if (e.target.classList.contains('delete-btn')) {
    const card = e.target.closest('.product-card');
    const productId = card.dataset.id;
    if (confirm('Are you sure you want to delete this product?')) {
      const modalLoading = document.getElementById('modal-loading');
      const modalError = document.getElementById('modal-error');
      modalLoading.classList.add('active');
      modalError.classList.remove('active');
      db.collection('products').doc(productId).delete().then(() => {
        modalLoading.classList.remove('active');
      }).catch(error => {
        modalLoading.classList.remove('active');
        showError('modal-error', 'Failed to delete product: ' + error.message);
      });
    }
  }

  if (e.target.classList.contains('view-order-btn')) {
    const card = e.target.closest('.product-card');
    const orderId = card.dataset.id;
    const modal = document.getElementById('order-modal');
    const details = document.getElementById('order-details');
    const statusSelect = document.getElementById('order-status');
    const modalLoading = document.getElementById('order-modal-loading');
    const modalError = document.getElementById('order-modal-error');

    modalLoading.classList.add('active');
    modalError.classList.remove('active');
    db.collection('orders').doc(orderId).get().then(doc => {
      modalLoading.classList.remove('active');
      if (doc.exists) {
        const order = doc.data();
        details.innerHTML = `
          <p><strong>Order #${order.orderId}</strong></p>
          <p><strong>Customer:</strong> ${order.customer.name}</p>
          <p><strong>Phone:</strong> ${order.customer.phone}</p>
          <p><strong>Email:</strong> ${order.customer.email || 'N/A'}</p>
          <p><strong>Address:</strong> ${order.customer.address}</p>
          <p><strong>Instructions:</strong> ${order.customer.instructions || 'None'}</p>
          <p><strong>Total:</strong> UGX ${order.total.toLocaleString()}</p>
          <p><strong>Items:</strong></p>
          <ul>
            ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - UGX ${item.price.toLocaleString()}</li>`).join('')}
          </ul>
        `;
        statusSelect.value = order.status;
        modal.dataset.id = orderId;
        modal.style.display = 'flex';
      }
    }).catch(error => {
      modalLoading.classList.remove('active');
      showError('order-modal-error', 'Failed to load order: ' + error.message);
    });
  }
});

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.add('active');
}