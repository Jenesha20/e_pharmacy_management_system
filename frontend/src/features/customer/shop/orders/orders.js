// Orders page functionality with backend integration
// Note: Import statements require a local server to work properly
// For now, we'll define the functions locally to avoid import issues

// API functions (copied from orders-api.js to avoid import issues)
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
        
        // Reattach event listeners after loading
        setTimeout(attachEventListeners, 100);
      }
    })
    .catch(err => console.error("Error loading component:", err));
}

// Load components
document.addEventListener('DOMContentLoaded', function () {
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");
  initPage();
});

const API_BASE_URL = 'http://localhost:3000';

// Get customer orders with details
// async function getCustomerOrdersWithDetails(customerId) {
//   try {
//     console.log('Fetching orders for customer:', customerId);
    
//     // Get orders for the customer - filter by customer_id
//     const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
//     if (!ordersResponse.ok) {
//       console.log('Orders API not available, using localStorage fallback');
//       throw new Error('Orders API not available');
//     }
    
//     const allOrders = await ordersResponse.json();
//     console.log('All orders fetched from API:', allOrders);
    
//     // Filter orders by customer_id - convert both to strings for comparison
//     const orders = allOrders.filter(order => {
//       const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
//       const currentCustomerId = customerId ? customerId.toString() : null;
//       console.log('Comparing order customer ID:', orderCustomerId, 'with current:', currentCustomerId);
//       return orderCustomerId == currentCustomerId;
//     });
//     console.log('Filtered orders for customer:', orders);
    
//     // For each order, get the order items
//     const ordersWithDetails = await Promise.all(
//       orders.map(async (order) => {
//         try {
//           // Use order_id field to match with order_items
//           const itemsResponse = await fetch(`${API_BASE_URL}/order_items?order_id=${order.order_id}`);
//           if (!itemsResponse.ok) throw new Error('Failed to fetch order items');
//           const orderItems = await itemsResponse.json();
//           console.log('Order items for order', order.order_id, ':', orderItems);
          
//           // Get product details for each item
//           const itemsWithProducts = await Promise.all(
//             orderItems.map(async (item) => {
//               try {
//                 console.log('Fetching product for ID:', item.product_id);
//                 if (!item.product_id || item.product_id == 'undefined') {
//                   console.warn('Invalid product_id:', item.product_id);
//                   return { ...item, product: { name: 'Unknown Product', image_url: null } };
//                 }
                
//                 const productResponse = await fetch(`${API_BASE_URL}/products/${item.product_id}`);
//                 if (!productResponse.ok) throw new Error('Failed to fetch product');
//                 const product = await productResponse.json();
//                 return { ...item, product };
//               } catch (error) {
//                 console.error('Error fetching product:', error);
//                 return { ...item, product: { name: 'Unknown Product', image_url: null } };
//               }
//             })
//           );
          
//           return { ...order, items: itemsWithProducts };
//         } catch (error) {
//           console.error('Error fetching order details:', error);
//           return order;
//         }
//       })
//     );
    
//     return ordersWithDetails;
//   } catch (error) {
//     console.warn('API failed, using localStorage fallback:', error);
    
//     // Fallback to localStorage
//     const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
//     console.log('All orders from localStorage fallback:', allOrders);
//     console.log('Looking for customer ID:', customerId, 'Type:', typeof customerId);
    
//     // Filter orders by customer_id - convert both to strings for comparison
//     const orders = allOrders.filter(order => {
//       const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
//       const currentCustomerId = customerId ? customerId.toString() : null;
//       console.log('Comparing order customer ID:', orderCustomerId, 'with current:', currentCustomerId, 'Match:', orderCustomerId == currentCustomerId);
//       return orderCustomerId == currentCustomerId;
//     });
    
//     console.log('Filtered orders from localStorage:', orders);
//     console.log('Number of matching orders:', orders.length);
//     return orders;
//   }
// }

// Get customer orders with details
// Get customer orders with details
async function getCustomerOrdersWithDetails(customerId) {
  try {
    console.log('Fetching orders for customer:', customerId);
    
    // Get orders for the customer - filter by customer_id
    const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
    if (!ordersResponse.ok) {
      console.log('Orders API not available, using localStorage fallback');
      throw new Error('Orders API not available');
    }
    
    const allOrders = await ordersResponse.json();
    console.log('All orders fetched from API:', allOrders);
    
    // Filter orders by customer_id - convert both to strings for comparison
    const orders = allOrders.filter(order => {
      const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
      const currentCustomerId = customerId ? customerId.toString() : null;
      console.log('Comparing order customer ID:', orderCustomerId, 'with current:', currentCustomerId);
      return orderCustomerId == currentCustomerId;
    });
    console.log('Filtered orders for customer:', orders);
    
    // For each order, get the order items
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          console.log('Looking for items for order:', {
            orderId: order.id,
            numericOrderId: order.order_id,
            orderNumber: order.order_number
          });
          
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
          
          // Method 3: Check localStorage as final fallback
          if (orderItems.length === 0) {
            console.log('API failed, checking localStorage for order items...');
            const fallbackItems = JSON.parse(localStorage.getItem('order_items') || '[]');
            orderItems = fallbackItems.filter(item => 
              item.order_id === order.order_id || item.order_id === order.id
            );
            console.log('Found order items in localStorage:', orderItems);
          }
          
          // Method 4: Check if order items exist in database but with different structure
          if (orderItems.length === 0) {
            console.log('Checking database for order items with different structure...');
            try {
              const allItemsResponse = await fetch(`${API_BASE_URL}/order_items`);
              if (allItemsResponse.ok) {
                const allItems = await allItemsResponse.json();
                orderItems = allItems.filter(item => 
                  item.order_id === order.order_id || item.order_id === order.id
                );
                console.log('Found order items in database:', orderItems);
              }
            } catch (error) {
              console.error('Error fetching all order items:', error);
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
                if (!item.product_id || item.product_id == 'undefined') {
                  console.warn('Invalid product_id:', item.product_id);
                  return { ...item, product: { name: 'Unknown Product', image_url: null } };
                }
                
                const productResponse = await fetch(`${API_BASE_URL}/products/${item.product_id}`);
                if (!productResponse.ok) throw new Error('Failed to fetch product');
                const product = await productResponse.json();
                return { ...item, product };
              } catch (error) {
                console.error('Error fetching product:', error);
                return { ...item, product: { name: 'Unknown Product', image_url: null } };
              }
            })
          );
          
          // Fetch customer data for the order
          let customerData = null;
          try {
            const customerResponse = await fetch(`${API_BASE_URL}/customers/${order.customer_id}`);
            if (customerResponse.ok) {
              customerData = await customerResponse.json();
              console.log(`Customer data for order ${order.order_id}:`, customerData);
            }
          } catch (error) {
            console.error('Error fetching customer data:', error);
          }
          
          return { ...order, items: itemsWithProducts, customer: customerData };
        } catch (error) {
          console.error('Error fetching order details:', error);
          return { ...order, items: [] };
        }
      })
    );
    
    return ordersWithDetails;
  } catch (error) {
    console.warn('API failed, using localStorage fallback:', error);
    const orders = allOrders.filter(order => {
      const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
      const currentCustomerId = customerId ? customerId.toString() : null;
      console.log('Comparing order customer ID:', orderCustomerId, 'with current:', currentCustomerId, 'Match:', orderCustomerId == currentCustomerId);
      return orderCustomerId == currentCustomerId;
    });
    
    console.log('Filtered orders from localStorage:', orders);
    console.log('Number of matching orders:', orders.length);
    return orders;
  }
}


let orders = [];
let currentTab = 'current';
let currentUserId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadHeader();
  loadFooter();
  initializeAuth();
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
          console.log('Navbar auth initialized from orders page');
        } else if (window.refreshAuth) {
          window.refreshAuth();
          console.log('Navbar auth refreshed from orders page');
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

// Initialize authentication and load orders
async function initializeAuth() {
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  console.log('Current user from localStorage:', currentUser);
  
  if (currentUser && currentUser.customer_id) {
    // Get customer ID from the currentUser object - ensure it's a string
    currentUserId = currentUser.customer_id.toString();
    console.log('Using customer ID from currentUser:', currentUserId, 'Type:', typeof currentUserId);
  } else {
    console.log('No user found, using default customer ID 6 for testing');
    currentUserId = '6'; // Default to customer 6 as string for consistency
    // Also set currentUser for consistency
    localStorage.setItem('currentUser', JSON.stringify({
      customer_id: '6', // Store as string for consistency
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    }));
  }
  
  // Ensure currentUserId is always a string for consistency
  currentUserId = currentUserId.toString();
  console.log('Final customer ID:', currentUserId, 'Type:', typeof currentUserId);
  
  // Debug: Check all orders in localStorage
  debugOrdersInStorage();
  
  await loadOrders();
}

// Debug function to check orders in storage
function debugOrdersInStorage() {
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  console.log('== DEBUG: All orders in localStorage ==');
  console.log('Total orders:', allOrders.length);
  console.log('Current user object:', currentUser);
  console.log('Current user ID:', currentUserId, 'Type:', typeof currentUserId);
  
  allOrders.forEach((order, index) => {
    console.log(`Order ${index + 1}:`, {
      id: order.id,
      order_id: order.order_id,
      customer_id: order.customer_id,
      customer_id_type: typeof order.customer_id,
      order_number: order.order_number,
      status: order.status
    });
  });
  
  // Show which orders should match
  const matchingOrders = allOrders.filter(order => {
    const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
    const currentCustomerId = currentUserId ? currentUserId.toString() : null;
    return orderCustomerId == currentCustomerId;
  });
  
  console.log('Orders that should match current user:', matchingOrders.length);
  console.log('=== END DEBUG ===');
}

// Load orders from backend
async function loadOrders() {
  try {
    console.log('Loading orders for customer ID:', currentUserId);
    showLoadingState();
    
    // Fetch orders from backend
    orders = await getCustomerOrdersWithDetails(currentUserId);
    console.log('Orders loaded from backend:', orders);
    console.log('Number of orders loaded:', orders.length);
    
    // Double-check that orders are filtered by customer ID
    const filteredOrders = orders.filter(order => {
      const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
      const currentCustomerId = currentUserId ? currentUserId.toString() : null;
      return orderCustomerId == currentCustomerId;
    });
    
    if (filteredOrders.length != orders.length) {
      console.warn('Backend returned orders for other customers, filtering them out');
      orders = filteredOrders;
    }
    
    hideLoadingState();
    displayOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    hideLoadingState();
    showNotification('Failed to load orders. Please try again.', 'error');
    
    // Fallback to localStorage if backend fails
    loadOrdersFromLocalStorage();
  }
}

// Fallback: Load orders from localStorage
function loadOrdersFromLocalStorage() {
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  console.log('=== LOADING FROM LOCALSTORAGE ===');
  console.log('All orders from localStorage:', allOrders);
  console.log('Total orders in localStorage:', allOrders.length);
  console.log('Filtering for customer ID:', currentUserId, 'Type:', typeof currentUserId);
  
  // Filter orders by customer ID
  orders = allOrders.filter(order => {
    const orderCustomerId = order.customer_id ? order.customer_id.toString() : null;
    const currentCustomerId = currentUserId ? currentUserId.toString() : null;
    console.log('Comparing order customer ID:', orderCustomerId, 'with current:', currentCustomerId, 'Match:', orderCustomerId == currentCustomerId);
    return orderCustomerId == currentCustomerId;
  });
  
  console.log('Filtered orders for customer:', orders);
  console.log('Number of matching orders:', orders.length);
  console.log('=== END LOCALSTORAGE LOAD ===');
  displayOrders();
}

// Show loading state
function showLoadingState() {
  const loadingState = document.getElementById('loadingState');
  const currentSection = document.getElementById('currentOrdersSection');
  const pastSection = document.getElementById('pastOrdersSection');
  const emptyState = document.getElementById('emptyState');
  
  if (loadingState) loadingState.classList.remove('hidden');
  if (currentSection) currentSection.classList.add('hidden');
  if (pastSection) pastSection.classList.add('hidden');
  if (emptyState) emptyState.classList.add('hidden');
}

// Hide loading state
function hideLoadingState() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) loadingState.classList.add('hidden');
}

// Display orders based on current tab
function displayOrders() {
  const currentOrdersList = document.getElementById('currentOrdersList');
  const pastOrdersList = document.getElementById('pastOrdersList');
  const emptyState = document.getElementById('emptyState');
  const currentSection = document.getElementById('currentOrdersSection');
  const pastSection = document.getElementById('pastOrdersSection');
  
  if (!currentOrdersList || !pastOrdersList || !emptyState) return;
  
  // Filter orders based on status
  const currentOrders = orders.filter(order => 
    ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status)
  );
  
  const pastOrders = orders.filter(order => 
    ['delivered', 'cancelled', 'returned'].includes(order.status)
  );
  
  console.log('Total orders:', orders.length);
  console.log('Current orders:', currentOrders.length);
  console.log('Past orders:', pastOrders.length);
  console.log('Order statuses:', orders.map(o => o.status));
  
  // Clear existing content
  currentOrdersList.innerHTML = '';
  pastOrdersList.innerHTML = '';
  
  if (currentTab == 'current') {
    if (currentOrders.length == 0) {
      showEmptyState();
    } else {
      currentSection.classList.remove('hidden');
      currentOrdersList.innerHTML = currentOrders.map(order => createOrderCard(order)).join('');
    }
  } else {
    if (pastOrders.length == 0) {
      showEmptyState();
    } else {
      pastSection.classList.remove('hidden');
      pastOrdersList.innerHTML = pastOrders.map(order => createOrderCard(order)).join('');
    }
  }
}

// Create order card HTML
function createOrderCard(order) {
  const statusConfig = getStatusConfig(order.status);
  const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get first item for display
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  
  return `
    <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex items-center space-x-4">
        <!-- Product Image -->
        <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
          ${firstItem && firstItem.product ? `
            <img src="${firstItem.product.image_url || 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image'}" 
                 alt="${firstItem.product.name}" 
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
              <p class="text-lg font-medium text-gray-900">Order ID: <span class="text-blue-600">${order.order_number || order.id}</span></p>
              <div class="flex items-center mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.class}">
                  <i class="${statusConfig.icon} mr-1"></i>
                  ${statusConfig.label}
                </span>
              </div>
            </div>
            <div class="text-right">
  <p class="text-lg font-semibold text-gray-900">Rs ${order.total_amount.toFixed(2)}</p>
  
</div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col space-y-2">
          <button onclick="viewOrderDetails('${order.id}')" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Details
          </button>
          ${order.status == 'delivered' ? `
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
  const currentSection = document.getElementById('currentOrdersSection');
  const pastSection = document.getElementById('pastOrdersSection');
  
  if (emptyState) emptyState.classList.remove('hidden');
  if (currentSection) currentSection.classList.add('hidden');
  if (pastSection) pastSection.classList.add('hidden');
}

// Hide empty state
function hideEmptyState() {
  const emptyState = document.getElementById('emptyState');
  if (emptyState) emptyState.classList.add('hidden');
}

// Switch between tabs
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  const currentTabBtn = document.getElementById('currentOrdersTab');
  const pastTabBtn = document.getElementById('pastOrdersTab');
  const currentSection = document.getElementById('currentOrdersSection');
  const pastSection = document.getElementById('pastOrdersSection');
  
  if (tab == 'current') {
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
async function reorderItems(orderId) {
  const order = orders.find(o => o.id == orderId);
  if (!order || !order.items) {
    showNotification('Order not found or has no items', 'error');
    return;
  }
  
  try {
    // Add items to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let addedCount = 0;
    
    for (const item of order.items) {
      if (item.product) {
        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => cartItem.id == item.product.id);
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
      window.location.href = '/frontend/src/features/customer/shop/cart/cart.html';
    }, 1500);
  } catch (error) {
    console.error('Error reordering items:', error);
    showNotification('Failed to add items to cart', 'error');
  }
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg notification ${
    type == 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
