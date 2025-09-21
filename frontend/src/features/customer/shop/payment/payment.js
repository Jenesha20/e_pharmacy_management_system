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
    const response = await fetch('/frontend/src/core/components/navbar.html');
    const html = await response.text();
    document.getElementById('header').innerHTML = html;
    
    // Load navbar script
    const script = document.createElement('script');
    script.src = '/frontend/src/core/components/navbar.js';
    document.head.appendChild(script);
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch('/frontend/src/core/components/footer.html');
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
  console.log('Cart items details:', cartItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity
  })));
  displayOrderSummary();
  displayDeliveryAddress();
}

// Load fallback data
function loadFallbackData() {
  console.log('Loading fallback data...');
  
  // Check multiple possible localStorage keys for cart data
  cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cartItems.length === 0) {
    cartItems = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
  }
  if (cartItems.length === 0) {
    cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  }
  
  selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');
  if (Object.keys(selectedAddress).length === 0) {
    selectedAddress = JSON.parse(localStorage.getItem('checkoutAddress') || '{}');
  }
  
  console.log('Fallback data loaded:', { cartItems, selectedAddress });
  console.log('Available localStorage keys:', Object.keys(localStorage));
  
  // If no data found, create some test data for demo
  if (cartItems.length === 0 && Object.keys(selectedAddress).length === 0) {
    console.log('No data found, creating test data...');
    // Create test data inline
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
      id: 1,
      label: 'Home',
      address: '123 Test Street, Test City, TC 12345'
    };
    
    console.log('Test data created:', { cartItems, selectedAddress });
  }
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
  const shipping = subtotal > 30 ? 0 : 2.99; // Reduced shipping cost
  const total = subtotal + shipping;
  
  console.log('Display order summary calculation:', {
    cartItems: cartItems,
    subtotal: subtotal,
    shipping: shipping,
    total: total
  });
  
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



// Complete order
async function completeOrder(paymentMethod) {
  console.log('=== COMPLETE ORDER FUNCTION CALLED ===');
  console.log('Payment method:', paymentMethod);
  console.log('Cart items:', cartItems);
  console.log('Selected address:', selectedAddress);
  
  try {
    // Get customer ID from currentUser object
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const customerId = currentUser && currentUser.customer_id ? currentUser.customer_id.toString() : '6'; // Default to customer 6 as string for consistency
    console.log('Processing order for customer:', customerId, 'Type:', typeof customerId);
    // Calculate order totals
    const totals = calculateOrderTotals(cartItems.map(item => ({
      unit_price: item.price,
      quantity: item.quantity
    })));
    
    // Create order data for backend - match db.json structure
    const orderData = {
      order_id: Date.now(),
      order_number: generateOrderNumber(),
      customer_id: customerId.toString(), // Convert to string to match db.json
      order_date: new Date().toISOString(),
      total_amount: totals.total,
      status: 'confirmed',
      shipping_address_id: selectedAddress?.id || 'default_address', // Use address ID or default
      prescription_id: null, // Will be handled separately if needed
      payment_method: paymentMethod,
      payment_status: 'completed',
      tracking_number: null,
      notes: null
    };
    
    // Create order in backend (with fallback)
    let createdOrder;
    try {
      createdOrder = await createOrder(orderData);
      console.log('Order created in backend:', createdOrder);
      
      // Create order items (send each item individually)
      for (const item of cartItems) {
        const orderItem = {
          order_item_id: Math.floor(Date.now() + Math.random() * 1000), // Generate unique ID
          order_id: createdOrder.order_id, // Use order_id field to match db.json
          product_id: parseInt(item.id),
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        };
        
        // Save each order item individually to backend
        await createOrderItems(orderItem);
      }
      console.log('Order items created in backend');
    } catch (backendError) {
      console.warn('Backend API failed, using fallback:', backendError);
      // Fallback: create order with generated ID
      createdOrder = {
        id: orderData.order_id,
        ...orderData
      };
    }
    
    // Also save to localStorage for immediate access
    const order = {
      id: createdOrder.id || createdOrder.order_id, // Use order_id as fallback
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
      customer_id: customerId.toString(), // Convert to string
      order_date: createdOrder.order_date,
      created_at: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Set the selected order ID for the order details pag
        
    // Show success message
    showNotification('Payment successful! Order confirmed.', 'success');
    console.log('Payment completed successfully, preparing redirect...');
    
    // Redirect to payment completion page
    console.log('Setting up redirect timeout...');
    setTimeout(() => {
      console.log('=== REDIRECT TIMEOUT EXECUTED ===');
      console.log('Redirecting to payment completion page...');
      console.log('Current URL:', window.location.href);
      console.log('Target URL:', new URL('payment-complete.html', window.location.href).href);
      
      try {
        // Try relative path first
        console.log('Attempting redirect to payment-complete.html...');
        window.location.href = 'payment-complete.html';
        console.log('Redirect initiated successfully');
      } catch (redirectError) {
        console.error('Redirect failed:', redirectError);
        // Try alternative redirect method
        try {
          console.log('Trying window.location.assign...');
          window.location.assign('payment-complete.html');
        } catch (assignError) {
          console.error('Location assign also failed:', assignError);
          // Try absolute path
          const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
          const targetUrl = baseUrl + '/payment-complete.html';
          console.log('Trying absolute path:', targetUrl);
          window.location.href = targetUrl;
        }
      }
    }, 2000);
    
  } catch (error) {
    console.error('Error completing order:', error);
    showNotification('Failed to complete order. Please try again.', 'error');
    
    // Reset button state - DO NOT clear cart data on error
    const button = document.querySelector('button[onclick="processPayment()"]');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
    }
    
    // Cart data is preserved so user can retry payment
    console.log('Cart data preserved due to payment error');
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

// Process payment - Direct redirect without validation
function processPayment() {
  console.log('=== PAYMENT PROCESS STARTED ===');
  console.log('Skipping validation, creating order and redirecting to payment complete page...');
  
  // Get selected payment method (default to UPI if none selected)
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = selectedMethod ? selectedMethod.value : 'upi';
  console.log('Selected payment method:', paymentMethod);
  
  // Show loading state
  const button = document.querySelector('button[onclick="processPayment()"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
  }
  
  // Get customer ID from currentUser object
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const customerId = currentUser && currentUser.customer_id ? currentUser.customer_id.toString() : '6';
  console.log('Processing order for customer:', customerId);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 30 ? 0 : 2.99; // Reduced shipping cost
  const total = subtotal + shipping;
  
  console.log('Pricing calculation:', {
    cartItems: cartItems,
    subtotal: subtotal,
    shipping: shipping,
    total: total
  });
  
  // Generate order number
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const orderNumber = `ORD-${year}${month}${day}-${random}`;
  
  // Create order object for API (matching db.json structure)
  const order = {
    id: 'order_' + Date.now(),
    order_id: Date.now(),
    order_number: orderNumber,
    customer_id: customerId,
    order_date: new Date().toISOString(),
    total_amount: total,
    status: 'confirmed',
    shipping_address_id: selectedAddress?.id || 'default_address',
    prescription_id: null,
    payment_method: paymentMethod,
    payment_status: 'completed',
    tracking_number: null,
    notes: null
  };
  
  // Create order object for localStorage (with full details)
  const orderForLocalStorage = {
    id: 'order_' + Date.now(),
    order_id: Date.now(),
    order_number: orderNumber,
    items: cartItems,
    address: selectedAddress,
    subtotal: subtotal,
    shipping: shipping,
    total: total,
    status: 'confirmed',
    payment_method: paymentMethod,
    payment_status: 'completed',
    customer_id: customerId,
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  console.log('Created order:', order);
  
  // Save to API (async, don't wait)
  fetch('http://localhost:3000/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order)
  }).then(response => {
    if (response.ok) {
      console.log('Order saved to API successfully');
      
      // Create order items for each cart item
      cartItems.forEach((item, index) => {
        const orderItem = {
          id: 'item_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9),
          order_item_id: Date.now() + index + Math.random(),
          order_id: order.order_id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        };
        
        // Save order item to API
        fetch('http://localhost:3000/order_items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderItem)
        }).then(itemResponse => {
          if (itemResponse.ok) {
            console.log('Order item saved to API:', orderItem);
          } else {
            console.warn('Failed to save order item to API:', orderItem);
          }
        }).catch(itemError => {
          console.warn('Failed to save order item to API:', itemError);
        });
      });
    } else {
      console.warn('Failed to save order to API');
    }
  }).catch(error => {
    console.warn('API not available:', error);
  });
  
  // Save to localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(orderForLocalStorage);
  localStorage.setItem('orders', JSON.stringify(orders));
  console.log('Order saved to localStorage:', orderForLocalStorage);
  
  // Show success notification
  showNotification('Payment successful! Redirecting...', 'success');
  
  // Redirect immediately
  console.log('Redirecting to payment complete page...');
  window.location.href = 'payment-complete.html';
}

// Validate payment details
function validatePaymentDetails(method) {
  console.log('=== VALIDATING PAYMENT DETAILS ===');
  console.log('Payment method:', method);
  console.log('Available form elements:', document.querySelectorAll('input[name="paymentMethod"]'));
  
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

// Test redirect function
function testRedirect() {
  console.log('Testing redirect...');
  console.log('Current URL:', window.location.href);
  
  // Create a test order in localStorage
  const testOrder = {
    id: 'test_order_' + Date.now(),
    order_id: Date.now(),
    order_number: 'TEST-' + Date.now(),
    items: [
      {
        id: '1',
        name: 'Test Product',
        price: 10.00,
        unit_price: 10.00,
        quantity: 1,
        subtotal: 10.00,
        product: {
          name: 'Test Product',
          image_url: '../../../core/api/images/azithral.jpeg'
        }
      }
    ],
    address: {
      label: 'Test Address',
      address: '123 Test Street'
    },
    subtotal: 10.00,
    shipping: 0,
    total: 10.00,
    status: 'confirmed',
    payment_method: 'test',
    payment_status: 'completed',
    customer_id: 6,
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  // Save test order to localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(testOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.setItem('selectedOrderId', testOrder.id);
  
  console.log('Test order created:', testOrder);
  console.log('Redirecting to order details...');
  
  // Try redirect
  window.location.href = '../orders/order-details.html';
}

// Test latest order function
function testLatestOrder() {
  console.log('Testing latest order from database...');
  
  // Set the latest order ID from the database
  localStorage.setItem('selectedOrderId', '62d3');
  console.log('Set selectedOrderId to latest order: 62d3');
  
  console.log('Redirecting to order details...');
  window.location.href = '../orders/order-details.html';
}

// Test payment process function
function testPaymentProcess() {
  console.log('=== TESTING PAYMENT PROCESS ===');
  console.log('Cart items:', cartItems);
  console.log('Selected address:', selectedAddress);
  
  // Simulate the exact same process as Pay Now but with more debugging
  if (!cartItems || cartItems.length === 0) {
    console.log('No cart items, creating test data...');
    cartItems = [
      {
        id: '1',
        name: 'Test Product 1',
        price: 10.00,
        quantity: 2,
        unit_price: 10.00,
        subtotal: 20.00
      },
      {
        id: '2',
        name: 'Test Product 2',
        price: 15.00,
        quantity: 1,
        unit_price: 15.00,
        subtotal: 15.00
      }
    ];
    
    selectedAddress = {
      id: 1,
      label: 'Test Address',
      address: '123 Test Street'
    };
  }
  
  console.log('Using test data:', { cartItems, selectedAddress });
  
  // Call completeOrder directly with UPI method
  console.log('Calling completeOrder directly...');
  completeOrder('upi').then(() => {
    console.log('Test payment process completed successfully');
  }).catch(error => {
    console.error('Test payment process failed:', error);
  });
}
// Test redirect function
function testPaymentCompleteRedirect() {
  console.log('Testing payment complete redirect...');
  console.log('Current URL:', window.location.href);
  console.log('Attempting redirect to payment-complete.html...');
  
  try {
    window.location.href = 'payment-complete.html';
    console.log('Redirect initiated successfully');
  } catch (error) {
    console.error('Redirect failed:', error);
  }
}

// Make functions globally available
window.processPayment = processPayment;
window.refreshPaymentPage = refreshPaymentPage;
window.testRedirect = testRedirect;
window.testLatestOrder = testLatestOrder;
window.testPaymentProcess = testPaymentProcess;
window.testPaymentCompleteRedirect = testPaymentCompleteRedirect;
window.checkCartStatus = checkCartStatus;
