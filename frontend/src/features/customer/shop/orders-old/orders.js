// Orders page functionality
let orders = [];
let currentTab = 'current';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadHeader();
  loadFooter();
  loadOrders();
  setupEventListeners();
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

// Load orders from localStorage
function loadOrders() {
  orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Add sample orders if none exist (for demo purposes)
  if (orders.length === 0) {
    addSampleOrders();
  }
  
  displayOrders();
}

// Add sample orders for demo
function addSampleOrders() {
  const sampleOrders = [
    {
      id: 'ORD-001',
      items: [
        {
          id: '1',
          name: 'Paracetamol 500mg',
          price: 5.99,
          quantity: 2,
          image_url: '../../../../core/api/images/azithral.jpeg',
          composition: 'Paracetamol (500mg)',
          requires_prescription: true
        }
      ],
      address: {
        label: 'Home',
        address: '123 Main Street, Springfield, IL 62701'
      },
      subtotal: 11.98,
      shipping: 5.00,
      total: 16.98,
      status: 'delivered',
      payment_method: 'card',
      payment_status: 'completed',
      customer_id: '1',
      created_at: '2024-07-15T10:30:00Z'
    },
    {
      id: 'ORD-002',
      items: [
        {
          id: '2',
          name: 'Cough Syrup',
          price: 8.99,
          quantity: 1,
          image_url: '../../../../core/api/images/alcof.jpg',
          composition: 'Dextromethorphan HBr',
          requires_prescription: false
        }
      ],
      address: {
        label: 'Office',
        address: '456 Oak Avenue, Springfield, IL 62702'
      },
      subtotal: 8.99,
      shipping: 0.00,
      total: 8.99,
      status: 'processing',
      payment_method: 'upi',
      payment_status: 'completed',
      customer_id: '1',
      created_at: '2024-07-20T14:15:00Z'
    },
    {
      id: 'ORD-003',
      items: [
        {
          id: '3',
          name: 'Vitamin D3',
          price: 12.99,
          quantity: 1,
          image_url: '../../../../core/api/images/VOGROZ.png',
          composition: 'Cholecalciferol 1000 IU',
          requires_prescription: false
        }
      ],
      address: {
        label: 'Home',
        address: '123 Main Street, Springfield, IL 62701'
      },
      subtotal: 12.99,
      shipping: 5.00,
      total: 17.99,
      status: 'shipped',
      payment_method: 'cod',
      payment_status: 'pending',
      customer_id: '1',
      created_at: '2024-07-22T09:45:00Z'
    }
  ];
  
  localStorage.setItem('orders', JSON.stringify(sampleOrders));
  orders = sampleOrders;
}

// Display orders based on current tab
function displayOrders() {
  const currentOrdersList = document.getElementById('currentOrdersList');
  const pastOrdersList = document.getElementById('pastOrdersList');
  const emptyState = document.getElementById('emptyState');
  
  if (!currentOrdersList || !pastOrdersList || !emptyState) return;
  
  // Filter orders based on status
  const currentOrders = orders.filter(order => 
    ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status)
  );
  
  const pastOrders = orders.filter(order => 
    ['delivered', 'cancelled', 'returned'].includes(order.status)
  );
  
  // Clear existing content
  currentOrdersList.innerHTML = '';
  pastOrdersList.innerHTML = '';
  
  if (currentTab === 'current') {
    if (currentOrders.length === 0) {
      showEmptyState();
    } else {
      currentOrdersList.innerHTML = currentOrders.map(order => createOrderCard(order)).join('');
    }
  } else {
    if (pastOrders.length === 0) {
      showEmptyState();
    } else {
      pastOrdersList.innerHTML = pastOrders.map(order => createOrderCard(order)).join('');
    }
  }
}

// Create order card HTML
function createOrderCard(order) {
  const statusConfig = getStatusConfig(order.status);
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
    <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex items-center space-x-4">
        <!-- Product Image -->
        <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
          ${order.items && order.items.length > 0 ? `
            <img src="${order.items[0].image_url || order.items[0].image || 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image'}" 
                 alt="${order.items[0].name}" 
                 class="w-16 h-16 object-cover rounded-lg"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="placeholder-icon" style="display: none;">
              <i class="fas fa-pills text-gray-400 text-2xl"></i>
            </div>
          ` : `
            <i class="fas fa-shopping-bag text-gray-400 text-2xl"></i>
          `}
        </div>
        
        <!-- Order Details -->
        <div class="flex-grow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Order placed on ${orderDate}</p>
              <p class="text-lg font-medium text-gray-900">Order ID: <span class="text-blue-600">${order.id}</span></p>
              <div class="flex items-center mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.class}">
                  <i class="${statusConfig.icon} mr-1"></i>
                  ${statusConfig.label}
                </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900">$${order.total.toFixed(2)}</p>
              <p class="text-sm text-gray-500">${order.items ? order.items.length : 0} item(s)</p>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col space-y-2">
          <button onclick="viewOrderDetails('${order.id}')" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Details
          </button>
          ${order.status === 'delivered' ? `
            <button onclick="reorderItems('${order.id}')" 
                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
              Reorder
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Get status configuration
function getStatusConfig(status) {
  const statusMap = {
    'pending': { label: 'Pending', icon: 'fas fa-clock', class: 'bg-yellow-100 text-yellow-800' },
    'confirmed': { label: 'Confirmed', icon: 'fas fa-check-circle', class: 'bg-blue-100 text-blue-800' },
    'processing': { label: 'Processing', icon: 'fas fa-cog', class: 'bg-purple-100 text-purple-800' },
    'shipped': { label: 'Shipped', icon: 'fas fa-shipping-fast', class: 'bg-indigo-100 text-indigo-800' },
    'out_for_delivery': { label: 'Out for Delivery', icon: 'fas fa-truck', class: 'bg-orange-100 text-orange-800' },
    'delivered': { label: 'Delivered', icon: 'fas fa-check-circle', class: 'bg-green-100 text-green-800' },
    'cancelled': { label: 'Cancelled', icon: 'fas fa-times-circle', class: 'bg-red-100 text-red-800' },
    'returned': { label: 'Returned', icon: 'fas fa-undo', class: 'bg-gray-100 text-gray-800' }
  };
  
  return statusMap[status] || { label: 'Unknown', icon: 'fas fa-question', class: 'bg-gray-100 text-gray-800' };
}

// Show empty state
function showEmptyState() {
  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.classList.remove('hidden');
  }
}

// Hide empty state
function hideEmptyState() {
  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.classList.add('hidden');
  }
}

// Switch between tabs
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  const currentTabBtn = document.getElementById('currentOrdersTab');
  const pastTabBtn = document.getElementById('pastOrdersTab');
  const currentSection = document.getElementById('currentOrdersSection');
  const pastSection = document.getElementById('pastOrdersSection');
  
  if (tab === 'current') {
    currentTabBtn.classList.add('active');
    pastTabBtn.classList.remove('active');
    currentSection.classList.remove('hidden');
    pastSection.classList.add('hidden');
  } else {
    currentTabBtn.classList.remove('active');
    pastTabBtn.classList.add('active');
    currentSection.classList.add('hidden');
    pastSection.classList.remove('hidden');
  }
  
  // Hide empty state and display orders
  hideEmptyState();
  displayOrders();
}

// View order details
function viewOrderDetails(orderId) {
  // Store order ID in localStorage for order details page
  localStorage.setItem('selectedOrderId', orderId);
  // Navigate to order details page
  window.location.href = 'order-details.html';
}

// Reorder items
function reorderItems(orderId) {
  const order = orders.find(o => o.id == orderId);
  if (!order || !order.items) {
    showNotification('Order not found or has no items', 'error');
    return;
  }
  
  // Add items to cart
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let addedCount = 0;
  
  order.items.forEach(item => {
    // Check if item already exists in cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
        composition: item.composition,
        requires_prescription: item.requires_prescription
      });
    }
    addedCount++;
  });
  
  localStorage.setItem('cart', JSON.stringify(cart));
  showNotification(`${addedCount} item(s) added to cart`, 'success');
  
  // Navigate to cart
  setTimeout(() => {
    window.location.href = '../shop/cart/cart.html';
  }, 1500);
}

// Setup event listeners
function setupEventListeners() {
  // Add any additional event listeners here
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
window.switchTab = switchTab;
window.viewOrderDetails = viewOrderDetails;
window.reorderItems = reorderItems;
