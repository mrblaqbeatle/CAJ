// home.js - Home Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load featured products
    loadFeaturedProducts();
});

function loadFeaturedProducts() {
    // In a real implementation, this would fetch from an API
    // For now, we'll use mock data
    const featuredProducts = [
        {
            id: 1,
            name: "Premium Liquid Soap",
            description: "Our flagship product with advanced cleaning formula",
            price: 15000,
            image: "images/products/soap1.jpg"
        },
        {
            id: 2,
            name: "Antibacterial Detergent",
            description: "Kills 99.9% of germs while cleaning",
            price: 18000,
            image: "images/products/detergent1.jpg"
        },
        {
            id: 3,
            name: "Fruit Scent Disinfectant",
            description: "Pleasant fragrance with powerful disinfecting properties",
            price: 12000,
            image: "images/products/disinfectant1.jpg"
        }
    ];

    const productGrid = document.querySelector('.product-grid');
    
    if (productGrid) {
        productGrid.innerHTML = featuredProducts.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <button class="btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
}