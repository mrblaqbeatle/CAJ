// order.js - Order Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    loadCartItems();
    
    // Initialize order form
    const orderForm = document.getElementById('order-form');
    
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const email = document.getElementById('customer-email').value;
            const address = document.getElementById('delivery-address').value;
            const instructions = document.getElementById('delivery-instructions').value;
            
            // Get cart items
            const cart = JSON.parse(localStorage.getItem('cart'));
            const total = getCartTotal();
            
            // Create order object
            const order = {
                id: Date.now(), // Simple unique ID
                date: new Date().toISOString(),
                customer: { name, phone, email, address, instructions },
                items: cart,
                total: total,
                status: 'pending'
            };
            
            // In a real implementation, this would send to a server
            console.log('Order submitted:', order);
            
            // Save order to localStorage (simulating database)
            saveOrder(order);
            
            // Clear cart
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount();
            
            // Show success message
            alert('Thank you for your order! Your order number is #' + order.id);
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
});

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalElement = document.getElementById('order-total');
    
    if (orderItemsContainer) {
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        orderItemsContainer.innerHTML = cart.map(item => `
            <div class="order-item" data-id="${item.id}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>UGX ${item.price.toLocaleString()} each</p>
                </div>
                <div class="item-actions">
                    <div class="item-quantity">
                        <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }
    
    if (orderTotalElement) {
        const total = getCartTotal();
        orderTotalElement.textContent = `UGX ${total.toLocaleString()}`;
    }
}

function saveOrder(order) {
    // Get existing orders or initialize empty array
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Add new order
    orders.push(order);
    
    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
}