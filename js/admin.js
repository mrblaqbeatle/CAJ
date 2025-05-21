document.addEventListener('DOMContentLoaded', () => {
  setupLogout();
  setupNavigation();
  setupProductModal();
});

function setupLogout() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = 'login.html';
    }).catch(error => {
      console.error('Logout failed:', error);
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
    });
  });
}

function setupProductModal() {
  const modal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('add-product-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const productForm = document.getElementById('product-form');
  const productList = document.querySelector('.products-list');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  const imageError = document.getElementById('image-error');

  openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    productForm.reset();
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    imageError.style.display = 'none';
    document.getElementById('modal-title').textContent = 'Add Product';
    productForm.onsubmit = null;
  });

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    imageError.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      imagePreview.innerHTML = '';
      imagePreview.style.display = 'none';
      imageError.style.display = 'none';
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        imageError.textContent = 'Image file size must be less than 5MB.';
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
    const formData = new FormData(productForm);
    const name = formData.get('name');
    const category = formData.get('category');
    const price = formData.get('price');
    const stock = formData.get('stock');
    const file = imageInput.files[0];
    let image = 'images/placeholder.png';

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        image = e.target.result; // Base64 data URL for now
        createProductCard(name, category, price, stock, image);
      };
      reader.readAsDataURL(file);
    } else {
      createProductCard(name, category, price, stock, image);
    }
  });

  function createProductCard(name, category, price, stock, image) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image"><img src="${image}" alt="${name}"></div>
      <div class="product-info">
        <div class="product-name">${name}</div>
        <div class="product-category">${category}</div>
        <div class="product-price">₱${parseFloat(price).toFixed(2)}</div>
        <div class="product-stock">${stock} in stock</div>
      </div>
      <div class="product-actions">
        <button class="edit-btn" aria-label="Edit Product">Edit</button>
        <button class="delete-btn" aria-label="Delete Product">Delete</button>
      </div>
    `;
    productList.appendChild(card);
    modal.style.display = 'none';
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    imageError.style.display = 'none';
    attachActionHandlers(card);
  }

  function attachActionHandlers(card) {
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => {
      const name = card.querySelector('.product-name').textContent;
      const category = card.querySelector('.product-category').textContent;
      const price = card.querySelector('.product-price').textContent.replace(/[₱,]/g, '');
      const stock = parseInt(card.querySelector('.product-stock').textContent);
      const image = card.querySelector('.product-image img').src;

      productForm.name.value = name;
      productForm.category.value = category;
      productForm.price.value = price;
      productForm.stock.value = stock;
      imagePreview.innerHTML = `<img src="${image}" alt="Preview">`;
      imagePreview.style.display = 'block';
      imageError.style.display = 'none';

      document.getElementById('modal-title').textContent = 'Edit Product';
      modal.style.display = 'flex';

      productForm.onsubmit = function (e) {
        e.preventDefault();
        card.remove();
        productForm.dispatchEvent(new Event('submit'));
        productForm.onsubmit = null;
      };
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this product?')) {
        card.remove();
      }
    });
  }
}