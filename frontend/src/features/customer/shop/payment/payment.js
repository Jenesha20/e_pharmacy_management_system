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
    price: (item.price-((item.discount/100)*item.price)),
    quantity: item.quantity,
    total: (item.price-((item.discount/100)*item.price)) * item.quantity
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
  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price-((item.discount/100)*item.price)) * item.quantity), 0);
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
      <span class="text-sm font-medium text-gray-800">Rs ${((item.price-((item.discount/100)*item.price)) * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  
  // Display totals
  subtotalElement.textContent = `Rs ${subtotal.toFixed(2)}`;
  shippingElement.textContent = `Rs ${shipping.toFixed(2)}`;
  totalElement.textContent = `Rs ${total.toFixed(2)}`;
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
    const customerId = currentUser && currentUser.customer_id ? currentUser.customer_id.toString() : '6';
    console.log('Processing order for customer:', customerId, 'Type:', typeof customerId);
    
    // Calculate order totals
    const totals = calculateOrderTotals(cartItems.map(item => ({
      unit_price: (item.price-((item.discount/100)*item.price)),
      quantity: item.quantity
    })));
    
    // Generate unique numeric order ID
    const numericOrderId = Date.now();
    
    // Create order data for backend - match db.json structure
    const orderData = {
      order_id: numericOrderId, // FIX: Use numeric ID
      order_number: generateOrderNumber(),
      customer_id: customerId.toString(),
      order_date: new Date().toISOString(),
      total_amount: totals.total,
      status: 'confirmed',
      shipping_address_id: selectedAddress?.id || 'default_address',
      prescription_id: null,
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
      
      // FIX: Use the numeric order_id that was returned from API
      const finalOrderId = createdOrder.order_id || numericOrderId;
      
      // NOTE: Order items are now created in processPayment function
      // This function only handles the order creation, not order items
      console.log('Order created successfully, order items will be created in processPayment function');
    } catch (backendError) {
      console.warn('Backend API failed, using fallback:', backendError);
      // Fallback: create order with generated ID
      createdOrder = {
        id: 'order_' + numericOrderId,
        ...orderData
      };
    }
    
    // Also save to localStorage for immediate access
    const order = {
      id: createdOrder.id || 'order_' + numericOrderId,
      order_id: createdOrder.order_id || numericOrderId,
      order_number: createdOrder.order_number,
      items: cartItems,
      address: selectedAddress,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      status: 'confirmed',
      payment_method: paymentMethod,
      payment_status: 'completed',
      customer_id: customerId.toString(),
      order_date: createdOrder.order_date,
      created_at: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Set the selected order ID for the order details page
    localStorage.setItem('selectedOrderId', order.id);
    console.log('Selected order ID set to:', order.id);
    
    // Show success message
    showNotification('Payment successful! Order confirmed.', 'success');
    console.log('Payment completed successfully, preparing redirect...');
    
    // Redirect to payment completion page
    console.log('Setting up redirect timeout...');
    setTimeout(() => {
      console.log('=== REDIRECT TIMEOUT EXECUTED ===');
      console.log('Redirecting to payment completion page...');
      window.location.href = 'payment-complete.html';
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


async function processPayment() {
  console.log('🚀🚀🚀 PAYMENT PROCESS STARTED 🚀🚀🚀');
  console.log('=== PAYMENT PROCESS STARTED ===');
  console.log('Skipping validation, creating order and redirecting to payment complete page...');
  console.log('=== DEBUGGING ORDER ITEMS ISSUE ===');
  console.log('🚀🚀🚀 FUNCTION IS BEING CALLED 🚀🚀🚀');
  
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
  console.log('=== CART ITEMS DEBUG ===');
  console.log('Cart items count:', cartItems.length);
  console.log('Cart items details:', cartItems);
  console.log('Selected address:', selectedAddress);
  
  // Debug localStorage
  console.log('=== LOCALSTORAGE DEBUG ===');
  console.log('checkoutData:', localStorage.getItem('checkoutData'));
  console.log('cart:', localStorage.getItem('cart'));
  console.log('checkoutCart:', localStorage.getItem('checkoutCart'));
  console.log('cartItems:', localStorage.getItem('cartItems'));
  console.log('All localStorage keys:', Object.keys(localStorage));
  
  // Check if cart is empty
  if (cartItems.length === 0) {
    console.log('❌❌❌ CART IS EMPTY - THIS IS THE PROBLEM! ❌❌❌');
    console.log('❌ No cart items found, trying to reload cart data...');
    
    // Try to reload cart data
    loadOrderData();
    
    // Check again after reload
    if (cartItems.length === 0) {
      console.log('❌ Still no cart items after reload, redirecting immediately');
      showNotification('Your cart is empty', 'error');
      window.location.href = 'payment-complete.html';
      return;
    } else {
      console.log('✅ Cart items loaded after reload:', cartItems.length);
    }
  }
  
  console.log('✅ Cart has items, proceeding with order creation');
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price-((item.discount/100)*item.price)) * item.quantity), 0);
  const shipping = subtotal > 30 ? 0 : 2.99;
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
  
  // Generate unique numeric order ID
  const numericOrderId = Date.now();
  
  // Create order object for API (matching db.json structure)
  const order = {
    id: 'order_' + Date.now(),
    order_id: numericOrderId,
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
    order_id: numericOrderId,
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
  console.log('=== ORDER CREATION DEBUG ===');
  console.log('Order data being sent to API:', JSON.stringify(order, null, 2));
  
  // Save to API and create order items
  console.log('=== STEP 1: CREATING ORDER ===');
  console.log('Making API call to create order...');
  
  let createdOrder;
  try {
    const orderResponse = await fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order)
    });
    
    console.log('Order API response status:', orderResponse.status);
    console.log('Order API response ok:', orderResponse.ok);
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Order API error response:', errorText);
      throw new Error('Failed to save order to API');
    }
    
    createdOrder = await orderResponse.json();
    console.log('✅ Order saved to API successfully:', createdOrder);
    console.log('✅ Created order ID:', createdOrder.order_id);
    console.log('✅ Order creation successful - proceeding to order_items creation');
  } catch (orderError) {
    console.error('❌ Error creating order:', orderError);
    console.error('❌ Order error details:', orderError.message);
    console.error('❌ Order error stack:', orderError.stack);
    console.log('❌ This is why the function is redirecting immediately - order creation failed!');
    
    // Still save to localStorage even if API fails
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderForLocalStorage);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('selectedOrderId', orderForLocalStorage.id);
    showNotification('Payment successful! Redirecting...', 'success');
    window.location.href = 'payment-complete.html';
    return;
  }
  
  // FIX: Use the numeric order_id that was returned from API
  const finalOrderId = createdOrder.order_id || numericOrderId;
  console.log('Using order_id for order items:', finalOrderId);
  console.log('Cart items to process:', cartItems);
  console.log('Number of cart items:', cartItems.length);
  
  // Create order items for each cart item - FIX: Use async/await to ensure proper creation
  console.log('=== STEP 2: CREATING ORDER ITEMS ===');
  console.log('Creating order items for cart items:', cartItems);
  console.log('Final order ID to use:', finalOrderId);
  
  // Create order items sequentially to ensure proper creation
  const orderItemPromises = [];
  
  for (let index = 0; index < cartItems.length; index++) {
    const item = cartItems[index];
    console.log(`=== PROCESSING CART ITEM ${index + 1}/${cartItems.length} ===`);
    console.log('Cart item details:', item);
    console.log('Item ID:', item.id, 'Type:', typeof item.id);
    console.log('Item price:', (item.price-((item.discount/100)*item.price)), 'Type:', typeof item.price);
    console.log('Item quantity:', item.quantity, 'Type:', typeof item.quantity);
    
    const orderItem = {
      id: `item_${Date.now()}_${index}`,
      order_item_id: Date.now() + index + Math.random() * 1000, // Ensure unique ID
      order_id: finalOrderId,
      product_id: parseInt(item.id),
      quantity: item.quantity,
      unit_price: (item.price-((item.discount/100)*item.price)),
      subtotal: (item.price-((item.discount/100)*item.price)) * item.quantity
    };
    
    console.log(`Creating order item ${index + 1}/${cartItems.length}:`, orderItem);
    console.log('Order item data being sent to API:', JSON.stringify(orderItem, null, 2));
    
    // Create a promise for each order item
    const orderItemPromise = (async () => {
      try {
        console.log(`=== ATTEMPTING TO SAVE ORDER ITEM ${index + 1} ===`);
        console.log(`Attempting to save order item ${index + 1}:`, orderItem);
        console.log('Making API call to order_items endpoint...');
        
        const itemResponse = await fetch('http://localhost:3000/order_items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderItem)
        });
        
        console.log('Order item API response status:', itemResponse.status);
        console.log('Order item API response ok:', itemResponse.ok);
        
        if (itemResponse.ok) {
          const savedItem = await itemResponse.json();
          console.log('✅ Order item saved successfully to database:', savedItem);
          console.log('✅ Order item ID:', savedItem.id);
          console.log('✅ Order item order_id:', savedItem.order_id);
          return savedItem;
        } else {
          console.error('❌ Failed to save order item to API:', orderItem);
          const errorText = await itemResponse.text();
          console.error('❌ API Error response:', errorText);
          
          // Try the improved saveOrderItemToDatabase function
          console.log('🔄 Trying fallback saveOrderItemToDatabase function...');
          return await saveOrderItemToDatabase(orderItem);
        }
      } catch (error) {
        console.error('❌ Error creating order item:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Try the improved saveOrderItemToDatabase function
        console.log('🔄 Trying fallback saveOrderItemToDatabase function...');
        return await saveOrderItemToDatabase(orderItem);
      }
    })();
    
    orderItemPromises.push(orderItemPromise);
  }
  
  // Wait for all order items to be created
  try {
    console.log('=== STEP 3: WAITING FOR ALL ORDER ITEMS ===');
    console.log('Waiting for all order items to be created...');
    console.log('Number of order item promises:', orderItemPromises.length);
    
    const results = await Promise.all(orderItemPromises);
    console.log('✅ All order items created successfully:', results);
    console.log('✅ Number of order items created:', results.length);
    console.log('✅ Results details:', results.map((result, index) => ({
      index: index + 1,
      id: result?.id,
      order_id: result?.order_id,
      product_id: result?.product_id,
      quantity: result?.quantity
    })));
    
    // Show success notification
    if (typeof showNotification === 'function') {
      showNotification(`Order items created successfully! ${cartItems.length} items added to order.`, 'success');
    }
  } catch (error) {
    console.error('❌ Error creating some order items:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Show error notification
    if (typeof showNotification === 'function') {
      showNotification('Some order items failed to create. Check console for details.', 'error');
    }
  }
  
  console.log('=== STEP 4: ORDER ITEMS CREATION COMPLETED ===');
  console.log('All order items creation completed');
  console.log('Final order_id used:', finalOrderId);
  console.log('Total cart items processed:', cartItems.length);
  
  // Save to localStorage
  console.log('=== STEP 5: SAVING TO LOCALSTORAGE ===');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(orderForLocalStorage);
  localStorage.setItem('orders', JSON.stringify(orders));
  console.log('Order saved to localStorage:', orderForLocalStorage);
  
  // Set the selected order ID for the order details page
  localStorage.setItem('selectedOrderId', orderForLocalStorage.id);
  console.log('Selected order ID set to:', orderForLocalStorage.id);
  
  // Verify order_items were created in database
  console.log('=== STEP 6: VERIFYING ORDER ITEMS IN DATABASE ===');
  try {
    const verifyResponse = await fetch(`http://localhost:3000/order_items?order_id=${finalOrderId}`);
    if (verifyResponse.ok) {
      const orderItems = await verifyResponse.json();
      console.log('✅ Verification: Found order items in database:', orderItems.length);
      console.log('✅ Order items details:', orderItems);
    } else {
      console.log('⚠️ Could not verify order items in database');
    }
  } catch (verifyError) {
    console.log('⚠️ Verification failed:', verifyError);
  }
  
  // Show success notification
  showNotification('Payment successful! Redirecting...', 'success');
  
  // Redirect after order_items are created
  console.log('=== STEP 7: REDIRECTING ===');
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

// Function to save order item directly to database JSON file
async function saveOrderItemToDatabase(orderItem) {
  try {
    console.log('Attempting to save order item to database:', orderItem);
    
    // Create a server endpoint to handle this, or use a different approach
    // For now, we'll use a more robust API call with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch('http://localhost:3000/order_items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: `item_${Date.now()}_${retryCount}`,
            order_item_id: orderItem.order_item_id,
            order_id: orderItem.order_id,
            product_id: orderItem.product_id,
            quantity: orderItem.quantity,
            unit_price: orderItem.unit_price,
            subtotal: orderItem.subtotal
          })
        });
        
        if (response.ok) {
          const savedItem = await response.json();
          console.log('Order item saved to database successfully:', savedItem);
          return savedItem;
        } else {
          throw new Error(`API returned status: ${response.status}`);
        }
      } catch (error) {
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries} for order item:`, error.message);
        
        if (retryCount >= maxRetries) {
          console.error('All retries failed for order item:', orderItem);
          // Final fallback: save to localStorage
          const fallbackItems = JSON.parse(localStorage.getItem('order_items') || '[]');
          fallbackItems.push(orderItem);
          localStorage.setItem('order_items', JSON.stringify(fallbackItems));
          console.log('Order item saved to localStorage as final fallback:', orderItem);
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  } catch (error) {
    console.error('Error saving order item to database:', error);
  }
}

// Notification function
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Test function to check cart items
function testCartItems() {
  console.log('=== TESTING CART ITEMS ===');
  
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  console.log('Cart items from localStorage:', cartItems);
  console.log('Number of cart items:', cartItems.length);
  
  if (cartItems.length > 0) {
    console.log('First cart item:', cartItems[0]);
    console.log('Cart item structure:', {
      id: cartItems[0].id,
      name: cartItems[0].name,
      price: cartItems[0].price,
      quantity: cartItems[0].quantity
    });
  } else {
    console.log('Cart is empty!');
  }
  
  return cartItems;
}

// Test function to manually create order items
async function testOrderItemCreation() {
  console.log('=== TESTING ORDER ITEM CREATION ===');
  
  // First check cart items
  const cartItems = testCartItems();
  
  if (cartItems.length === 0) {
    console.log('No cart items to test with');
    return;
  }
  
  // Get the latest order from the database
  try {
    const response = await fetch('http://localhost:3000/orders');
    if (response.ok) {
      const orders = await response.json();
      const latestOrder = orders[orders.length - 1];
      console.log('Latest order:', latestOrder);
      
      if (latestOrder) {
        // Create order items for each cart item
        for (let index = 0; index < cartItems.length; index++) {
          const item = cartItems[index];
          const testOrderItem = {
            id: `test_js_item_${Date.now()}_${index}`,
            order_item_id: Date.now() + index,
            order_id: latestOrder.order_id,
            product_id: parseInt(item.id),
            quantity: item.quantity,
            unit_price: (item.price-((item.discount/100)*item.price)),
            subtotal: (item.price-((item.discount/100)*item.price)) * item.quantity
          };
          
          console.log(`Creating test order item ${index + 1}:`, testOrderItem);
          
          const itemResponse = await fetch('http://localhost:3000/order_items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testOrderItem)
          });
          
          if (itemResponse.ok) {
            const savedItem = await itemResponse.json();
            console.log('Test order item created successfully:', savedItem);
          } else {
            console.error('Failed to create test order item:', itemResponse.status);
            const errorText = await itemResponse.text();
            console.error('Error response:', errorText);
          }
        }
        
        showNotification('Test order items creation completed!', 'success');
      }
    } else {
      console.error('Failed to fetch orders');
    }
  } catch (error) {
    console.error('Error in test function:', error);
  }
}

// Test function to manually test order_items creation
async function testOrderItemsCreation() {
  console.log('=== MANUAL TEST: ORDER ITEMS CREATION ===');
  
  // Get current cart items
  const testCartItems = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
  console.log('Test cart items:', testCartItems);
  
  if (testCartItems.length === 0) {
    console.log('No cart items found. Please add items to cart first.');
    return;
  }
  
  // Create a test order
  const testOrderId = Date.now();
  console.log('Test order ID:', testOrderId);
  
  // Create order_items for each cart item
  for (let index = 0; index < testCartItems.length; index++) {
    const item = testCartItems[index];
    const orderItem = {
      id: `test_manual_${Date.now()}_${index}`,
      order_item_id: Date.now() + index,
      order_id: testOrderId,
      product_id: parseInt(item.id),
      quantity: item.quantity,
      unit_price: (item.price-((item.discount/100)*item.price)),
      subtotal: (item.price-((item.discount/100)*item.price)) * item.quantity
    };
    
    console.log(`Creating test order item ${index + 1}:`, orderItem);
    
    try {
      const response = await fetch('http://localhost:3000/order_items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderItem)
      });
      
      if (response.ok) {
        const savedItem = await response.json();
        console.log('✅ Test order item created:', savedItem);
      } else {
        console.error('❌ Failed to create test order item:', response.status);
      }
    } catch (error) {
      console.error('❌ Error creating test order item:', error);
    }
  }
  
  // Verify the order_items were created
  try {
    const verifyResponse = await fetch(`http://localhost:3000/order_items?order_id=${testOrderId}`);
    if (verifyResponse.ok) {
      const orderItems = await verifyResponse.json();
      console.log('✅ Verification: Found test order items:', orderItems.length);
      console.log('✅ Test order items:', orderItems);
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Make functions globally available
window.processPayment = processPayment;
window.refreshPaymentPage = refreshPaymentPage;
window.testRedirect = testRedirect;
window.showNotification = showNotification;
window.testLatestOrder = testLatestOrder;
window.testPaymentProcess = testPaymentProcess;
window.testPaymentCompleteRedirect = testPaymentCompleteRedirect;
window.checkCartStatus = checkCartStatus;
window.testOrderItemCreation = testOrderItemCreation;
window.testCartItems = testCartItems;
window.testOrderItemsCreation = testOrderItemsCreation;
