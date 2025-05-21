document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  setupFilters();
  setupCartButton();
});

function loadProducts(category = 'all', sortBy = 'createdAt-desc') {
  const productGrid = document.querySelector('.product-grid');
  const loadingSpinner = document.getElementById('products-loading');
  const errorMessage = document.getElementById('products-error');

  loadingSpinner.classList.add('active');
  errorMessage.classList.remove('active');

  let query = db.collection('products');
  if (category !== 'all') {
    query = query.where('category', '==', category);
  }
  const [field, direction] = sortBy.split('-');
  query = query.orderBy(field, direction === 'asc' ? 'asc' : 'desc');

  query.onSnapshot(snapshot => {
    productGrid.innerHTML = '';
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      displayProduct(product);
    });
    loadingSpinner.classList.remove('active');
  }, error => {
    loadingSpinner.classList.remove('active');
    showError('products-error', 'Failed to load products.');
  });
}

function displayProduct(product) {
  const productGrid = document.querySelector('.product-grid');
  const card = document.createElement('div');
  card.className = 'shop-product-card';
  card.innerHTML = `
    <div class="shop-product-image">
      <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
    </div>
    <div class="shop-product-info">
      <h3>${product.name}</h3>
      <p class="shop-product-price">UGX ${parseFloat(product.price).toLocaleString()}</p>
      <p>${product.category}</p>
      <button class="add-to-cart-btn" data-id="${product.id}" 
              onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
        Add to Cart
      </button>
    </div>
  `;
  productGrid.appendChild(card);
}

function setupFilters() {
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');

  categoryFilter.addEventListener('change', () => {
    loadProducts(categoryFilter.value, sortFilter.value);
  });

  sortFilter.addEventListener('change', () => {
    loadProducts(categoryFilter.value, sortFilter.value);
  });
}

function addToCart(productId, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, name, price, image, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = totalItems;
}

function setupCartButton() {
  document.getElementById('cart-button').addEventListener('click', () => {
    window.location.href = 'order.html';
  });
  updateCartCount();
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.add('active');
}