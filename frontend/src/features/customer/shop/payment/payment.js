// Payment page functionality
// Note: Import statements require a local server to work properly
// For now, we'll define the functions locally to avoid import issues

let orderData = null;
let cartItems = [];
let selectedAddress = null;

// API functions (copied from orders-api.js to avoid import issues)
const API_BASE_URL = 'http://localhost:3000';

// Generate order number
function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
}

// Calculate order totals
function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const shipping = subtotal > 30 ? 0 : 5; // Free shipping over $30
  const total = subtotal + shipping;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

// Create order (simplified version)
async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    // Return mock data if API fails
    return {
      id: Date.now(),
      ...orderData
    };
  }
}

// Create order items (simplified version)
async function createOrderItems(orderItems) {
  try {
    const response = await fetch(`${API_BASE_URL}/order_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderItems)
    });
    
    if (!response.ok) throw new Error('Failed to create order items');
    return await response.json();
  } catch (error) {
    console.error('Error creating order items:', error);
    // Return mock data if API fails
    return orderItems;
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadHeader();
  loadFooter();
  loadOrderData();
  setupPaymentMethodHandlers();
});

// Load header and footer
async function loadHeader() {
  try {
    const response = await fetch('../../core/components/navbar.html');
    const html = await response.text();
    document.getElementById('header').innerHTML = html;
    
    // Load navbar script
    const script = document.createElement('script');
    script.src = '../../core/components/navbar.js';
    document.head.appendChild(script);
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch('../../core/components/footer.html');
    const html = await response.text();
    document.getElementById('footer').innerHTML = html;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

// Load order data from localStorage
function loadOrderData() {
  console.log('Loading order data...');
  
  // Get order data from checkout
  const checkoutData = localStorage.getItem('checkoutData');
  console.log('Checkout data:', checkoutData);
  
  if (checkoutData) {
    try {
      orderData = JSON.parse(checkoutData);
      cartItems = orderData.items || [];
      selectedAddress = orderData.address;
      console.log('Loaded from checkout data:', { orderData, cartItems, selectedAddress });
    } catch (error) {
      console.error('Error parsing checkout data:', error);
      loadFallbackData();
    }
  } else {
    loadFallbackData();
  }
  
  console.log('Final data:', { cartItems, selectedAddress });
  displayOrderSummary();
  displayDeliveryAddress();
}

// Load fallback data
function loadFallbackData() {
  console.log('Loading fallback data...');
  cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');
  console.log('Fallback data loaded:', { cartItems, selectedAddress });
  
  // If no data found, create some test data for demo
  if (cartItems.length === 0 && Object.keys(selectedAddress).length === 0) {
    console.log('No data found, creating test data...');
    createTestData();
  }
}

// Create test data for demo
function createTestData() {
  cartItems = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      price: 5.99,
      quantity: 2,
      image_url: '../../../core/api/images/azithral.jpeg',
      composition: 'Paracetamol (500mg)',
      requires_prescription: true
    },
    {
      id: '2',
      name: 'Cough Syrup',
      price: 8.99,
      quantity: 1,
      image_url: '../../../core/api/images/alcof.jpg',
      composition: 'Dextromethorphan HBr',
      requires_prescription: false
    }
  ];
  
  selectedAddress = {
    label: 'Home',
    address: '123 Main Street, Springfield, IL 62701'
  };
  
  console.log('Test data created:', { cartItems, selectedAddress });
}

// Display order summary
function displayOrderSummary() {
  console.log('Displaying order summary...', { cartItems });
  
  const orderItemsContainer = document.getElementById('orderItems');
  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shipping');
  const totalElement = document.getElementById('total');
  
  console.log('Elements found:', { orderItemsContainer, subtotalElement, shippingElement, totalElement });
  
  if (!orderItemsContainer || !subtotalElement || !shippingElement || !totalElement) {
    console.error('Required elements not found');
    return;
  }
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 30 ? 0 : 5;
  const total = subtotal + shipping;
  
  // Display items
  orderItemsContainer.innerHTML = cartItems.map(item => `
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <img src="${item.image_url || item.image || ''}" 
               alt="${item.name}" 
               class="w-12 h-12 object-cover rounded"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="placeholder-icon" style="display: ${item.image_url || item.image ? 'none' : 'flex'};">
            <i class="fas fa-pills text-gray-400 text-xl"></i>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-800">${item.name}</h4>
          <p class="text-xs text-gray-500">Qty: ${item.quantity}</p>
        </div>
      </div>
      <span class="text-sm font-medium text-gray-800">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  
  // Display totals
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  shippingElement.textContent = `$${shipping.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
}

// Display delivery address
function displayDeliveryAddress() {
  console.log('Displaying delivery address...', { selectedAddress });
  
  const addressContainer = document.getElementById('deliveryAddress');
  console.log('Address container found:', addressContainer);
  
  if (!addressContainer || !selectedAddress) {
    console.error('Address container or selectedAddress not found');
    return;
  }
  
  addressContainer.innerHTML = `
    <div>
      <p class="font-medium">${selectedAddress.label || 'Address'}</p>
      <p>${selectedAddress.address || 'No address selected'}</p>
    </div>
  `;
  
  console.log('Address displayed successfully');
}

// Setup payment method handlers
function setupPaymentMethodHandlers() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      // Hide all payment details
      document.getElementById('upiDetails').classList.add('hidden');
      document.getElementById('cardDetails').classList.add('hidden');
      document.getElementById('codDetails').classList.add('hidden');
      document.getElementById('qrDetails').classList.add('hidden');
      
      // Show selected payment details
      const selectedMethod = this.value;
      switch(selectedMethod) {
        case 'upi':
          document.getElementById('upiDetails').classList.remove('hidden');
          break;
        case 'card':
          document.getElementById('cardDetails').classList.remove('hidden');
          break;
        case 'cod':
          document.getElementById('codDetails').classList.remove('hidden');
          break;
        case 'qr':
          document.getElementById('qrDetails').classList.remove('hidden');
          break;
      }
    });
  });
}

// Process payment
function processPayment() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  // Validate payment details based on method
  if (!validatePaymentDetails(selectedMethod)) {
    return;
  }
  
  // Show loading state
  const button = document.querySelector('button[onclick="processPayment()"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
  }
  
  // Simulate payment processing
  setTimeout(() => {
    completeOrder(selectedMethod);
  }, 2000);
}

// Validate payment details
function validatePaymentDetails(method) {
  switch(method) {
    case 'upi':
      const upiId = document.querySelector('input[name="upiId"]').value.trim();
      if (!upiId) {
        showNotification('Please enter your UPI ID', 'error');
        return false;
      }
      if (!isValidUPI(upiId)) {
        showNotification('Please enter a valid UPI ID', 'error');
        return false;
      }
      break;
      
    case 'card':
      const cardNumber = document.querySelector('input[name="cardNumber"]').value.trim();
      const expiryDate = document.querySelector('input[name="expiryDate"]').value.trim();
      const cvv = document.querySelector('input[name="cvv"]').value.trim();
      
      if (!cardNumber || !expiryDate || !cvv) {
        showNotification('Please fill in all card details', 'error');
        return false;
      }
      
      if (!isValidCardNumber(cardNumber)) {
        showNotification('Please enter a valid card number', 'error');
        return false;
      }
      
      if (!isValidExpiryDate(expiryDate)) {
        showNotification('Please enter a valid expiry date (MM/YY)', 'error');
        return false;
      }
      
      if (!isValidCVV(cvv)) {
        showNotification('Please enter a valid CVV', 'error');
        return false;
      }
      break;
      
    case 'cod':
    case 'qr':
      // No validation needed for COD or QR
      break;
  }
  
  return true;
}

// Validation helper functions
function isValidUPI(upiId) {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
}

function isValidCardNumber(cardNumber) {
  const cardRegex = /^[0-9]{13,19}$/;
  return cardRegex.test(cardNumber.replace(/\s/g, ''));
}

function isValidExpiryDate(expiryDate) {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiryDate)) return false;
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }
  
  return true;
}

function isValidCVV(cvv) {
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
}

// Complete order
async function completeOrder(paymentMethod) {
  try {
    const customerId = parseInt(localStorage.getItem('currentUserId')) || 1; // Default to customer 1 for demo
    
    // Calculate order totals
    const totals = calculateOrderTotals(cartItems.map(item => ({
      unit_price: item.price,
      quantity: item.quantity
    })));
    
    // Create order data for backend
    const orderData = {
      order_id: Date.now(),
      order_number: generateOrderNumber(),
      customer_id: customerId,
      order_date: new Date().toISOString(),
      total_amount: totals.total,
      status: 'confirmed',
      shipping_address_id: selectedAddress?.id || 1, // Use address ID or default
      prescription_id: null, // Will be handled separately if needed
      payment_method: paymentMethod,
      payment_status: 'completed',
      tracking_number: null,
      notes: null
    };
    
    // Create order in backend
    const createdOrder = await createOrder(orderData);
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      order_item_id: Date.now() + Math.random(), // Generate unique ID
      order_id: createdOrder.id,
      product_id: parseInt(item.id),
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity
    }));
    
    // Save order items to backend
    await createOrderItems(orderItems);
    
    // Also save to localStorage for immediate access
    const order = {
      id: createdOrder.id,
      order_id: createdOrder.order_id,
      order_number: createdOrder.order_number,
      items: cartItems,
      address: selectedAddress,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      status: 'confirmed',
      payment_method: paymentMethod,
      payment_status: 'completed',
      customer_id: customerId,
      order_date: createdOrder.order_date,
      created_at: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart and checkout data
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutCart');
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('selectedAddress');
    
    // Show success message
    showNotification('Payment successful! Order confirmed.', 'success');
    
    // Redirect to orders page
    setTimeout(() => {
      window.location.href = '../orders/orders.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error completing order:', error);
    showNotification('Failed to complete order. Please try again.', 'error');
    
    // Reset button state
    const button = document.querySelector('button[onclick="processPayment()"]');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
    }
  }
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg notification ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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

// Process payment
function processPayment() {
  console.log('Processing payment...');
  
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (!selectedMethod) {
    showNotification('Please select a payment method', 'error');
    return;
  }
  
  const paymentMethod = selectedMethod.value;
  console.log('Selected payment method:', paymentMethod);
  
  // Validate payment details based on method
  if (!validatePaymentDetails(paymentMethod)) {
    return;
  }
  
  // Show loading state
  const button = document.querySelector('button[onclick="processPayment()"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
  }
  
  // Simulate payment processing
  setTimeout(() => {
    completeOrder(paymentMethod);
  }, 2000);
}

// Validate payment details
function validatePaymentDetails(method) {
  console.log('Validating payment details for method:', method);
  
  switch(method) {
    case 'upi':
      const upiId = document.querySelector('input[name="upiId"]').value.trim();
      if (!upiId) {
        showNotification('Please enter your UPI ID', 'error');
        return false;
      }
      if (!isValidUPI(upiId)) {
        showNotification('Please enter a valid UPI ID', 'error');
        return false;
      }
      break;
      
    case 'card':
      const cardNumber = document.querySelector('input[name="cardNumber"]').value.trim();
      const expiryDate = document.querySelector('input[name="expiryDate"]').value.trim();
      const cvv = document.querySelector('input[name="cvv"]').value.trim();
      
      if (!cardNumber || !expiryDate || !cvv) {
        showNotification('Please fill in all card details', 'error');
        return false;
      }
      
      if (!isValidCardNumber(cardNumber)) {
        showNotification('Please enter a valid card number', 'error');
        return false;
      }
      
      if (!isValidExpiryDate(expiryDate)) {
        showNotification('Please enter a valid expiry date (MM/YY)', 'error');
        return false;
      }
      
      if (!isValidCVV(cvv)) {
        showNotification('Please enter a valid CVV', 'error');
        return false;
      }
      break;
      
    case 'cod':
    case 'qr':
      // No validation needed for COD or QR
      break;
  }
  
  return true;
}

// Validation helper functions
function isValidUPI(upiId) {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
}

function isValidCardNumber(cardNumber) {
  const cardRegex = /^[0-9]{13,19}$/;
  return cardRegex.test(cardNumber.replace(/\s/g, ''));
}

function isValidExpiryDate(expiryDate) {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiryDate)) return false;
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }
  
  return true;
}

function isValidCVV(cvv) {
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
}

// Manual refresh function for testing
function refreshPaymentPage() {
  console.log('Manually refreshing payment page...');
  loadOrderData();
}

// Make functions globally available
window.processPayment = processPayment;
window.refreshPaymentPage = refreshPaymentPage;
