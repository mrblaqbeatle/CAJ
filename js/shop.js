// shop.js - Shop Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load all products
    loadAllProducts();
    
    // Set up category filter
    document.getElementById('category-filter').addEventListener('change', function() {
        filterProducts(this.value);
    });
});

function loadAllProducts() {
    // Mock data - in a real app, this would come from an API
    const allProducts = [
        {
            id: 1,
            name: "Premium Liquid Soap",
            description: "Advanced cleaning formula",
            price: 15000,
            category: "liquid",
            image: "images/products/soap1.jpg"
        },
        {
            id: 2,
            name: "Antibacterial Detergent",
            description: "Kills 99.9% of germs",
            price: 18000,
            category: "detergent",
            image: "images/products/detergent1.jpg"
        },
        {
            id: 3,
            name: "Fruit Scent Disinfectant",
            description: "Pleasant fragrance disinfectant",
            price: 12000,
            category: "disinfectant",
            image: "images/products/disinfectant1.jpg"
        },
        {
            id: 4,
            name: "Eco-Friendly Soap",
            description: "Biodegradable formula",
            price: 16000,
            category: "liquid",
            image: "images/products/soap2.jpg"
        },
        {
            id: 5,
            name: "Stain Remover",
            description: "Tough on stains, gentle on fabrics",
            price: 14000,
            category: "detergent",
            image: "images/products/detergent2.jpg"
        }
    ];

    // Store products in localStorage for access by other pages
    localStorage.setItem('products', JSON.stringify(allProducts));
    
    // Display all products initially
    displayProducts(allProducts);
}

function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    
    if (productGrid) {
        productGrid.innerHTML = products.map(product => `
            <div class="shop-product-card">
                <div class="shop-product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="shop-product-info">
                    <h3>${product.name}</h3>
                    <p class="shop-product-price">UGX ${product.price.toLocaleString()}</p>
                    <p>${product.description}</p>
                    <button class="add-to-cart-btn" 
                            onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function filterProducts(category) {
    const allProducts = JSON.parse(localStorage.getItem('products'));
    
    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(
            product => product.category === category
        );
        displayProducts(filteredProducts);
    }
}