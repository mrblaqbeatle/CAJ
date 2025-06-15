// js/home.js - Home Page Specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load featured products
    loadFeaturedProducts();
});

function loadFeaturedProducts() {
    const productGrid = document.getElementById('featured-products-grid');
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    loadingSpinner.id = 'featured-loading';

    if (!productGrid) {
        console.error('Featured products grid not found');
        return;
    }

    // Add loading spinner
    productGrid.innerHTML = '';
    productGrid.appendChild(loadingSpinner);

    // Check if db is defined
    if (typeof db === 'undefined') {
        console.error('Firestore db is not initialized. Check firebase-config.js');
        productGrid.innerHTML = '<p>Failed to load products. Firebase not initialized.</p>';
        return;
    }

    // Fetch latest 3 products from Firebase, mirroring shop.js approach
    db.collection('products')
        .orderBy('createdAt', 'desc')
        .limit(3)
        .onSnapshot(snapshot => {
            productGrid.removeChild(loadingSpinner); // Remove spinner on success
            productGrid.innerHTML = ''; // Clear existing content
            if (snapshot.empty) {
                productGrid.innerHTML = '<p>No featured products available.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const product = { id: doc.id, ...doc.data() };
                productGrid.innerHTML += `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description || 'No description available'}</p>
                            <button class="btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price || 0})">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `;
            });
            console.log('Featured products loaded:', snapshot.docs.map(doc => doc.data()));
        }, error => {
            productGrid.removeChild(loadingSpinner); // Remove spinner on error
            console.error('Failed to load featured products:', error.message);
            productGrid.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        });
}