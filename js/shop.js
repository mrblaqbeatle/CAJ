// js/shop.js
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
        query = query.where('category', '==', category.toLowerCase());
    }
    const [field, direction] = sortBy.split('-');
    query = query.orderBy(field, direction === 'asc' ? 'asc' : 'desc');

    query.onSnapshot(snapshot => {
        productGrid.innerHTML = '';
        snapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            displayProduct(product);
        });
        // Reattach Add to Cart listeners after products are rendered
        attachCartButtonListeners();
        loadingSpinner.classList.remove('active');
    }, error => {
        loadingSpinner.classList.remove('active');
        showError('products-error', 'Failed to load products: ' + error.message);
    });
}

function displayProduct(product) {
    const productGrid = document.querySelector('.product-grid');
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>UGX ${parseFloat(product.price).toLocaleString()} each</p>
            <p>${product.category}</p>
            <button class="btn" data-id="${product.id}">Add to Cart</button>
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

function attachCartButtonListeners() {
    document.querySelectorAll('.btn').forEach(button => {
        // Remove existing listeners to prevent duplicates
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(event) {
    const button = event.target;
    const productId = button.dataset.id;
    const card = button.closest('.product-card');
    const name = card.querySelector('h3').textContent;
    const priceText = card.querySelector('p:nth-child(2)').textContent.replace('UGX ', '').replace(/,/g, '');
    const price = parseFloat(priceText);
    const image = card.querySelector('img').src;

    if (!productId || !name || isNaN(price) || !image) {
        console.error('Invalid product data:', { productId, name, price, image });
        alert('Failed to add item to cart. Please try again.');
        return;
    }

    addToCart(productId, name, price, 1, image);
}

function setupCartButton() {
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            window.location.href = 'order.html';
        });
    }
    updateCartCount();
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('active');
}