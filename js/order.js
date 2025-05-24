// js/order.js
// Initialize EmailJS with your public key
emailjs.init('pgYzRP8y_b1l2VIcg');

document.addEventListener('DOMContentLoaded', function () {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error('Firebase is not loaded. Check firebase-config.js and script includes in order.html');
        alert('Failed to initialize: Firebase not loaded. Please contact support.');
        return;
    }

    if (typeof db === 'undefined') {
        console.error('Firestore db is not defined. Ensure firebase-config.js initializes db');
        alert('Failed to initialize: Firestore not available. Please contact support.');
        return;
    }

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
        const submitButton = document.querySelector('#order-form button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        return;
    }

    console.log('Rendering cart items:', cart);

    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item" data-id="${item.id}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>UGX ${item.price.toLocaleString()} each</p>
            </div>
            <div class="item-actions">
                <div class="item-quantity">
                    <button class="quantity-decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        </div>
    `).join('');

    const total = getCartTotal();
    orderTotalElement.textContent = `UGX ${total.toLocaleString()}`;

    // Use event delegation for all button actions
    orderItemsContainer.addEventListener('click', function (e) {
        const target = e.target;
        const productId = target.dataset.id;

        if (!productId) {
            console.log('Click ignored: No productId found');
            return;
        }

        console.log('Button clicked:', { productId, action: target.className });

        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = currentCart.find(item => item.id === productId);

        if (!item) {
            console.error('Item not found in cart:', productId);
            return;
        }

        if (target.classList.contains('quantity-decrease')) {
            const newQuantity = item.quantity - 1;
            console.log(`Decreasing quantity for ${productId} from ${item.quantity} to ${newQuantity}`);
            if (newQuantity > 0) {
                updateCartItemQuantity(productId, newQuantity); // Decrease by 1, keep if > 0
            } else {
                removeFromCart(productId); // Remove only if quantity becomes 0
            }
            loadCartItems();
        } else if (target.classList.contains('quantity-increase')) {
            const newQuantity = item.quantity + 1;
            console.log(`Increasing quantity for ${productId} from ${item.quantity} to ${newQuantity}`);
            updateCartItemQuantity(productId, newQuantity); // Increase by 1
            loadCartItems();
        } else if (target.classList.contains('remove-item')) {
            console.log(`Removing item ${productId}`);
            removeFromCart(productId);
            loadCartItems();
        }
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

    orderForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('Order form submitted');

        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const address = document.getElementById('delivery-address').value.trim();
        const instructions = document.getElementById('delivery-instructions').value.trim();

        if (!validateForm(name, phone, email, address)) {
            console.log('Validation failed');
            return;
        }

        console.log('Form data:', { name, phone, email, address, instructions });

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before submitting.');
            return;
        }

        const total = getCartTotal();
        const orderId = db.collection('orders').doc().id;

        const order = {
            orderId: orderId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            customer: { name, phone, email, address, instructions },
            items: cart,
            total: total,
            status: 'pending'
        };

        try {
            console.log('Saving order to Firestore:', order);
            await db.collection('orders').doc(orderId).set(order);
            console.log('Order saved successfully');

            try {
                console.log('Sending email...');
                await sendOrderConfirmation(order);
                console.log('Email sent successfully');
            } catch (emailError) {
                console.error('Email failed, but order was saved:', emailError);
                alert('Order placed, but failed to send confirmation email: ' + emailError.message);
            }

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
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    const addressError = document.getElementById('address-error');

    nameError.textContent = '';
    phoneError.textContent = '';
    emailError.textContent = '';
    addressError.textContent = '';

    if (!name) {
        nameError.textContent = 'Name is required';
        isValid = false;
    }

    if (!phone) {
        phoneError.textContent = 'Phone number is required';
        isValid = false;
    } else if (!/^\+?\d{9,12}$/.test(phone)) {
        phoneError.textContent = 'Invalid phone number (e.g., +256123456789)';
        isValid = false;
    }

    if (!email) {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        emailError.textContent = 'Invalid email address (e.g., example@domain.com)';
        isValid = false;
    }

    if (!address) {
        addressError.textContent = 'Address is required';
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

    console.log('Email params before sending:', emailParams);

    if (!emailParams.to_email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailParams.to_email)) {
        console.error('Invalid or empty to_email in emailParams:', emailParams.to_email);
        throw new Error('Cannot send email: Recipient address is invalid or empty');
    }

    return emailjs.send('service_k8mbggr', 'template_xw2h6sm', emailParams)
        .then((response) => {
            console.log('Order confirmation email sent to:', order.customer.email, 'Response:', response.status, response.text);
            return response;
        })
        .catch((error) => {
            console.error('Failed to send email:', error.status, error.text);
            throw error;
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
    console.log('Modal displayed');
}