// js/main.js
// Shared functionality across all pages

// Migrate cart data from productId to id
(function migrateCartData() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.map(item => {
        if (item.productId && !item.id) {
            return { ...item, id: item.productId, productId: undefined };
        }
        return item;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
})();

// Initialize cart if it doesn't exist
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Navigation active link highlighting
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    updateCartCount();
});

// Function to update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count, .cart-count');
    cartCountElements.forEach(el => {
        if (el) el.textContent = totalItems;
    });
    console.log('Cart count updated:', totalItems);
}

// Function to add product to cart
function addToCart(productId, productName, price, quantity = 1, image = '') {
    if (!productId) {
        console.error('Invalid productId:', productId);
        throw new Error('Product ID is required');
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name: productName, price: price, quantity: quantity, image: image });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    console.log('Cart after adding item:', cart);
    // Removed alert since badge updates are sufficient
}

// Function to remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    console.log('Cart after removing item:', cart);
}

// Function to update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            cart = cart.filter(item => item.id !== productId); // Remove only if quantity becomes 0
        } else {
            item.quantity = newQuantity;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        console.log('Cart after updating quantity:', cart);
    } else {
        console.error('Item not found for quantity update:', productId);
    }
}

// Function to get cart total
function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Redirect to order page when cart button is clicked
const cartButton = document.getElementById('cart-button');
if (cartButton) {
    cartButton.addEventListener('click', function () {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            window.location.href = 'order.html';
        } else {
            alert('Your cart is empty!');
        }
    });
}