// Load components
function loadComponent(id, filePath) {
  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${filePath}`);
      return res.text();
    })
    .then(data => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = data;
        
        // If this is the header component, we need to load the navbar script
        if (id === 'header') {
          // Load the navbar script
          const script = document.createElement('script');
          script.src = '/frontend/src/core/components/navbar.js';
          script.onload = () => {
            console.log("Navbar script loaded successfully");
            // Initialize auth after script is loaded
            setTimeout(() => {
              if (window.initAuth) {
                console.log("Calling initAuth after script load");
                window.initAuth();
              } else if (window.refreshAuth) {
                console.log("Calling refreshAuth after script load");
                window.refreshAuth();
              }
            }, 100);
          };
          script.onerror = () => {
            console.error("Failed to load navbar script");
          };
          document.head.appendChild(script);
        }
      }
    })
    .catch(err => console.error("Error loading component:", err));
}

// Global variables
let cartItems = [];
let selectedAddress = null;
let addresses = [];
let currentUserId = null;
let isLoggedIn = false;

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");
  initCheckout();
});

// Initialize checkout page
function initCheckout() {
  checkLoginStatus();
  loadCartItems();
  if (isLoggedIn) {
    fetchAddresses();
  } else {
    loadGuestAddresses();
  }
  renderOrderItems();
  calculateTotals();
  setupEventListeners();
}

// Check if user is logged in
function checkLoginStatus() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    isLoggedIn = !!currentUser;
    if (isLoggedIn) {
      currentUserId = currentUser.id;
    }
  } catch (e) {
    console.error("Error checking login status:", e);
    isLoggedIn = false;
  }
}

// Fetch addresses from database
async function fetchAddresses() {
  if (!isLoggedIn) return;
  
  try {
    const response = await fetch(`http://localhost:3000/customer_addresses?customer_id=${currentUserId}`);
    if (!response.ok) throw new Error("Failed to fetch addresses");
    
    const fetchedAddresses = await response.json();
    addresses = fetchedAddresses.map(addr => ({
      id: addr.id,
      label: addr.address_line2 ? `${addr.address_line1}, ${addr.address_line2}` : addr.address_line1,
      address: `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}, ${addr.city}, ${addr.state} ${addr.zip_code}`,
      is_default: addr.is_default,
      street_address: addr.address_line1,
      address_line2: addr.address_line2,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
      country: addr.country
    }));
    
    // Set default address
    const defaultAddress = addresses.find(addr => addr.is_default);
    if (defaultAddress) {
      selectedAddress = defaultAddress.id;
    } else if (addresses.length > 0) {
      selectedAddress = addresses[0].id;
    }
    
    renderAddresses();
  } catch (error) {
    console.error("Error fetching addresses:", error);
    loadGuestAddresses();
  }
}

// Load guest addresses (fallback)
function loadGuestAddresses() {
  addresses = [
    {
      id: 'guest-home',
      label: 'Home',
      address: '123 Maple Street, Anytown, CA 91234',
      is_default: true
    },
    {
      id: 'guest-work',
      label: 'Work',
      address: '456 Oak Avenue, Anytown, CA 91234',
      is_default: false
    }
  ];
  selectedAddress = 'guest-home';
  renderAddresses();
}

// Render addresses
function renderAddresses() {
  const addressContainer = document.getElementById('address-container');
  if (!addressContainer) return;
  
  addressContainer.innerHTML = addresses.map(addr => `
    <div class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors address-option ${selectedAddress === addr.id ? 'selected' : ''}" onclick="selectAddress('${addr.id}')">
      <div class="flex items-center">
        <input type="radio" id="${addr.id}-address" name="address" value="${addr.id}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" ${selectedAddress === addr.id ? 'checked' : ''}>
        <label for="${addr.id}-address" class="ml-3 block text-sm font-medium text-gray-700">
          ${addr.label}
        </label>
      </div>
      <div class="mt-2 ml-7">
        <p class="text-sm text-gray-600">${addr.address}</p>
      </div>
    </div>
  `).join('');
}

// Load cart items from localStorage
function loadCartItems() {
  try {
    const storedCart = localStorage.getItem('checkoutCart');
    if (storedCart) {
      cartItems = JSON.parse(storedCart);
    } else {
      // If no checkout cart, try to load from regular cart
      const regularCart = localStorage.getItem('guestCart');
      if (regularCart) {
        const guestCart = JSON.parse(regularCart);
        // Convert guest cart format to checkout format
        cartItems = guestCart.map(item => ({
          id: item.product_id,
          product_id: item.product_id,
          quantity: item.quantity,
          prescriptionId: item.prescriptionId,
          name: `Product ${item.product_id}`,
          price: 0,
          composition: "",
          image_url: "",
          requires_prescription: false
        }));
      }
    }
  } catch (error) {
    console.error("Error loading cart items:", error);
    cartItems = [];
  }
}

// Render order items
function renderOrderItems() {
  const container = document.getElementById('orderItems');
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <a href="../browse/browse.html" class="text-blue-600 hover:underline">Continue Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = cartItems.map(item => `
    <div class="order-item">
      <div class="order-item-image">
        ${item.image_url ? 
          `<img src="${item.image_url}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="placeholder-icon" style="display: none;"><i class="fas fa-pills text-gray-400 text-2xl"></i></div>` :
          `<div class="placeholder-icon"><i class="fas fa-pills text-gray-400 text-2xl"></i></div>`
        }
      </div>
      <div class="order-item-details">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-quantity">Quantity: ${item.quantity}</div>
      </div>
    </div>
  `).join('');
}

// Calculate and display totals
function calculateTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 30 || subtotal === 0 ? 0 : 5;
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Setup event listeners
function setupEventListeners() {
  // Address form submission
  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.addEventListener('submit', handleAddAddress);
  }

  // Address selection
  document.querySelectorAll('input[name="address"]').forEach(radio => {
    radio.addEventListener('change', function() {
      selectedAddress = this.value;
      updateAddressSelection();
    });
  });
}

// Select address
function selectAddress(addressId) {
  selectedAddress = addressId;
  document.getElementById(`${addressId}-address`).checked = true;
  updateAddressSelection();
}

// Update address selection visual state
function updateAddressSelection() {
  document.querySelectorAll('.address-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  const selectedOption = document.querySelector(`input[name="address"]:checked`).closest('.address-option');
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
}

// Add new address
function addNewAddress() {
  const modal = document.getElementById('addressModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('modal-overlay');
  }
}

// Close address modal
function closeAddressModal() {
  const modal = document.getElementById('addressModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('modal-overlay');
    // Reset form
    document.getElementById('addressForm').reset();
  }
}

// Handle add address form submission
async function handleAddAddress(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const newAddress = {
    address_id: Date.now(), // Generate unique address_id
    customer_id: isLoggedIn ? parseInt(currentUserId) : 0,
    address_line1: formData.get('streetAddress'),
    address_line2: formData.get('addressLine2') || '',
    city: formData.get('city'),
    state: formData.get('state'),
    zip_code: formData.get('zipCode'),
    country: 'USA',
    is_default: addresses.length === 0, // First address is default
    is_serviceable: true,
    created_at: new Date().toISOString()
  };
  
  try {
    if (isLoggedIn) {
      // Save to database
      const response = await fetch('http://localhost:3000/customer_addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      });
      
      if (!response.ok) throw new Error('Failed to save address');
      
      const savedAddress = await response.json();
      newAddress.id = savedAddress.id;
    } else {
      // For guest users, generate a temporary ID
      newAddress.id = 'guest-' + Date.now().toString();
    }
    
    // Add formatted address for display
    newAddress.label = newAddress.address_line2 ? `${newAddress.address_line1}, ${newAddress.address_line2}` : newAddress.address_line1;
    newAddress.address = `${newAddress.address_line1}${newAddress.address_line2 ? ', ' + newAddress.address_line2 : ''}, ${newAddress.city}, ${newAddress.state} ${newAddress.zip_code}`;
    newAddress.street_address = newAddress.address_line1;
    
    // Add to addresses array
    addresses.push(newAddress);
    
    // Add to DOM
    addAddressToDOM(newAddress);
    
    // Close modal
    closeAddressModal();
    
    // Show success message
    showNotification('Address added successfully!', 'success');
    
  } catch (error) {
    console.error('Error adding address:', error);
    showNotification('Failed to add address. Please try again.', 'error');
  }
}

// Add address to DOM
function addAddressToDOM(address) {
  const addressContainer = document.getElementById('address-container');
  if (!addressContainer) return;
  
  const addressHTML = `
    <div class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors address-option" onclick="selectAddress('${address.id}')">
      <div class="flex items-center">
        <input type="radio" id="${address.id}-address" name="address" value="${address.id}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 radio-input">
        <label for="${address.id}-address" class="ml-3 block text-sm font-medium text-gray-700">
          ${address.label}
        </label>
      </div>
      <div class="mt-2 ml-7">
        <p class="text-sm text-gray-600">${address.address}</p>
      </div>
    </div>
  `;
  
  // Insert before the "Add New Address" button
  const addButton = addressContainer.querySelector('button');
  addButton.insertAdjacentHTML('beforebegin', addressHTML);
}

// Place order
function placeOrder() {
  if (cartItems.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Show loading state
  const button = document.querySelector('.place-order-btn');
  if (button) {
    button.classList.add('loading');
    button.disabled = true;
  }
  
  // Simulate order processing
  setTimeout(() => {
    // Get selected address
    const selectedAddr = addresses.find(addr => addr.id === selectedAddress);
    if (!selectedAddr) {
      showNotification('Please select a delivery address', 'error');
      return;
    }
    
    // Create order data for payments page
    const orderData = {
      items: cartItems,
      address: selectedAddr,
      subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shipping: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 30 ? 0 : 5,
      total: 0,
      customer_id: isLoggedIn ? currentUserId : 'guest',
      created_at: new Date().toISOString()
    };
    
    orderData.total = orderData.subtotal + orderData.shipping;
    
    // Save order data for payments page
    localStorage.setItem('checkoutData', JSON.stringify(orderData));
    localStorage.setItem('selectedAddress', JSON.stringify(selectedAddr));
    
    // Clear checkout cart
    localStorage.removeItem('checkoutCart');
    
    // Show success message
    showNotification('Redirecting to payment...', 'success');
    
    // Redirect to payments page
    setTimeout(() => {
      window.location.href = '../payment/payment.html';
    }, 1500);
    
  }, 2000);
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg notification ${
    type === 'success' ? 'success-message' : 'error-message'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('addressModal');
  if (modal && event.target === modal) {
    closeAddressModal();
  }
});

// Close modal with escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeAddressModal();
  }
});

// Make functions globally available
window.selectAddress = selectAddress;
window.addNewAddress = addNewAddress;
window.closeAddressModal = closeAddressModal;
window.placeOrder = placeOrder;
