const API_BASE_URL = 'http://localhost:3000';

let currentOrder = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadHeader();
  loadFooter();
  loadOrderDetails();
});

// Load header and footer
async function loadHeader() {
  try {
    console.log('Loading navbar...');
    const response = await fetch('../../../../core/components/navbar.html');
    const html = await response.text();
    document.getElementById('header').innerHTML = html;
    console.log('Navbar HTML loaded');
    
    // Load navbar script
    const script = document.createElement('script');
    script.src = '../../../../core/components/navbar.js';
    script.onload = () => {
      console.log('Navbar script loaded successfully');
      // Initialize auth after script loads
      setTimeout(() => {
        if (window.initAuth) {
          window.initAuth();
          console.log('Navbar auth initialized from order details page');
        } else if (window.refreshAuth) {
          window.refreshAuth();
          console.log('Navbar auth refreshed from order details page');
        } else {
          console.warn('Auth functions not available yet, retrying...');
          setTimeout(() => {
            if (window.initAuth) {
              window.initAuth();
            } else if (window.refreshAuth) {
              window.refreshAuth();
            }
          }, 500);
        }
      }, 100);
    };
    script.onerror = (error) => {
      console.error('Error loading navbar script:', error);
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch('../../../../core/components/footer.html');
    const html = await response.text();
    document.getElementById('footer').innerHTML = html;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

// Load order details - FIXED: Read from localStorage like payment_complete.js
async function loadOrderDetails() {
  const orderId = localStorage.getItem('selectedOrderId');
  console.log('=== LOADING ORDER DETAILS ===');
  console.log('Selected order ID from localStorage:', orderId);
  
  if (!orderId) {
    console.error('No order ID found in localStorage');
    showErrorState();
    return;
  }
  
  try {
    showLoadingState();
    
    // FIX: Try localStorage first (like payment_complete.js)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    console.log('All orders in localStorage:', orders);
    
    // Find the order by ID
    currentOrder = orders.find(order => order.id === orderId);
    console.log('Found order in localStorage:', currentOrder);
    
    if (!currentOrder) {
      console.log('Order not found in localStorage, trying API...');
      // Fallback to API if not found in localStorage
      try {
        currentOrder = await getCompleteOrderDetails(orderId);
        console.log('Order found via API:', currentOrder);
      } catch (apiError) {
        console.error('Order not found in API either:', apiError);
        throw new Error('Order not found');
      }
    }
    
    hideLoadingState();
    displayOrderDetails();
  } catch (error) {
    console.error('Error loading order details:', error);
    hideLoadingState();
    showErrorState();
  }
}

async function getCompleteOrderDetails(orderId) {
  console.log('Attempting to fetch order details from backend for ID:', orderId);
  try {
    // Get order details
    const orderResponse = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    console.log('Order response status:', orderResponse.status);
    if (!orderResponse.ok) {
      console.log('Order response not ok:', orderResponse.status, orderResponse.statusText);
      throw new Error(`Failed to fetch order: ${orderResponse.status} ${orderResponse.statusText}`);
    }
    const order = await orderResponse.json();
    console.log('Order fetched from backend:', order);
    
    // FIX: Try multiple ways to find order items
    let orderItems = [];
    
    // Method 1: Try with numeric order_id (correct way)
    if (order.order_id) {
      const itemsResponse1 = await fetch(`${API_BASE_URL}/order_items?order_id=${order.order_id}`);
      if (itemsResponse1.ok) {
        const items1 = await itemsResponse1.json();
        if (items1.length > 0) {
          console.log(`Found items using numeric order_id ${order.order_id}:`, items1);
          orderItems = items1;
        }
      }
    }
    
    // Method 2: Try with JSON-server id (fallback for incorrect data)
    if (orderItems.length === 0 && order.id) {
      const itemsResponse2 = await fetch(`${API_BASE_URL}/order_items?order_id=${order.id}`);
      if (itemsResponse2.ok) {
        const items2 = await itemsResponse2.json();
        if (items2.length > 0) {
          console.log(`Found items using JSON-server id ${order.id}:`, items2);
          orderItems = items2;
        }
      }
    }
    
    console.log('Final order items found:', orderItems);
    
    // Process the order items structure
    let itemsArray = [];
    if (orderItems.length > 0) {
      const firstItem = orderItems[0];
      // Check if items are stored as nested objects (0, 1, 2, etc.)
      if (firstItem['0'] || firstItem['1']) {
        // Extract items from the nested structure
        itemsArray = Object.keys(firstItem)
          .filter(key => !isNaN(key)) // Get numeric keys (0, 1, 2, etc.)
          .map(key => firstItem[key])
          .filter(item => item && item.product_id); // Filter valid items
      } else {
        // Normal array structure
        itemsArray = orderItems.filter(item => item && item.product_id);
      }
    }
    
    console.log('Processed order items:', itemsArray);
    
    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      itemsArray.map(async (item) => {
        try {
          console.log('Fetching product for ID:', item.product_id);
          const productResponse = await fetch(`${API_BASE_URL}/products/${item.product_id}`);
          if (!productResponse.ok) throw new Error('Failed to fetch product');
          const product = await productResponse.json();
          return { ...item, product };
        } catch (error) {
          console.error('Error fetching product:', error);
          return item;
        }
      })
    );
    
    // Get address details
    let address = null;
    if (order.shipping_address_id) {
      try {
        const addressResponse = await fetch(`${API_BASE_URL}/customer_addresses/${order.shipping_address_id}`);
        if (addressResponse.ok) {
          address = await addressResponse.json();
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    }
    
    return {
      ...order,
      items: itemsWithProducts,
      address
    };
  } catch (error) {
    console.error('Error fetching complete order details:', error);
    throw error;
  }
}

// Show loading state
function showLoadingState() {
  const loadingState = document.getElementById('loadingState');
  const orderHeader = document.getElementById('orderHeader');
  const orderContent = document.getElementById('orderContent');
  const errorState = document.getElementById('errorState');
  
  if (loadingState) loadingState.classList.remove('hidden');
  if (orderHeader) orderHeader.classList.add('hidden');
  if (orderContent) orderContent.classList.add('hidden');
  if (errorState) errorState.classList.add('hidden');
}

// Hide loading state
function hideLoadingState() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) loadingState.classList.add('hidden');
}

// Show error state
function showErrorState() {
  const errorState = document.getElementById('errorState');
  const orderHeader = document.getElementById('orderHeader');
  const orderContent = document.getElementById('orderContent');
  const loadingState = document.getElementById('loadingState');
  
  if (errorState) errorState.classList.remove('hidden');
  if (orderHeader) orderHeader.classList.add('hidden');
  if (orderContent) orderContent.classList.add('hidden');
  if (loadingState) loadingState.classList.add('hidden');
}

// Display order details - FIXED: Use the same display logic as payment_complete.js
function displayOrderDetails() {
  if (!currentOrder) return;
  
  console.log('=== DISPLAYING ORDER DETAILS ===');
  console.log('Current order data:', currentOrder);
  console.log('Order items:', currentOrder.items);
  
  // Show content
  const orderHeader = document.getElementById('orderHeader');
  const orderContent = document.getElementById('orderContent');
  
  if (orderHeader) orderHeader.classList.remove('hidden');
  if (orderContent) orderContent.classList.remove('hidden');
  
  // Update order header - FIXED: Use same format as payment_complete.js
  document.getElementById('orderNumber').textContent = `Order #${currentOrder.order_number || currentOrder.id}`;
  
  // Display order status timeline
  displayOrderStatus();
  
  // Display order items - FIXED: Use same logic as payment_complete.js
  displayOrderItems();
  
  // Display order information
  displayOrderInformation();
  
  // Display order summary
  displayOrderSummary();
  
  // Update cancel order button visibility
  updateCancelOrderButtonVisibility();
}

// Display order status timeline
function displayOrderStatus() {
  const timelineContainer = document.getElementById('orderStatusTimeline');
  if (!timelineContainer) return;
  
  const statusSteps = getOrderStatusSteps(currentOrder.status);
  
  timelineContainer.innerHTML = statusSteps.map((step, index) => `
    <div class="flex items-center ${index < statusSteps.length - 1 ? 'pb-4' : ''}">
      <div class="flex-shrink-0">
        <div class="w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}">
          <i class="${step.icon} text-sm"></i>
        </div>
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}">${step.label}</p>
        <p class="text-xs text-gray-500">${step.date}</p>
      </div>
    </div>
  `).join('');
}

// Get order status steps
function getOrderStatusSteps(currentStatus) {
  const orderDate = new Date(currentOrder.order_date);
  
  // Handle cancelled orders
  if (currentStatus === 'cancelled') {
    const cancellationDate = currentOrder.cancellation_date ? 
      new Date(currentOrder.cancellation_date) : 
      new Date();
    
    return [
      {
        label: 'Order Placed',
        icon: 'fas fa-shopping-cart',
        date: orderDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        completed: true
      },
      {
        label: 'Order Cancelled',
        icon: 'fas fa-times-circle',
        date: cancellationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        completed: true
      }
    ];
  }
  
  const steps = [
    {
      label: 'Order Placed',
      icon: 'fas fa-shopping-cart',
      date: orderDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      completed: true
    },
    {
      label: 'Processing',
      icon: 'fas fa-cog',
      date: getStatusDate('processing'),
      completed: ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(currentStatus)
    },
    {
      label: 'Shipped',
      icon: 'fas fa-shipping-fast',
      date: getStatusDate('shipped'),
      completed: ['shipped', 'out_for_delivery', 'delivered'].includes(currentStatus)
    },
    {
      label: 'Delivered',
      icon: 'fas fa-check-circle',
      date: getStatusDate('delivered'),
      completed: currentStatus === 'delivered'
    }
  ];
  
  return steps;
}

// Get status date (simulate dates for demo)
function getStatusDate(status) {
  const orderDate = new Date(currentOrder.order_date);
  const dates = {
    'processing': new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), // +1 day
    'shipped': new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
    'delivered': new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days
  };
  
  const date = dates[status] || orderDate;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Display order items - FIXED: Use same logic as payment_complete.js
function displayOrderItems() {
  const itemsContainer = document.getElementById('orderItems');
  if (!itemsContainer) return;
  
  console.log('Displaying order items for order:', currentOrder);
  
  // FIXED: Better handling of items structure - same as payment_complete.js
  const hasItems = currentOrder.items && Array.isArray(currentOrder.items) && currentOrder.items.length > 0;
  
  if (!hasItems) {
    console.log('No items found, showing empty state');
    itemsContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-shopping-bag text-gray-400 text-4xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
        <p class="text-gray-500">The order items are not available or still being processed.</p>
        <p class="text-sm text-gray-400 mt-2">Order Total: Rs ${currentOrder.total_amount?.toFixed(2) || currentOrder.total?.toFixed(2) || '0.00'}</p>
      </div>
    `;
    return;
  }
  
  console.log('Displaying', currentOrder.items.length, 'items');
  
  // FIXED: Use same item rendering as payment_complete.js
  itemsContainer.innerHTML = currentOrder.items.map(item => {
    console.log('Rendering item:', item);
    
    // Calculate subtotal if not provided
    const subtotal = item.subtotal || (item.unit_price || (item.price-((item.discount/100)*item.price)) || 0) * (item.quantity || 1);
    const unitPrice = item.unit_price || (item.price-((item.discount/100)*item.price)) || 0;
    const productName = item.product?.name || item.name || 'Unknown Product';
    const composition = item.product?.composition || item.composition || 'Medicine';
    
    return `
    <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg mb-4">
      <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        ${item.product?.image_url || item.image_url ? `
          <img src="${item.product?.image_url || item.image_url}" 
               alt="${productName}" 
               class="w-16 h-16 object-cover rounded-lg"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="placeholder-icon" style="display: none;">
            <i class="fas fa-pills text-gray-400 text-2xl"></i>
          </div>
        ` : `
          <i class="fas fa-pills text-gray-400 text-2xl"></i>
        `}
      </div>
      
      <div class="flex-grow">
        <h3 class="font-medium text-gray-900">${productName}</h3>
        <p class="text-sm text-gray-500">${composition}</p>
        <p class="text-sm text-gray-600">Quantity: ${item.quantity || 1}</p>
        <p class="text-sm text-gray-600">Unit Price: Rs ${unitPrice.toFixed(2)}</p>
        ${item.product?.requires_prescription || item.requires_prescription ? '<p class="text-xs text-orange-600 mt-1"><i class="fas fa-exclamation-triangle mr-1"></i>Prescription Required</p>' : ''}
      </div>
      
      <div class="text-right">
        <p class="text-lg font-semibold text-gray-900">Rs ${subtotal.toFixed(2)}</p>
        <p class="text-sm text-gray-500">Rs ${unitPrice.toFixed(2)} each</p>
      </div>
    </div>
  `}).join('');
}

// Display order information
function displayOrderInformation() {
  // Calculate totals from order items (same logic as payment_complete.js)
  const subtotal = currentOrder.subtotal || (currentOrder.items ? 
    currentOrder.items.reduce((sum, item) => sum + (item.subtotal || (item.unit_price || (item.price-((item.discount/100)*item.price)) || 0) * (item.quantity || 1)), 0) : 
    currentOrder.total_amount || 0);
  
  const shipping = currentOrder.shipping || (currentOrder.total_amount ? 
    currentOrder.total_amount - subtotal : 0);
  
  const total = currentOrder.total || currentOrder.total_amount || subtotal + shipping;
  
  document.getElementById('orderSubtotal').textContent = `Rs ${subtotal.toFixed(2)}`;
  document.getElementById('orderShipping').textContent = `Rs ${shipping.toFixed(2)}`;
  document.getElementById('orderTotal').textContent = `Rs ${total.toFixed(2)}`;
}

// Display order summary - FIXED: Remove duplicate definition
function displayOrderSummary() {
  const orderDate = new Date(currentOrder.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  document.getElementById('orderDate').textContent = orderDate;
  document.getElementById('shippingAddress').textContent = currentOrder.address ? 
    `${currentOrder.address.address_line1 || currentOrder.address.address}, ${currentOrder.address.city || ''}, ${currentOrder.address.state || ''} ${currentOrder.address.zip_code || ''}`.trim() : 
    'No address provided';
  document.getElementById('paymentMethod').textContent = currentOrder.payment_method ? 
    currentOrder.payment_method.replace('_', ' ').toUpperCase() : 'Unknown';
  document.getElementById('orderId').textContent = currentOrder.order_number || currentOrder.id;
  
  // Show tracking number if available
  if (currentOrder.tracking_number) {
    const trackingInfo = document.getElementById('trackingInfo');
    const trackingNumber = document.getElementById('trackingNumber');
    if (trackingInfo && trackingNumber) {
      trackingInfo.classList.remove('hidden');
      trackingNumber.textContent = currentOrder.tracking_number;
    }
  }
}

async function reorderItems() {
  if (!currentOrder || !currentOrder.items) {
    showNotification('No items to reorder', 'error');
    return;
  }
  
  try {
    // Add items to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let addedCount = 0;
    
    for (const item of currentOrder.items) {
      if (item.product || item.name) {
        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => cartItem.id === (item.product?.id || item.id));
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.push({
            id: item.product?.id || item.id,
            name: item.product?.name || item.name,
            price: item.unit_price || (item.price-((item.discount/100)*item.price)),
            quantity: item.quantity,
            image_url: item.product?.image_url || item.image_url,
            composition: item.product?.composition || item.composition,
            requires_prescription: item.product?.requires_prescription || item.requires_prescription
          });
        }
        addedCount++;
      }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${addedCount} item(s) added to cart`, 'success');
    
    // Navigate to cart
    setTimeout(() => {
      window.location.href = '/frontend/src/features/customer/shop/cart/cart.html';
    }, 1500);
  } catch (error) {
    console.error('Error reordering items:', error);
    showNotification('Failed to add items to cart', 'error');
  }
}

// Download invoice
function downloadInvoice() {
  showNotification('Invoice download feature coming soon!', 'success');
}

// Contact support
function contactSupport() {
  showNotification('Redirecting to support...', 'success');
  setTimeout(() => {
    window.location.href = '../../../about/contact/contact.html';
  }, 1500);
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

// Update cancel order button visibility - FIXED: Remove duplicate definition
function updateCancelOrderButtonVisibility() {
  const cancelOrderContainer = document.getElementById('cancelOrderContainer');
  if (!cancelOrderContainer || !currentOrder) return;
  
  // Only show cancel button for confirmed orders
  if (currentOrder.status === 'confirmed') {
    cancelOrderContainer.style.display = 'block';
  } else {
    cancelOrderContainer.style.display = 'none';
  }
}

// Cancel Order Functions
function toggleCancelDropdown() {
  const dropdown = document.getElementById('cancelOrderDropdown');
  if (!dropdown) return;
  
  if (dropdown.classList.contains('hidden')) {
    // Show dropdown and calculate refund amounts
    dropdown.classList.remove('hidden');
    calculateRefundAmounts();
    
    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  } else {
    // Hide dropdown
    dropdown.classList.add('hidden');
    document.removeEventListener('click', handleOutsideClick);
  }
}

function handleOutsideClick(event) {
  const container = document.getElementById('cancelOrderContainer');
  if (container && !container.contains(event.target)) {
    const dropdown = document.getElementById('cancelOrderDropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
    document.removeEventListener('click', handleOutsideClick);
  }
}

function calculateRefundAmounts() {
  if (!currentOrder) return;
  
  const orderTotal = currentOrder.total_amount || currentOrder.total || 0;
  const cancellationFee = orderTotal * 0.1; // 10% fee
  const refundAmount = orderTotal - cancellationFee;
  
  const cancelOrderTotal = document.getElementById('cancelOrderTotal');
  const cancelOrderFee = document.getElementById('cancelOrderFee');
  const cancelOrderRefund = document.getElementById('cancelOrderRefund');
  
  if (cancelOrderTotal) cancelOrderTotal.textContent = `Rs ${orderTotal.toFixed(2)}`;
  if (cancelOrderFee) cancelOrderFee.textContent = `Rs ${cancellationFee.toFixed(2)}`;
  if (cancelOrderRefund) cancelOrderRefund.textContent = `Rs ${refundAmount.toFixed(2)}`;
}

function confirmCancelOrder() {
  if (!currentOrder) {
    showNotification('Order not found', 'error');
    return;
  }
  
  // Check if order can be cancelled (only confirmed orders)
  if (currentOrder.status !== 'confirmed') {
    showNotification('This order cannot be cancelled', 'error');
    return;
  }
  
  // Show confirmation dialog
  const orderTotal = currentOrder.total_amount || currentOrder.total || 0;
  const cancellationFee = orderTotal * 0.1;
  const refundAmount = orderTotal - cancellationFee;
  
  const confirmed = confirm(
    `Are you sure you want to cancel this order?\n\n` +
    `Order Total: Rs ${orderTotal.toFixed(2)}\n` +
    `Cancellation Fee (10%): Rs ${cancellationFee.toFixed(2)}\n` +
    `Refund Amount: Rs ${refundAmount.toFixed(2)}\n\n` +
    `The refund will be processed within 5 business days.`
  );
  
  if (confirmed) {
    processOrderCancellation();
  }
}

async function processOrderCancellation() {
  try {
    // Show loading state
    const confirmButton = document.querySelector('button[onclick="confirmCancelOrder()"]');
    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    }
    
    // Update order status to cancelled
    const updatedOrder = {
      ...currentOrder,
      status: 'cancelled',
      cancellation_date: new Date().toISOString(),
      refund_amount: (currentOrder.total_amount || currentOrder.total || 0) * 0.9 // 90% refund
    };
    
    // Update in API
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${currentOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellation_date: updatedOrder.cancellation_date,
          refund_amount: updatedOrder.refund_amount
        })
      });
      
      if (response.ok) {
        console.log('Order cancelled in API successfully');
      } else {
        console.warn('Failed to update order in API');
      }
    } catch (error) {
      console.warn('API not available, updating localStorage only:', error);
    }
    
    // Update in localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(order => order.id === currentOrder.id);
    if (orderIndex !== -1) {
      orders[orderIndex] = updatedOrder;
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    // Update current order
    currentOrder = updatedOrder;
    
    // Hide dropdown
    const dropdown = document.getElementById('cancelOrderDropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
    
    // Refresh the order display
    displayOrderDetails();
    
    // Show success notification
    showNotification('Order cancelled successfully. Refund will be processed within 5 business days.', 'success');
    
    // Reset button
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.innerHTML = '<i class="fas fa-check mr-2"></i>Confirm Cancel';
    }
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    showNotification('Failed to cancel order. Please try again.', 'error');
    
    // Reset button
    const confirmButton = document.querySelector('button[onclick="confirmCancelOrder()"]');
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.innerHTML = '<i class="fas fa-check mr-2"></i>Confirm Cancel';
    }
  }
}

// Make functions globally available
window.reorderItems = reorderItems;
window.downloadInvoice = downloadInvoice;
window.contactSupport = contactSupport;
window.toggleCancelDropdown = toggleCancelDropdown;
window.confirmCancelOrder = confirmCancelOrder;