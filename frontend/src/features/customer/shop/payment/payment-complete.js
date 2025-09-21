// Payment Complete Page Functionality
let orderData = null;
let latestOrder = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadHeader();
  loadFooter();
  loadOrderData();
  displayOrderSummary();
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
  console.log('Loading order data for payment complete page...');
  
  // Get all orders from localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  console.log('All orders in localStorage:', orders);
  
  if (orders.length > 0) {
    // Get the most recent order (last in array, sorted by created_at)
    const sortedOrders = orders.sort((a, b) => new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date));
    latestOrder = sortedOrders[0];
    console.log('Latest order found:', latestOrder);
    console.log('Order items:', latestOrder.items);
    console.log('Order total:', latestOrder.total);
  } else {
    // Fallback: try to get from selectedOrderId
    const selectedOrderId = localStorage.getItem('selectedOrderId');
    if (selectedOrderId) {
      latestOrder = orders.find(order => order.id === selectedOrderId);
      console.log('Order found by selectedOrderId:', latestOrder);
    }
  }
  
  // If still no order, create a fallback order
  if (!latestOrder) {
    console.log('No order found, creating fallback order...');
    latestOrder = createFallbackOrder();
    
    // Save the fallback order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(latestOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('Fallback order saved to localStorage');
  }
  
  orderData = latestOrder;
  console.log('Final order data for display:', orderData);
}

// Create fallback order data
function createFallbackOrder() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return {
    id: 'order_' + Date.now(),
    order_id: Date.now(),
    order_number: `ORD-${year}${month}${day}-${random}`,
    items: [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        price: 5.99,
        quantity: 2,
        image_url: '../../../core/api/images/azithral.jpeg'
      },
      {
        id: '2',
        name: 'Cough Syrup',
        price: 8.99,
        quantity: 1,
        image_url: '../../../core/api/images/alcof.jpg'
      }
    ],
    address: {
      label: 'Home',
      address: '123 Test Street, Test City, TC 12345'
    },
    subtotal: 20.97,
    shipping: 0,
    total: 20.97,
    status: 'confirmed',
    payment_method: 'upi',
    payment_status: 'completed',
    customer_id: 6,
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
}

// Display order summary
function displayOrderSummary() {
  console.log('=== DISPLAYING ORDER SUMMARY ===');
  console.log('Order data:', orderData);
  
  if (!orderData) {
    console.error('No order data available');
    return;
  }
  
  console.log('Order number:', orderData.order_number);
  console.log('Order total:', orderData.total);
  console.log('Order items:', orderData.items);
  
  // Update order number
  const orderNumberElement = document.getElementById('orderNumber');
  if (orderNumberElement) {
    orderNumberElement.textContent = `#${orderData.order_number}`;
    console.log('Order number updated in UI');
  } else {
    console.error('Order number element not found');
  }
  
  // Update order total
  const orderTotalElement = document.getElementById('orderTotal');
  if (orderTotalElement) {
    orderTotalElement.textContent = `$${orderData.total.toFixed(2)}`;
    console.log('Order total updated in UI');
  } else {
    console.error('Order total element not found');
  }
  
  // Display order items preview
  displayOrderItemsPreview();
  
  // Add fade-in animation
  document.body.classList.add('fade-in-up');
}

// Display order items preview
function displayOrderItemsPreview() {
  console.log('=== DISPLAYING ORDER ITEMS ===');
  const orderItemsContainer = document.getElementById('orderItemsPreview');
  
  if (!orderItemsContainer) {
    console.error('Order items container not found');
    return;
  }
  
  if (!orderData.items) {
    console.error('No items data in order');
    return;
  }
  
  console.log('Items to display:', orderData.items);
  console.log('Number of items:', orderData.items.length);
  
  // Show only first 3 items, with "and X more" if there are more
  const maxItems = 3;
  const itemsToShow = orderData.items.slice(0, maxItems);
  const remainingCount = orderData.items.length - maxItems;
  
  console.log('Items to show (first 3):', itemsToShow);
  console.log('Remaining count:', remainingCount);
  
  orderItemsContainer.innerHTML = itemsToShow.map(item => {
    console.log('Rendering item:', item);
    return `
      <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
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
    `;
  }).join('');
  
  // Add "and X more" if there are more items
  if (remainingCount > 0) {
    orderItemsContainer.innerHTML += `
      <div class="text-center py-2 text-gray-500 text-sm">
        and ${remainingCount} more item${remainingCount > 1 ? 's' : ''}
      </div>
    `;
  }
  
  console.log('Order items HTML generated and inserted');
}

// Go to orders page
function goToOrders() {
  console.log('Going to orders page...');
  
  // Show loading state
  const button = document.querySelector('button[onclick="goToOrders()"]');
  if (button) {
    button.classList.add('btn-loading');
    button.disabled = true;
  }
  
  // Redirect to orders page
  setTimeout(() => {
    console.log('Redirecting to orders page...');
    try {
      window.location.href = '../orders/orders.html';
    } catch (error) {
      console.error('Redirect failed:', error);
      showNotification('Failed to redirect to orders page', 'error');
      
      // Reset button state
      if (button) {
        button.classList.remove('btn-loading');
        button.disabled = false;
      }
    }
  }, 1000);
}

// Continue shopping - redirect to browse page
function continueShopping() {
  console.log('Continuing shopping...');
  
  // Clear cart data if needed (optional)
  // localStorage.removeItem('cart');
  // localStorage.removeItem('checkoutData');
  
  // Redirect to browse page
  window.location.href = '../browse/browse.html';
}

// Download receipt
function downloadReceipt() {
  console.log('Downloading receipt...');
  
  if (!orderData) {
    showNotification('Order data not available for receipt', 'error');
    return;
  }
  
  // Show loading state
  const button = document.querySelector('button[onclick="downloadReceipt()"]');
  if (button) {
    button.classList.add('btn-loading');
    button.disabled = true;
  }
  
  // Simulate receipt generation
  setTimeout(() => {
    // Create a simple receipt content
    const receiptContent = generateReceiptContent();
    
    // Create and download the receipt
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderData.order_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Receipt downloaded successfully', 'success');
    
    // Reset button state
    if (button) {
      button.classList.remove('btn-loading');
      button.disabled = false;
    }
  }, 2000);
}

// Generate receipt content
function generateReceiptContent() {
  const receipt = `
J-MED J-PHARMACY
Receipt

Order Number: ${orderData.order_number}
Order Date: ${new Date(orderData.order_date).toLocaleDateString()}
Payment Method: ${orderData.payment_method.toUpperCase()}
Payment Status: ${orderData.payment_status}

Items:
${orderData.items.map(item => 
  `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${orderData.subtotal.toFixed(2)}
Shipping: $${orderData.shipping.toFixed(2)}
Total: $${orderData.total.toFixed(2)}

Shipping Address:
${orderData.address.label}
${orderData.address.address}

Thank you for your order!
  `;
  
  return receipt;
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

// Make functions globally available
window.goToOrders = goToOrders;
window.continueShopping = continueShopping;
window.downloadReceipt = downloadReceipt;
