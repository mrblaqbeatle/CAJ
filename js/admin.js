document.addEventListener('DOMContentLoaded', () => {
  setupLogout();
  setupNavigation();
  setupProductModal();
  loadProducts();
});

function setupLogout() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = 'login.html';
    }).catch(error => {
      console.error('Logout failed:', error);
      showError('products-error', 'Logout failed. Please try again.');
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

function loadProducts(sortBy = 'createdAt-desc') {
  const productList = document.querySelector('.products-list');
  const loadingSpinner = document.getElementById('products-loading');
  const errorMessage = document.getElementById('products-error');

  loadingSpinner.classList.add('active');
  errorMessage.classList.remove('active');

  let query = db.collection('products');
  const [field, direction] = sortBy.split('-');
  query = query.orderBy(field, direction === 'asc' ? 'asc' : 'desc');

  query.onSnapshot(snapshot => {
    productList.innerHTML = '';
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      createProductCard(product);
    });
    loadingSpinner.classList.remove('active');
  }, error => {
    loadingSpinner.classList.remove('active');
    showError('products-error', 'Failed to load products.');
  });

  document.getElementById('sort-filter').addEventListener('change', (e) => {
    loadProducts(e.target.value);
  });
}

function createProductCard(product) {
  const productList = document.querySelector('.products-list');
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', product.id);
  card.innerHTML = `
    <div class="product-image"><img src="${product.image || 'images/placeholder.png'}" alt="${product.name}"></div>
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-price">UGX ${parseFloat(product.price).toLocaleString()}</div>
      <div class="product-stock">${product.stock} in stock</div>
      <div class="product-added">Added: ${new Date(product.createdAt.toDate()).toLocaleDateString()}</div>
    </div>
    <div class="product-actions">
      <button class="edit-btn" aria-label="Edit Product">Edit</button>
      <button class="delete-btn" aria-label="Delete Product">Delete</button>
    </div>
  `;
  productList.appendChild(card);
  attachActionHandlers(card);
}

function setupProductModal() {
  const modal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('add-product-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const productForm = document.getElementById('product-form');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  const imageError = document.getElementById('image-error');
  const modalLoading = document.getElementById('modal-loading');
  const modalError = document.getElementById('modal-error');

  openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    productForm.reset();
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    imageError.style.display = 'none';
    modalError.style.display = 'none';
    document.getElementById('modal-title').textContent = 'Add Product';
    productForm.onsubmit = null;
  });

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    imagePreview.innerHTML = '';
    imageError.style.display = 'none';
    modalError.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      imagePreview.innerHTML = '';
      imageError.style.display = 'none';
      modalError.style.display = 'none';
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
      if (file.size > 500 * 1024) { // 500 KB limit
        imageError.textContent = 'Image file size must be less than 500 KB.';
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
    modalLoading.classList.add('active');
    modalError.classList.remove('active');

    const formData = new FormData(productForm);
    const name = formData.get('name');
    const category = formData.get('category');
    const price = parseFloat(formData.get('price'));
    const stock = parseInt(formData.get('stock'));
    const file = imageInput.files[0];

    const productData = {
      name,
      category,
      price,
      stock,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        productData.image = e.target.result; // Base64 string
        saveProduct(db.collection('products').doc().id, productData);
      };
      reader.readAsDataURL(file);
    } else {
      productData.image = 'images/placeholder.png';
      saveProduct(db.collection('products').doc().id, productData);
    }
  });

  function saveProduct(productId, productData) {
    db.collection('products').doc(productId).set(productData)
      .then(() => {
        modalLoading.classList.remove('active');
        modal.style.display = 'none';
        productForm.reset();
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
      })
      .catch(error => {
        modalLoading.classList.remove('active');
        showError('modal-error', 'Failed to save product.');
      });
  }

  function attachActionHandlers(card) {
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const productId = card.getAttribute('data-id');

    editBtn.addEventListener('click', () => {
      modalLoading.classList.add('active');
      modalError.classList.remove('active');
      db.collection('products').doc(productId).get().then(doc => {
        modalLoading.classList.remove('active');
        if (doc.exists) {
          const product = doc.data();
          productForm.name.value = product.name;
          productForm.category.value = product.category;
          productForm.price.value = product.price;
          productForm.stock.value = product.stock;
          imagePreview.innerHTML = product.image ? `<img src="${product.image}" alt="Preview">` : '';
          imagePreview.style.display = product.image ? 'block' : 'none';
          imageError.style.display = 'none';
          document.getElementById('modal-title').textContent = 'Edit Product';
          modal.style.display = 'flex';

          productForm.onsubmit = function (e) {
            e.preventDefault();
            modalLoading.classList.add('active');
            modalError.classList.remove('active');

            const formData = new FormData(productForm);
            const updatedData = {
              name: formData.get('name'),
              category: formData.get('category'),
              price: parseFloat(formData.get('price')),
              stock: parseInt(formData.get('stock')),
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (imageInput.files[0]) {
              const reader = new FileReader();
              reader.onload = (e) => {
                updatedData.image = e.target.result;
                updateProduct(productId, updatedData);
              };
              reader.readAsDataURL(imageInput.files[0]);
            } else {
              updatedData.image = product.image || 'images/placeholder.png';
              updateProduct(productId, updatedData);
            }
          };
        }
      }).catch(error => {
        modalLoading.classList.remove('active');
        showError('modal-error', 'Failed to load product.');
      });
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this product?')) {
        modalLoading.classList.add('active');
        modalError.classList.remove('active');
        db.collection('products').doc(productId).delete().then(() => {
          modalLoading.classList.remove('active');
        }).catch(error => {
          modalLoading.classList.remove('active');
          showError('modal-error', 'Failed to delete product.');
        });
      }
    });
  }

  function updateProduct(productId, updatedData) {
    db.collection('products').doc(productId).set(updatedData).then(() => {
      modalLoading.classList.remove('active');
      modal.style.display = 'none';
      productForm.reset();
      imagePreview.innerHTML = '';
      imagePreview.style.display = 'none';
      productForm.onsubmit = null;
    }).catch(error => {
      modalLoading.classList.remove('active');
      showError('modal-error', 'Failed to update product.');
    });
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('active');
  }
}