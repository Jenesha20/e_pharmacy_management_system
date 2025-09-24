// Admin Orders Page - Load and display orders with items
let orders = [];
let currentPage = 1;
const rowsPerPage = 10;
let filteredOrders = [];

// Load components
function loadComponent(id, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      if (id === 'sidebar') {
      highlightActiveLink();
      }
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
document.addEventListener('DOMContentLoaded', function() {
loadComponent("sidebar", "../../../core/components/sidebar.html");
  loadOrders();
  setupEventListeners();
});

// Load orders from API
async function loadOrders() {
  try {
    console.log('Loading orders from API...');
    
    // Fetch orders
    const ordersResponse = await fetch('http://localhost:3000/orders');
    if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
    const allOrders = await ordersResponse.json();
    
    console.log('All orders fetched:', allOrders);
    
    // Fetch order items and customer data for each order
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        try {
          console.log(`Fetching items for order ${order.order_id}...`);
          
          // Fetch customer data
          let customerData = null;
          try {
            const customerResponse = await fetch(`http://localhost:3000/customers/${order.customer_id}`);
            if (customerResponse.ok) {
              customerData = await customerResponse.json();
              console.log(`Customer data for order ${order.order_id}:`, customerData);
            }
          } catch (error) {
            console.error('Error fetching customer data:', error);
          }
          
          // Fetch shipping address
          let shippingAddress = null;
          try {
            const addressResponse = await fetch(`http://localhost:3000/customer_addresses/${order.shipping_address_id}`);
            if (addressResponse.ok) {
              shippingAddress = await addressResponse.json();
              console.log(`Shipping address for order ${order.order_id}:`, shippingAddress);
            }
          } catch (error) {
            console.error('Error fetching shipping address:', error);
          }
          
          // Fetch order items
          const itemsResponse = await fetch(`http://localhost:3000/order_items?order_id=${order.order_id}`);
          let orderItems = [];
          
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            console.log(`Items for order ${order.order_id}:`, items);
            
            // Handle nested object structure if present
            if (items.length > 0 && items[0]['0']) {
              // Extract from nested structure
              orderItems = Object.keys(items[0])
                .filter(key => !isNaN(key))
                .map(key => items[0][key])
                .filter(item => item && item.product_id);
            } else {
              // Normal array structure
              orderItems = items.filter(item => item && item.product_id);
            }
        } else {
            // Fallback: Check localStorage for order items
            console.log('API failed, checking localStorage for order items...');
            const fallbackItems = JSON.parse(localStorage.getItem('order_items') || '[]');
            orderItems = fallbackItems.filter(item => item.order_id === order.order_id);
            console.log('Found order items in localStorage:', orderItems);
          }
          
          // Get product details for each item
          const itemsWithProducts = await Promise.all(
            orderItems.map(async (item) => {
              try {
                const productResponse = await fetch(`http://localhost:3000/products/${item.product_id}`);
                if (productResponse.ok) {
                  const product = await productResponse.json();
                  return { ...item, product };
                }
              } catch (error) {
                console.error('Error fetching product:', error);
              }
              return { ...item, product: { name: 'Unknown Product', sku: 'N/A' } };
            })
          );
          
          return { ...order, items: itemsWithProducts, customer: customerData, shippingAddress: shippingAddress };
        } catch (error) {
          console.error(`Error fetching items for order ${order.order_id}:`, error);
          return { ...order, items: [] };
        }
      })
    );
    
    orders = ordersWithItems;
    filteredOrders = [...orders];
    
    console.log('Orders with items loaded:', orders);
    updateCards();
    renderTable();
  } catch (error) {
    console.error('Error loading orders:', error);
    showToast('Failed to load orders', 'error');
  }
}

// Update cards with statistics
function updateCards() {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  
  const cardsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
  if (cardsContainer) {
    cardsContainer.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow card-hover">
        <div class="flex items-center">
          <div class="icon-container bg-blue-100 p-3 rounded-full">
            <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-2xl font-bold text-gray-900">${totalOrders}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow card-hover">
        <div class="flex items-center">
          <div class="icon-container bg-yellow-100 p-3 rounded-full">
            <i class="fas fa-clock text-yellow-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-gray-900">${pendingOrders}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow card-hover">
        <div class="flex items-center">
          <div class="icon-container bg-purple-100 p-3 rounded-full">
            <i class="fas fa-cog text-purple-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Processing</p>
            <p class="text-2xl font-bold text-gray-900">${processingOrders}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow card-hover">
        <div class="flex items-center">
          <div class="icon-container bg-green-100 p-3 rounded-full">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Delivered</p>
            <p class="text-2xl font-bold text-gray-900">${deliveredOrders}</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Render orders table
function renderTable() {
  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;
  
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedOrders = filteredOrders.slice(start, end);
  
  tbody.innerHTML = '';

  paginatedOrders.forEach(order => {
    const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const itemCount = order.items ? order.items.length : 0;
    const statusClass = getStatusClass(order.status);
    const paymentStatusClass = getPaymentStatusClass(order.payment_status);
    
    const row = `
      <tr class="expandable-row hover:bg-gray-50" data-order-id="${order.id}">
        <td class="border border-gray-300 px-4 py-2">${order.order_number}</td>
        <td class="border border-gray-300 px-4 py-2">
          ${order.customer ? 
            `${order.customer.first_name} ${order.customer.last_name}` : 
            `Customer ${order.customer_id}`
          }
        </td>
        <td class="border border-gray-300 px-4 py-2">${orderDate}</td>
        <td class="border border-gray-300 px-4 py-2">${itemCount} items</td>
        <td class="border border-gray-300 px-4 py-2">₹${order.total_amount.toFixed(2)}</td>
        <td class="border border-gray-300 px-4 py-2">
          <span class="status-badge ${statusClass}">${order.status.toUpperCase()}</span>
        </td>
        <td class="border border-gray-300 px-4 py-2">
          <span class="status-badge ${paymentStatusClass}">${order.payment_status.toUpperCase()}</span>
        </td>
        <td class="border border-gray-300 px-4 py-2">
          <select class="border rounded-md px-2 py-1 focus:ring focus:ring-green-300" 
                  onchange="updateStatus('${order.id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="packed" ${order.status === 'packed' ? 'selected' : ''}>Packed</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
        </td>
      </tr>
      <tr class="order-details" id="details-${order.id}">
        <td colspan="8" class="border border-gray-300 px-4 py-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <!-- Customer Information -->
            <div class="mb-6">
              <h3 class="font-semibold mb-3 text-lg">Customer Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-medium text-gray-700 mb-2">Personal Details</h4>
                  <p><strong>Name:</strong> ${order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'N/A'}</p>
                  <p><strong>Email:</strong> ${order.customer ? order.customer.email : 'N/A'}</p>
                  <p><strong>Phone:</strong> ${order.customer ? order.customer.phone_number : 'N/A'}</p>
                  <p><strong>Customer ID:</strong> ${order.customer_id}</p>
                </div>
                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-medium text-gray-700 mb-2">Shipping Address</h4>
                  ${order.shippingAddress ? `
                    <p><strong>Address:</strong> ${order.shippingAddress.address_line1}</p>
                    ${order.shippingAddress.address_line2 ? `<p>${order.shippingAddress.address_line2}</p>` : ''}
                    <p><strong>City:</strong> ${order.shippingAddress.city}</p>
                    <p><strong>State:</strong> ${order.shippingAddress.state}</p>
                    <p><strong>ZIP:</strong> ${order.shippingAddress.zip_code}</p>
                  ` : `
                    <p class="text-gray-500">No shipping address found</p>
                  `}
                </div>
                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-medium text-gray-700 mb-2">Order Details</h4>
                  <p><strong>Order Number:</strong> ${order.order_number}</p>
                  <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
                  <p><strong>Total Amount:</strong> ₹${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <!-- Order Items -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-lg">Order Items (${itemCount} items)</h3>
                <button onclick="downloadInvoice('${order.id}')" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i class="fas fa-download mr-2"></i>Download Invoice
                </button>
              </div>
            ${itemCount > 0 ? `
              <table class="w-full border-collapse border border-gray-300">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-2 py-1">Product</th>
                    <th class="border border-gray-300 px-2 py-1">SKU</th>
                    <th class="border border-gray-300 px-2 py-1">Qty</th>
                    <th class="border border-gray-300 px-2 py-1">Price</th>
                    <th class="border border-gray-300 px-2 py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td class="border border-gray-300 px-2 py-1">${item.product?.name || 'Unknown'}</td>
                      <td class="border border-gray-300 px-2 py-1">${item.product?.sku || 'N/A'}</td>
                      <td class="border border-gray-300 px-2 py-1">${item.quantity || 0}</td>
                      <td class="border border-gray-300 px-2 py-1">₹${item.unit_price || 0}</td>
                      <td class="border border-gray-300 px-2 py-1">₹${item.subtotal || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <p class="text-red-500">No items found for this order</p>
            `}
          </div>
        </td>
      </tr>
    `;
    
    tbody.innerHTML += row;
  });

  // Update pagination info
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filteredOrders.length / rowsPerPage)}`;
  }
  
  // Setup expandable rows
  setupExpandableRows();
}

// Setup expandable rows
function setupExpandableRows() {
  document.querySelectorAll('.expandable-row').forEach(row => {
    row.addEventListener('click', function(e) {
      // Prevent event bubbling for buttons and selects
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.closest('button') || e.target.closest('select')) {
        return;
      }
      
      const orderId = this.getAttribute('data-order-id');
      const detailsRow = document.getElementById(`details-${orderId}`);
      
      if (!detailsRow) return;
      
      // Close all other open details
      document.querySelectorAll('.order-details').forEach(detail => {
        if (detail.id != `details-${orderId}`) {
          detail.style.display = 'none';
        }
      });
      
      // Toggle current details
      if (detailsRow.style.display == 'table-row') {
        detailsRow.style.display = 'none';
      } else {
        detailsRow.style.display = 'table-row';
      }
    });
  });
}

// Get status class
function getStatusClass(status) {
  const statusMap = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'packed': 'status-packed',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return statusMap[status] || 'status-pending';
}

// Get payment status class
function getPaymentStatusClass(status) {
  const statusMap = {
    'completed': 'payment-status-completed',
    'pending': 'payment-status-pending',
    'failed': 'payment-status-failed'
  };
  return statusMap[status] || 'payment-status-pending';
}

// Update order status
async function updateStatus(orderId, newStatus) {
  try {
    const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
    },
      body: JSON.stringify({ status: newStatus })
  });
  
  if (response.ok) {
    // Update local data
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
      }
      
      // Re-render table
    renderTable();
    updateCards();
      
      showToast('Order status updated successfully', 'success');
  } else {
      showToast('Failed to update order status', 'error');
  }
} catch (error) {
  console.error('Error updating order status:', error);
    showToast('Failed to update order status', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterOrders);
  }
  
  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
  
  // Payment status filter
  const paymentStatusFilter = document.getElementById('paymentStatusFilter');
  if (paymentStatusFilter) {
    paymentStatusFilter.addEventListener('change', filterOrders);
  }
  
  // Date filters
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  if (startDate) startDate.addEventListener('change', filterOrders);
  if (endDate) endDate.addEventListener('change', filterOrders);
  
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadOrders);
  }
  
  // Pagination
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  if (prevPage) prevPage.addEventListener('click', () => changePage(-1));
  if (nextPage) nextPage.addEventListener('click', () => changePage(1));
}

// Filter orders
function filterOrders() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const paymentStatusFilter = document.getElementById('paymentStatusFilter')?.value || '';
  const startDate = document.getElementById('startDate')?.value || '';
  const endDate = document.getElementById('endDate')?.value || '';
  
  filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm) ||
                        order.customer_id.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPaymentStatus = !paymentStatusFilter || order.payment_status === paymentStatusFilter;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.order_date);
      if (startDate) {
        const start = new Date(startDate);
        matchesDate = matchesDate && orderDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        matchesDate = matchesDate && orderDate <= end;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
  });

currentPage = 1;
renderTable();
}

// Change page
function changePage(direction) {
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const newPage = currentPage + direction;
  
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
renderTable();
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-gray-800 text-white'
    }`;
    toast.style.opacity = '1';
    
setTimeout(() => {
      toast.style.opacity = '0';
}, 3000);
}
}

// Download invoice functionality
function downloadInvoice(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    showToast('Order not found', 'error');
    return;
  }
  
  try {
    // Create invoice HTML
    const invoiceHTML = generateInvoiceHTML(order);
    
    // Create a new window with the invoice
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
    };
    
    showToast('Invoice generated successfully', 'success');
  } catch (error) {
    console.error('Error generating invoice:', error);
    showToast('Failed to generate invoice', 'error');
  }
}

// Generate invoice HTML
function generateInvoiceHTML(order) {
  const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const customerName = order.customer ? 
    `${order.customer.first_name} ${order.customer.last_name}` : 
    `Customer ${order.customer_id}`;
  
  const customerEmail = order.customer ? order.customer.email : 'N/A';
  const customerPhone = order.customer ? order.customer.phone_number : 'N/A';
  
  const shippingAddress = order.shippingAddress ? 
    `${order.shippingAddress.address_line1}${order.shippingAddress.address_line2 ? ', ' + order.shippingAddress.address_line2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip_code}` : 
    'No shipping address available';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-details { margin-bottom: 30px; }
        .customer-info, .order-info { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-amount { font-size: 18px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="invoice-title">INVOICE</div>
        <p>E-Pharmacy Management System</p>
      </div>
      
      <div class="invoice-details">
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
        </div>
        
        <div class="order-info">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.product?.name || 'Unknown Product'}</td>
              <td>${item.product?.sku || 'N/A'}</td>
              <td>${item.quantity || 0}</td>
              <td>₹${item.unit_price || 0}</td>
              <td>₹${item.subtotal || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <p class="total-amount">Total Amount: ₹${order.total_amount.toFixed(2)}</p>
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

// Make functions globally available
window.updateStatus = updateStatus;
window.downloadInvoice = downloadInvoice;
