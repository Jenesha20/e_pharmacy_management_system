// Order details page functionality with backend integration
import { getCompleteOrderDetails } from '../../core/utils/orders-api.js';

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

// Load order details
async function loadOrderDetails() {
  const orderId = localStorage.getItem('selectedOrderId');
  if (!orderId) {
    showErrorState();
    return;
  }
  
  try {
    showLoadingState();
    
    // Fetch complete order details from backend
    currentOrder = await getCompleteOrderDetails(orderId);
    
    hideLoadingState();
    displayOrderDetails();
  } catch (error) {
    console.error('Error loading order details:', error);
    hideLoadingState();
    showErrorState();
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

// Display order details
function displayOrderDetails() {
  if (!currentOrder) return;
  
  // Show content
  const orderHeader = document.getElementById('orderHeader');
  const orderContent = document.getElementById('orderContent');
  
  if (orderHeader) orderHeader.classList.remove('hidden');
  if (orderContent) orderContent.classList.remove('hidden');
  
  // Update order header
  document.getElementById('orderNumber').textContent = `Order #${currentOrder.order_number || currentOrder.id}`;
  
  // Display order status timeline
  displayOrderStatus();
  
  // Display order items
  displayOrderItems();
  
  // Display order information
  displayOrderInformation();
  
  // Display order summary
  displayOrderSummary();
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

// Display order items
function displayOrderItems() {
  const itemsContainer = document.getElementById('orderItems');
  if (!itemsContainer || !currentOrder.items) return;
  
  itemsContainer.innerHTML = currentOrder.items.map(item => `
    <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
      <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <img src="${item.product?.image_url || 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image'}" 
             alt="${item.product?.name || 'Unknown Product'}" 
             class="w-16 h-16 object-cover rounded-lg"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="placeholder-icon" style="display: none;">
          <i class="fas fa-pills text-gray-400 text-2xl"></i>
        </div>
      </div>
      
      <div class="flex-grow">
        <h3 class="font-medium text-gray-900">${item.product?.name || 'Unknown Product'}</h3>
        <p class="text-sm text-gray-500">${item.product?.composition || 'Medicine'}</p>
        <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
        <p class="text-sm text-gray-600">Unit Price: $${item.unit_price.toFixed(2)}</p>
        ${item.product?.requires_prescription ? '<p class="text-xs text-orange-600 mt-1"><i class="fas fa-exclamation-triangle mr-1"></i>Prescription Required</p>' : ''}
      </div>
      
      <div class="text-right">
        <p class="text-lg font-semibold text-gray-900">$${item.subtotal.toFixed(2)}</p>
        <p class="text-sm text-gray-500">$${item.unit_price.toFixed(2)} each</p>
      </div>
    </div>
  `).join('');
}

// Display order information
function displayOrderInformation() {
  // Calculate totals from order items
  const subtotal = currentOrder.items ? 
    currentOrder.items.reduce((sum, item) => sum + item.subtotal, 0) : 
    currentOrder.total_amount;
  
  const shipping = currentOrder.total_amount - subtotal;
  
  document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('orderShipping').textContent = `$${shipping.toFixed(2)}`;
  document.getElementById('orderTotal').textContent = `$${currentOrder.total_amount.toFixed(2)}`;
}

// Display order summary
function displayOrderSummary() {
  const orderDate = new Date(currentOrder.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  document.getElementById('orderDate').textContent = orderDate;
  document.getElementById('shippingAddress').textContent = currentOrder.address ? 
    `${currentOrder.address.address_line1}, ${currentOrder.address.city}, ${currentOrder.address.state} ${currentOrder.address.zip_code}` : 
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

// Reorder items
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
      if (item.product) {
        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => cartItem.id === item.product.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.push({
            id: item.product.id,
            name: item.product.name,
            price: item.unit_price,
            quantity: item.quantity,
            image_url: item.product.image_url,
            composition: item.product.composition,
            requires_prescription: item.product.requires_prescription
          });
        }
        addedCount++;
      }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${addedCount} item(s) added to cart`, 'success');
    
    // Navigate to cart
    setTimeout(() => {
      window.location.href = '../shop/cart/cart.html';
    }, 1500);
  } catch (error) {
    console.error('Error reordering items:', error);
    showNotification('Failed to add items to cart', 'error');
  }
}

// Download invoice
function downloadInvoice() {
  showNotification('Invoice download feature coming soon!', 'success');
  // In a real application, this would generate and download a PDF invoice
}

// Contact support
function contactSupport() {
  showNotification('Redirecting to support...', 'success');
  setTimeout(() => {
    window.location.href = '../about/contact/contact.html';
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

// Make functions globally available
window.reorderItems = reorderItems;
window.downloadInvoice = downloadInvoice;
window.contactSupport = contactSupport;
