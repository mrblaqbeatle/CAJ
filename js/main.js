// Shared functionality across all pages

// Initialize cart if it doesn't exist
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Navigation active link highlighting
document.addEventListener('DOMContentLoaded', function() {
    // Get current page URL
    const currentPage = window.location.pathname.split('/').pop();
    
    // Find all nav links
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // Highlight the current page link
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Update cart count in header if cart element exists
    updateCartCount();
});

// Function to update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const cartCountElements = document.querySelectorAll('#cart-count, .cart-count');
    
    if (cartCountElements) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
    }
}

// Function to add product to cart
function addToCart(productId, productName, price, quantity = 1) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // If on shop page, show confirmation
    if (window.location.pathname.includes('shop.html')) {
        alert(`${productName} added to cart!`);
    }
}

// Function to remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Function to update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    
    const cart = JSON.parse(localStorage.getItem('cart'));
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
}

// Function to get cart total
function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Redirect to order page when cart button is clicked
const cartButton = document.getElementById('cart-button');
if (cartButton) {
    cartButton.addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        if (cart.length > 0) {
            window.location.href = 'order.html';
        } else {
            alert('Your cart is empty!');
        }
    });
}