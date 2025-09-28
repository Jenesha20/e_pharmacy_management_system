const API_BASE = 'http://localhost:3000';
const ENDPOINTS = {
  products: `${API_BASE}/products`,
  inventory: `${API_BASE}/inventory`,
  categories: `${API_BASE}/categories`
};

// Global variables
let categoriesData = [];
let isEditMode = false;
let editProductId = null;

// Sidebar
function loadComponent(id, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      highlightActiveLink();
    })
    .catch(err => console.error("Error loading component:", err));
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll("#sidebar a");
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (currentPath.endsWith(href.replace("../", ""))) {
      link.classList.add("bg-blue-600", "text-white");
    } else {
      link.classList.remove("bg-blue-600", "text-white");
    }
  });
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("sidebar", "../../../core/components/sidebar.html");
  
  // Check if we're in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  editProductId = urlParams.get('edit');
  isEditMode = !!editProductId;
  
  if (isEditMode) {
    document.getElementById('pageTitle').textContent = 'Edit Medicine';
    document.getElementById('deleteBtn').classList.remove('hidden');
    loadProductData(editProductId);
  }
  
  fetchCategories();
  setupEventListeners();
});

// Fetch categories from API
async function fetchCategories() {
  try {
    const response = await fetch(ENDPOINTS.categories);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    categoriesData = await response.json();
    populateCategoryDropdown();
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Initialize with default categories if API fails
    categoriesData = [];
    populateCategoryDropdown();
  }
}

// Populate category dropdown
function populateCategoryDropdown() {
  const categorySelect = document.getElementById("medicine-category");
  
  // Clear existing options except the first one
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }
  
  // Add active categories from API
  if (categoriesData && categoriesData.length > 0) {
    categoriesData
      .filter(category => category.is_active)
      .forEach(category => {
        const option = document.createElement("option");
        option.value = category.category_id || category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
  }
  
}

// Load product data for editing
async function loadProductData(productId) {
  try {
    // Try multiple endpoint formats
    let product = null;
    
    // Try with id parameter first
    const response1 = await fetch(`${ENDPOINTS.products}?id=${productId}`);
    if (response1.ok) {
      const products = await response1.json();
      if (products.length > 0) {
        product = products[0];
      }
    }
    
    // If not found, try with product_id parameter
    if (!product) {
      const response2 = await fetch(`${ENDPOINTS.products}?product_id=${productId}`);
      if (response2.ok) {
        const products = await response2.json();
        if (products.length > 0) {
          product = products[0];
        }
      }
    }
    
    if (!product) {
      alert("Product not found!");
      window.location.href = "inventory.html";
      return;
    }
    
    populateForm(product);
  } catch (error) {
    console.error("Error fetching product data:", error);
    alert("Error loading product data: " + error.message);
  }
}

// Populate form with product data
function populateForm(product) {
  document.getElementById("medicine-name").value = product.name || "";
  document.getElementById("medicine-sku").value = product.sku || "";
  document.getElementById("medicine-category").value = product.category_id || "";
  document.getElementById("manufacturer").value = product.manufacturer || "";
  document.getElementById("composition").value = product.composition || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("dis").value = product.discount || "";
  
  // Format expiry date for input field (YYYY-MM-DD)
  if (product.expiry_date) {
    const expiryDate = new Date(product.expiry_date);
    if (!isNaN(expiryDate.getTime())) {
      document.getElementById("expiry-date").value = expiryDate.toISOString().split('T')[0];
    }
  }
  
  document.getElementById("requires-prescription").value = product.requires_prescription ? "true" : "false";
  document.getElementById("featured-product").checked = product.featured_product || false;
  document.getElementById("side-effects").value = product.side_effects || "";
  
  // Fetch inventory data for this product
  fetchInventoryData(product.product_id || product.id);
}

// Fetch inventory data for the product
async function fetchInventoryData(productId) {
  try {
    const response = await fetch(`${ENDPOINTS.inventory}?product_id=${productId}`);
    if (!response.ok) {
      return; // Silently fail, we'll use defaults
    }
    const inventory = await response.json();
    
    if (inventory.length > 0) {
      const inv = inventory[0];
      document.getElementById("quantity").value = inv.quantity_in_stock || "";
      document.getElementById("low-stock-threshold").value = inv.low_stock_threshold || 10;
    }
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    // Use default values
    document.getElementById("quantity").value = "0";
    document.getElementById("low-stock-threshold").value = "10";
  }
}

// Convert image file to base64
async function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const base64 = e.target.result;
      resolve(base64);
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    // Read as data URL to get base64
    reader.readAsDataURL(file);
  });
}

// Show notification to user
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
    type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
    'bg-gray-100 text-gray-800 border border-gray-200'
  }`;
  
  notification.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        ${type === 'info' ? 'ℹ️' : type === 'success' ? '✅' : type === 'error' ? '❌' : '📝'}
      </div>
      <div class="ml-3">
        <div class="text-sm font-medium">Image Upload</div>
        <div class="text-sm mt-1 whitespace-pre-line">${message}</div>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                class="mt-2 text-xs underline hover:no-underline">
          Dismiss
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

// Setup event listeners
function setupEventListeners() {
  // Photo Upload Preview
  const photoInput = document.getElementById("medicine-photos");
  const previewContainer = document.getElementById("photo-preview");

  photoInput.addEventListener("change", async () => {
    previewContainer.innerHTML = "";
    const file = photoInput.files[0];
    if (file) {
      try {
        // Convert to base64 and show preview
        const base64Image = await convertToBase64(file);
        const img = document.createElement("img");
        img.src = base64Image;
        img.classList.add("w-20", "h-20", "object-cover", "rounded-md", "border");
        img.alt = "Image preview";
        previewContainer.appendChild(img);
        
        // Show file info
        const info = document.createElement("div");
        info.className = "text-xs text-gray-500 mt-1";
        info.textContent = `Base64 ready (${Math.round(base64Image.length / 1024)}KB)`;
        previewContainer.appendChild(info);
      } catch (error) {
        console.error('Error previewing image:', error);
        previewContainer.innerHTML = '<div class="text-red-500 text-sm">Error loading image preview</div>';
      }
    }
  });

  // Form Submission
  const form = document.getElementById("medicineForm");
  form.addEventListener("submit", handleFormSubmit);
  
  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = "inventory.html";
  });
  
  // Delete button
  document.getElementById("deleteBtn").addEventListener("click", handleDeleteProduct);
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  // Handle image upload - convert to base64
  const photoInput = document.getElementById("medicine-photos");
  let imageUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="; // Default base64 image
  
  if (photoInput.files && photoInput.files[0]) {
    try {
      // Convert uploaded image to base64
      const base64Image = await convertToBase64(photoInput.files[0]);
      imageUrl = base64Image;
      
      console.log('Image converted to base64 successfully');
      console.log('Base64 length:', base64Image.length);
      
      // Show success notification
      showNotification('✅ Image converted to base64 and ready to save!', 'success');
    } catch (error) {
      console.error('Error converting image to base64:', error);
      showNotification('❌ Error processing image. Using default image.', 'error');
    }
  }

  // Get form data
  const formData = {
    name: document.getElementById("medicine-name").value.trim(),
    sku: document.getElementById("medicine-sku").value.trim(),
    category_id: document.getElementById("medicine-category").value,
    manufacturer: document.getElementById("manufacturer").value.trim(),
    composition: document.getElementById("composition").value.trim(),
    description: document.getElementById("description").value.trim(),
    price: parseFloat(document.getElementById("price").value),
    expiry_date: document.getElementById("expiry-date").value,
    requires_prescription: document.getElementById("requires-prescription").value === "true",
    featured_product: document.getElementById("featured-product").checked,
    side_effects: document.getElementById("side-effects").value.trim(),
    image_url: imageUrl,
    discount:parseFloat(document.getElementById("dis").value)
  };

  // Handle category - if it's a string (new category), use it as is
  const categoryValue = document.getElementById("medicine-category").value;
  if (isNaN(categoryValue)) {
    formData.category_id = categoryValue; // String category name
  } else {
    formData.category_id = parseInt(categoryValue); // Numeric category ID
  }

  // Inventory data
  const inventoryData = {
    quantity_in_stock: parseInt(document.getElementById("quantity").value) || 0,
    low_stock_threshold: parseInt(document.getElementById("low-stock-threshold").value) || 10,
    last_restocked_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    if (isEditMode) {
      // Update existing product
      await updateProduct(editProductId, formData, inventoryData);
      alert("Product updated successfully!");
    } else {
      // Create new product
      await createProduct(formData, inventoryData);
      alert("Product created successfully!");
    }
    
    // Redirect to inventory page
    window.location.href = "inventory.html";
  } catch (error) {
    console.error("Error saving product:", error);
    alert("Error saving product. Please try again.");
  }
}

// Create new product
async function createProduct(productData, inventoryData) {
  try {
    // First, get all products to determine the next ID
    const productsResponse = await fetch(ENDPOINTS.products);
    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }
    const allProducts = await productsResponse.json();
    
    // Generate a new product ID
    const nextProductId = Math.max(...allProducts.map(p => p.product_id || p.id), 0) + 1;
    
    // Create the product
    const productResponse = await fetch(ENDPOINTS.products, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...productData,
        id: nextProductId,
        product_id: nextProductId,
        created_at: new Date().toISOString()
      })
    });
    
    if (!productResponse.ok) {
      throw new Error('Failed to create product');
    }
    
    const product = await productResponse.json();
    
    // Get all inventory items to determine the next ID
    const inventoryResponse = await fetch(ENDPOINTS.inventory);
    if (!inventoryResponse.ok) {
      throw new Error('Failed to fetch inventory');
    }
    const allInventory = await inventoryResponse.json();
    
    // Generate a new inventory ID
    const nextInventoryId = Math.max(...allInventory.map(i => i.inventory_id || i.id), 0) + 1;
    
    // Then, create inventory record
    const inventoryCreateResponse = await fetch(ENDPOINTS.inventory, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...inventoryData,
        id: nextInventoryId,
        inventory_id: nextInventoryId,
        product_id: nextProductId
      })
    });
    
    if (!inventoryCreateResponse.ok) {
      throw new Error('Failed to create inventory record');
    }
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

// Update existing product
async function updateProduct(productId, productData, inventoryData) {
  try {
    // First, find the product to update
    let productToUpdate = null;
    let productEndpoint = null;
    
    // Try to find product by id
    const response1 = await fetch(`${ENDPOINTS.products}?id=${productId}`);
    if (response1.ok) {
      const products = await response1.json();
      if (products.length > 0) {
        productToUpdate = products[0];
        productEndpoint = `${ENDPOINTS.products}/${productToUpdate.id}`;
      }
    }
    
    // If not found by id, try by product_id
    if (!productToUpdate) {
      const response2 = await fetch(`${ENDPOINTS.products}?product_id=${productId}`);
      if (response2.ok) {
        const products = await response2.json();
        if (products.length > 0) {
          productToUpdate = products[0];
          productEndpoint = `${ENDPOINTS.products}/${productToUpdate.id}`;
        }
      }
    }
    
    if (!productToUpdate) {
      throw new Error('Product not found for updating');
    }
    
    // Update the product
    const productResponse = await fetch(productEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!productResponse.ok) {
      throw new Error('Failed to update product');
    }
    
    // Then, update inventory record
    const inventoryResponse = await fetch(`${ENDPOINTS.inventory}?product_id=${productId}`);
    if (!inventoryResponse.ok) {
      throw new Error('Failed to fetch inventory');
    }
    const inventoryRecords = await inventoryResponse.json();
    
    if (inventoryRecords.length > 0) {
      const inventoryId = inventoryRecords[0].id;
      await fetch(`${ENDPOINTS.inventory}/${inventoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inventoryData)
      });
    } else {
      // Create inventory record if it doesn't exist
      await fetch(ENDPOINTS.inventory, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...inventoryData,
          product_id: parseInt(productId)
        })
      });
    }
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw error;
  }
}

// Handle product deletion
async function handleDeleteProduct() {
  if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
    return;
  }
  
  try {
    // Find the product to delete
    let productToDelete = null;
    
    const response1 = await fetch(`${ENDPOINTS.products}?id=${editProductId}`);
    if (response1.ok) {
      const products = await response1.json();
      if (products.length > 0) {
        productToDelete = products[0];
      }
    }
    
    if (!productToDelete) {
      const response2 = await fetch(`${ENDPOINTS.products}?product_id=${editProductId}`);
      if (response2.ok) {
        const products = await response2.json();
        if (products.length > 0) {
          productToDelete = products[0];
        }
      }
    }
    
    if (!productToDelete) {
      throw new Error('Product not found for deletion');
    }
    
    // Delete the product
    const productResponse = await fetch(`${ENDPOINTS.products}/${productToDelete.id}`, {
      method: 'DELETE'
    });
    
    if (!productResponse.ok) {
      throw new Error('Failed to delete product');
    }
    
    // Delete inventory records for this product
    const inventoryResponse = await fetch(`${ENDPOINTS.inventory}?product_id=${editProductId}`);
    if (inventoryResponse.ok) {
      const inventoryRecords = await inventoryResponse.json();
      
      for (const inventory of inventoryRecords) {
        await fetch(`${ENDPOINTS.inventory}/${inventory.id}`, {
          method: 'DELETE'
        });
      }
    }
    
    alert("Product deleted successfully!");
    window.location.href = "inventory.html";
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Error deleting product. Please try again.");
  }
}