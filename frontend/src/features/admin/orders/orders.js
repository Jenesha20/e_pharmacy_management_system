// function loadComponent(id, filePath) {
//     fetch(filePath)
//       .then(response => response.text())
//       .then(data => {
//         document.getElementById(id).innerHTML = data;
//         highlightActiveLink();
//       })
//       .catch(err => console.error("Error loading component:", err));
//   }
  
//   function highlightActiveLink() {
//     const currentPath = window.location.pathname;
//     const links = document.querySelectorAll("#sidebar a");
  
//     links.forEach(link => {
//       const href = link.getAttribute("href");
//       if (currentPath.endsWith(href.replace("../", ""))) {
//         link.classList.add("bg-blue-600", "text-white");
//       } else {
//         link.classList.remove("bg-blue-600", "text-white");
//       }
//     });
//   }
  
//   loadComponent("sidebar", "../../../core/components/sidebar.html");
  
//  // Mock Orders Data
// let orders = [
//     { orderId: 101, customerId: "C001", name: "Paracetamol", quantity: 2, price: 50, status: "Inprogress", orderDate: "2025-09-01" },
//     { orderId: 102, customerId: "C002", name: "Amoxicillin", quantity: 1, price: 120, status: "Packed", orderDate: "2025-09-05" },
//     { orderId: 103, customerId: "C003", name: "Cough Syrup", quantity: 3, price: 90, status: "Delivered", orderDate: "2025-09-07" },
//     { orderId: 104, customerId: "C004", name: "Vitamin C", quantity: 5, price: 200, status: "Inprogress", orderDate: "2025-09-09" },
//     { orderId: 105, customerId: "C005", name: "Ibuprofen", quantity: 2, price: 75, status: "Packed", orderDate: "2025-09-10" },
//     { orderId: 106, customerId: "C006", name: "Antacid", quantity: 4, price: 60, status: "Delivered", orderDate: "2025-09-11" },
//     { orderId: 107, customerId: "C007", name: "Insulin", quantity: 1, price: 500, status: "Inprogress", orderDate: "2025-09-12" },
//     { orderId: 108, customerId: "C008", name: "Aspirin", quantity: 2, price: 110, status: "Delivered", orderDate: "2025-09-12" }
//   ];
  
//   let currentPage = 1;
//   const rowsPerPage = 5;
//   let filteredOrders = [...orders]; // filtered by date (initially all)
//   let tableOrders = [...filteredOrders]; // what will be displayed in the table
  
  
//   // Render Table
//   function renderTable() {
//     let tbody = document.getElementById("ordersTable");
//     tbody.innerHTML = "";
  
//     let start = (currentPage - 1) * rowsPerPage;
//     let end = start + rowsPerPage;
//     let paginatedOrders = tableOrders.slice(start, end);
  
//     paginatedOrders.forEach(order => {
//       let row = `
//         <tr class="text-center border">
//           <td class="p-3 border">${order.orderId}</td>
//           <td class="p-3 border">${order.customerId}</td>
//           <td class="p-3 border">${order.name}</td>
//           <td class="p-3 border">${order.quantity}</td>
//           <td class="p-3 border">₹${order.price}</td>
//           <td class="p-3 border">${order.orderDate}</td>
//           <td class="p-3 border">
//             <select class="border rounded-md px-2 py-1 focus:ring focus:ring-green-300"
//               onchange="updateStatus(${order.orderId}, this.value)">
//               <option ${order.status === "Inprogress" ? "selected" : ""}>Inprogress</option>
//               <option ${order.status === "Packed" ? "selected" : ""}>Packed</option>
//               <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
//             </select>
//           </td>
//         </tr>`;
//       tbody.innerHTML += row;
//     });
  
//     document.getElementById("pageInfo").innerText =
//       `Page ${currentPage} of ${Math.ceil(tableOrders.length / rowsPerPage)}`;
  
//     updateCards();
//   }
  
//   // Update Cards
//   function updateCards() {
//     const all = filteredOrders.length;
//     const inprogress = filteredOrders.filter(o => o.status === "Inprogress").length;
//     const packed = filteredOrders.filter(o => o.status === "Packed").length;
//     const delivered = filteredOrders.filter(o => o.status === "Delivered").length;
  
//     document.getElementById("allOrdersCount").innerText = all;
//     document.getElementById("inprogressCount").innerText = inprogress;
//     document.getElementById("packedCount").innerText = packed;
//     document.getElementById("deliveredCount").innerText = delivered;
//   }
  
  
//   // Update Status
//   function updateStatus(orderId, newStatus) {
//     let order = orders.find(o => o.orderId === orderId);
//     if (order) {
//       order.status = newStatus;
//       showToast(`✅ Order #${orderId} updated to ${newStatus}`);
//       renderTable();
//     }
//   }
//   function filterByStatus(status) {
//     if (status === "All") {
//       filteredOrders = [...orders];
//     } else {
//       filteredOrders = orders.filter(o => o.status === status);
//     }
//     currentPage = 1;
//     renderTable();
//   }

//   document.querySelectorAll(".filter-btn").forEach(button => {
//     button.addEventListener("click", () => {
//       const status = button.getAttribute("data-status");
//       if (status === "All") {
//         tableOrders = [...filteredOrders]; // table shows all filtered by date
//       } else {
//         tableOrders = filteredOrders.filter(o => o.status === status);
//       }
//       currentPage = 1;
//       renderTable();
//     });
//   });
  
  
  
//   // Toast
//   function showToast(message) {
//     let toast = document.getElementById("toast");
//     toast.innerText = message;
//     toast.classList.remove("opacity-0");
//     toast.classList.add("opacity-100");
//     setTimeout(() => {
//       toast.classList.remove("opacity-100");
//       toast.classList.add("opacity-0");
//     }, 3000);
//   }
  
//   // Pagination
//   document.getElementById("prevPage").addEventListener("click", () => {
//     if (currentPage > 1) {
//       currentPage--;
//       renderTable();
//     }
//   });
  
//   document.getElementById("nextPage").addEventListener("click", () => {
//     if (currentPage < Math.ceil(filteredOrders.length / rowsPerPage)) {
//       currentPage++;
//       renderTable();
//     }
//   });
  
//   // Date Filter
//   function filterByDate() {
//     let start = document.getElementById("startDate").value;
//     let end = document.getElementById("endDate").value;
  
//     if (start && end) {
//       filteredOrders = orders.filter(o => o.orderDate >= start && o.orderDate <= end);
//     } else {
//       filteredOrders = [...orders]; // reset if no range
//     }
  
//     tableOrders = [...filteredOrders]; // table initially shows all filteredOrders
//     currentPage = 1;
//     renderTable();
//   }
  
  
//   document.getElementById("startDate").addEventListener("change", filterByDate);
//   document.getElementById("endDate").addEventListener("change", filterByDate);
  
//   // Refresh
//   document.getElementById("refreshBtn").addEventListener("click", () => {
//     document.getElementById("startDate").value = "";
//     document.getElementById("endDate").value = "";
//     filteredOrders = [...orders];
//     tableOrders = [...filteredOrders]; // reset tableOrders too
//     currentPage = 1;
//     renderTable();
//   });
  
  
//   // Initial render
//   renderTable();
  

function loadComponent(id, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      highlightActiveLink();
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

loadComponent("sidebar", "../../../core/components/sidebar.html");

// Global variables
let orders = [];
let customers = [];
let customerAddresses = [];
let orderItems = [];
let products = [];
let prescriptions = [];
let currentPage = 1;
const rowsPerPage = 5;
let filteredOrders = [];
let tableOrders = [];

// API endpoints
const API_BASE = 'http://localhost:3000';
const ENDPOINTS = {
orders: `${API_BASE}/orders`,
customers: `${API_BASE}/customers`,
customerAddresses: `${API_BASE}/customer_addresses`,
orderItems: `${API_BASE}/order_items`,
products: `${API_BASE}/products`,
prescriptions: `${API_BASE}/prescriptions`
};

// Fetch data from API
async function fetchData() {
try {
  const [
    ordersRes, 
    customersRes, 
    addressesRes, 
    orderItemsRes, 
    productsRes, 
    prescriptionsRes
  ] = await Promise.all([
    fetch(ENDPOINTS.orders),
    fetch(ENDPOINTS.customers),
    fetch(ENDPOINTS.customerAddresses),
    fetch(ENDPOINTS.orderItems),
    fetch(ENDPOINTS.products),
    fetch(ENDPOINTS.prescriptions)
  ]);

  orders = await ordersRes.json();
  customers = await customersRes.json();
  customerAddresses = await addressesRes.json();
  orderItems = await orderItemsRes.json();
  products = await productsRes.json();
  prescriptions = await prescriptionsRes.json();

  console.log('Orders data:', orders);
  console.log('Customers data:', customers);

  // Enrich orders with additional data
  orders = orders.map(order => {
    const customer = customers.find(c => c.customer_id === order.customer_id);
    const address = customerAddresses.find(a => a.address_id === order.shipping_address_id);
    const items = orderItems.filter(item => item.order_id === order.order_id);
    const prescription = order.prescription_id ? prescriptions.find(p => p.prescription_id === order.prescription_id) : null;
    
    // Calculate total items quantity
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Enrich items with product details
    const enrichedItems = items.map(item => {
      const product = products.find(p => p.product_id === item.product_id);
      return {
        ...item,
        product_name: product ? product.name : 'Unknown Product',
        product_sku: product ? product.sku : 'N/A',
        product_image: product ? product.image_url : null
      };
    });
    
    return {
      ...order,
      customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer',
      customer_email: customer ? customer.email : 'N/A',
      customer_phone: customer ? customer.phone_number : 'N/A',
      shipping_address: address ? `${address.address_line1}, ${address.city}, ${address.state} ${address.zip_code}` : 'Address not found',
      items: enrichedItems,
      total_items: totalItems,
      prescription: prescription || null
    };
  });

  filteredOrders = [...orders];
  tableOrders = [...filteredOrders];
  renderTable();
  updateCards();
} catch (error) {
  console.error('Error fetching data:', error);
  showToast('Error loading data. Please try again.');
}
}

// Render Table
function renderTable() {
let tbody = document.getElementById("ordersTable");
tbody.innerHTML = "";

let start = (currentPage - 1) * rowsPerPage;
let end = start + rowsPerPage;
let paginatedOrders = tableOrders.slice(start, end);

if (paginatedOrders.length === 0) {
  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="p-4 text-center border">
        No orders found matching your criteria.
      </td>
    </tr>
  `;
  return;
}

paginatedOrders.forEach(order => {
  // Format order date
  const orderDate = new Date(order.order_date).toLocaleDateString();
  
  // Create status badge
  const statusClass = `status-${order.status}`;
  const statusBadge = `<span class="status-badge ${statusClass}">${order.status}</span>`;
  
  // Create payment status badge
  const paymentStatusClass = `payment-status-${order.payment_status}`;
  const paymentStatusBadge = `<span class="status-badge ${paymentStatusClass}">${order.payment_status}</span>`;
  
  // Check if order has prescription
  const prescriptionThumb = order.prescription ? 
    `<img src="${order.prescription.image_url}" class="prescription-thumb" onclick="openModal('${order.prescription.image_url}')">` : 
    'N/A';
  
  let row = `
    <tr class="expandable-row" data-order-id="${order.order_id}">
      <td class="p-3 border">${order.order_number}</td>
      <td class="p-3 border">${order.customer_name}</td>
      <td class="p-3 border">${orderDate}</td>
      <td class="p-3 border">${order.total_items} items</td>
      <td class="p-3 border">₹${order.total_amount}</td>
      <td class="p-3 border">${statusBadge}</td>
      <td class="p-3 border">${paymentStatusBadge}</td>
      <td class="p-3 border">
        <div class="flex space-x-2">
          <select class="border rounded-md px-2 py-1 focus:ring focus:ring-blue-300 status-dropdown"
            onchange="updateOrderStatus(${order.order_id}, this.value)"
            data-order-id="${order.order_id}">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="packed" ${order.status === 'packed' ? 'selected' : ''}>Packed</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button onclick="event.stopPropagation(); generateInvoice(${order.order_id})" 
                  class="px-2 py-1 bg-blue-500 text-white rounded-md text-sm">
            <i class="fas fa-file-invoice"></i>
          </button>
        </div>
      </td>
    </tr>
    <tr class="order-details" id="details-${order.order_id}">
      <td colspan="8" class="p-4 border">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-2">Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            
            <h3 class="font-semibold mt-4 mb-2">Shipping Address</h3>
            <p>${order.shipping_address}</p>
            
            <h3 class="font-semibold mt-4 mb-2">Payment Information</h3>
            <p><strong>Method:</strong> ${order.payment_method}</p>
            <p><strong>Status:</strong> ${paymentStatusBadge}</p>
          </div>
          
          <div>
            <h3 class="font-semibold mb-2">Order Items</h3>
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
                    <td class="border border-gray-300 px-2 py-1">${item.product_name}</td>
                    <td class="border border-gray-300 px-2 py-1">${item.product_sku}</td>
                    <td class="border border-gray-300 px-2 py-1">${item.quantity}</td>
                    <td class="border border-gray-300 px-2 py-1">₹${item.unit_price}</td>
                    <td class="border border-gray-300 px-2 py-1">₹${item.subtotal}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h3 class="font-semibold mt-4 mb-2">Prescription</h3>
            ${prescriptionThumb}
          </div>
        </div>
      </td>
    </tr>`;
  tbody.innerHTML += row;
});

document.getElementById("pageInfo").innerText =
  `Page ${currentPage} of ${Math.ceil(tableOrders.length / rowsPerPage)}`;

// Add event listeners for expandable rows
document.querySelectorAll('.expandable-row').forEach(row => {
  row.addEventListener('click', function() {
    const orderId = this.getAttribute('data-order-id');
    const detailsRow = document.getElementById(`details-${orderId}`);
    
    // Close all other open details
    document.querySelectorAll('.order-details').forEach(detail => {
      if (detail.id !== `details-${orderId}`) {
        detail.style.display = 'none';
      }
    });
    
    // Toggle current details
    if (detailsRow.style.display === 'table-row') {
      detailsRow.style.display = 'none';
    } else {
      detailsRow.style.display = 'table-row';
    }
  });
});
}

// Update Cards
function updateCards() {
const all = filteredOrders.length;
const processing = filteredOrders.filter(o => o.status === "processing").length;
const packed = filteredOrders.filter(o => o.status === "packed").length;
const delivered = filteredOrders.filter(o => o.status === "delivered").length;

document.getElementById("allOrdersCount").innerText = all;
document.getElementById("processingCount").innerText = processing;
document.getElementById("packedCount").innerText = packed;
document.getElementById("deliveredCount").innerText = delivered;
}

// Update Order Status - FIXED to use order_id instead of id
async function updateOrderStatus(orderId, newStatus) {
try {
  console.log('Updating order:', orderId, 'to status:', newStatus);
  
  // Find the order by order_id
  const order = orders.find(o => o.order_id === orderId);
  if (!order) {
    console.error('Order not found with order_id:', orderId);
    showToast('Order not found.');
    return;
  }
  
  // If status is changing to shipped, prompt for tracking number
  let trackingNumber = order.tracking_number;
  if (newStatus === 'shipped' && !trackingNumber) {
    trackingNumber = prompt('Please enter tracking number:');
    if (!trackingNumber) {
      // Reset dropdown to previous value if no tracking number provided
      const dropdown = document.querySelector(`.status-dropdown[data-order-id="${orderId}"]`);
      dropdown.value = order.status;
      return;
    }
  }
  
  // JSON Server uses the id field for updates, but we need to find the correct id
  // First, let's find the order's id in the database
  const allOrdersResponse = await fetch(ENDPOINTS.orders);
  const allOrders = await allOrdersResponse.json();
  const orderInDb = allOrders.find(o => o.order_id === orderId);
  
  if (!orderInDb) {
    console.error('Order not found in database with order_id:', orderId);
    showToast('Order not found in database.');
    return;
  }
  
  // Now update using the id field that JSON Server uses
  const response = await fetch(`${ENDPOINTS.orders}/${orderInDb.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: newStatus,
      ...(trackingNumber && { tracking_number: trackingNumber })
    })
  });
  
  if (response.ok) {
    // Update local data
    const updatedOrder = await response.json();
    const index = orders.findIndex(o => o.order_id === orderId);
    if (index !== -1) {
      orders[index] = {...orders[index], ...updatedOrder};
    }
    
    showToast(`✅ Order #${order.order_number} updated to ${newStatus}`);
    renderTable();
    updateCards();
  } else {
    throw new Error(`Failed to update order: ${response.status} ${response.statusText}`);
  }
} catch (error) {
  console.error('Error updating order status:', error);
  showToast('Error updating order status. Please try again.');
  
  // Reset dropdown to previous value
  const order = orders.find(o => o.order_id === orderId);
  if (order) {
    const dropdown = document.querySelector(`.status-dropdown[data-order-id="${orderId}"]`);
    if (dropdown) dropdown.value = order.status;
  }
}
}

// Generate Invoice
// async function generateInvoice(orderId) {
//   const { jsPDF } = window.jspdf;

//   try {
//     // Fetch order details
//     const orderRes = await fetch(`http://localhost:3000/orders/${orderId}`);
//     if (!orderRes.ok) throw new Error('Order not found');
//     const order = await orderRes.json();

//     // Fetch order items
//     const itemsRes = await fetch(`http://localhost:3000/order_items?order_id=${orderId}`);
//     const items = await itemsRes.json();

//     const doc = new jsPDF();

//     // Invoice Header
//     doc.setFontSize(22);
//     doc.text('Pharmacy Management System', 14, 20);
//     doc.setFontSize(16);
//     doc.text('Invoice', 14, 30);

//     // Order Info
//     doc.setFontSize(12);
//     doc.text(`Order Number: ${order.order_number}`, 14, 40);
//     doc.text(`Order Date: ${new Date(order.order_date).toLocaleDateString()}`, 14, 48);
//     doc.text(`Payment Method: ${order.payment_method}`, 14, 56);
//     doc.text(`Payment Status: ${order.payment_status}`, 14, 64);
//     doc.text(`Shipping Notes: ${order.notes}`, 14, 72);

//     // Table Header
//     const tableY = 90;
//     let yPosition = tableY + 16;
//     items.forEach(item => {
//       const productId = item.product_id ?? 'N/A';
//       const quantity = item.quantity ?? 0;
//       const unitPrice = item.unit_price ?? 0;
//       const subtotal = item.subtotal ?? 0;
    
//       doc.text(productId.toString(), 14, yPosition);
//       doc.text(quantity.toString(), 60, yPosition);
//       doc.text(`₹${unitPrice.toFixed(2)}`, 90, yPosition);
//       doc.text(`₹${subtotal.toFixed(2)}`, 140, yPosition);
    
//       yPosition += 8;
//       if (yPosition > 250) {
//         doc.addPage();
//         yPosition = 20;
//       }
//     });

//     // Total Amount
//     doc.setFontSize(14);
//     doc.text(`Total Amount: ₹${order.total_amount.toFixed(2)}`, 14, yPosition + 10);

//     // Save PDF
//     doc.save(`Invoice_${order.order_number}.pdf`);

//     showToast(`Invoice for order #${order.order_number} generated successfully`);

//   } catch (error) {
//     console.error(error);
//     showToast('Failed to generate invoice');
//   }
// }


// Filter orders by status
function filterByStatus(status) {
if (status === "all") {
  tableOrders = [...filteredOrders];
} else {
  tableOrders = filteredOrders.filter(o => o.status === status);
}
currentPage = 1;
renderTable();
}

// Search orders
function searchOrders() {
const searchTerm = document.getElementById('searchInput').value.toLowerCase();

if (!searchTerm) {
  tableOrders = [...filteredOrders];
} else {
  tableOrders = filteredOrders.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm) ||
    order.customer_name.toLowerCase().includes(searchTerm) ||
    order.customer_email.toLowerCase().includes(searchTerm) ||
    order.customer_phone.toLowerCase().includes(searchTerm)
  );
}

currentPage = 1;
renderTable();
updateCards();
}

// Filter by date range
function filterByDate() {
let start = document.getElementById("startDate").value;
let end = document.getElementById("endDate").value;

if (start && end) {
  filteredOrders = orders.filter(o => {
    const orderDate = new Date(o.order_date).toISOString().split('T')[0];
    return orderDate >= start && orderDate <= end;
  });
} else {
  filteredOrders = [...orders];
}

// Apply other filters if any
const statusFilter = document.getElementById('statusFilter').value;
const paymentStatusFilter = document.getElementById('paymentStatusFilter').value;

tableOrders = [...filteredOrders];

if (statusFilter) {
  tableOrders = tableOrders.filter(o => o.status === statusFilter);
}

if (paymentStatusFilter) {
  tableOrders = tableOrders.filter(o => o.payment_status === paymentStatusFilter);
}

currentPage = 1;
renderTable();
updateCards();
}

// Filter by payment status
function filterByPaymentStatus() {
const paymentStatus = document.getElementById('paymentStatusFilter').value;
const status = document.getElementById('statusFilter').value;

tableOrders = [...filteredOrders];

if (status) {
  tableOrders = tableOrders.filter(o => o.status === status);
}

if (paymentStatus) {
  tableOrders = tableOrders.filter(o => o.payment_status === paymentStatus);
}

currentPage = 1;
renderTable();
updateCards();
}

// Filter by order status
function filterByOrderStatus() {
const status = document.getElementById('statusFilter').value;
const paymentStatus = document.getElementById('paymentStatusFilter').value;

tableOrders = [...filteredOrders];

if (status) {
  tableOrders = tableOrders.filter(o => o.status === status);
}

if (paymentStatus) {
  tableOrders = tableOrders.filter(o => o.payment_status === paymentStatus);
}

currentPage = 1;
renderTable();
updateCards();
}

// Refresh data
function refreshData() {
document.getElementById("startDate").value = "";
document.getElementById("endDate").value = "";
document.getElementById("statusFilter").value = "";
document.getElementById("paymentStatusFilter").value = "";
document.getElementById("searchInput").value = "";

fetchData();
}

// Toast notification
function showToast(message) {
let toast = document.getElementById("toast");
toast.innerText = message;
toast.classList.remove("opacity-0");
toast.classList.add("opacity-100");
setTimeout(() => {
  toast.classList.remove("opacity-100");
  toast.classList.add("opacity-0");
}, 3000);
}

// Prescription modal
function openModal(imageUrl) {
const modal = document.getElementById("prescriptionModal");
const modalImg = document.getElementById("modalImage");
modal.style.display = "block";
modalImg.src = imageUrl;
}

function closeModal() {
document.getElementById("prescriptionModal").style.display = "none";
}

// Pagination
document.getElementById("prevPage").addEventListener("click", () => {
if (currentPage > 1) {
  currentPage--;
  renderTable();
}
});

document.getElementById("nextPage").addEventListener("click", () => {
if (currentPage < Math.ceil(tableOrders.length / rowsPerPage)) {
  currentPage++;
  renderTable();
}
});

// Event listeners
document.getElementById("searchInput").addEventListener("input", searchOrders);
document.getElementById("startDate").addEventListener("change", filterByDate);
document.getElementById("endDate").addEventListener("change", filterByDate);
document.getElementById("statusFilter").addEventListener("change", filterByOrderStatus);
document.getElementById("paymentStatusFilter").addEventListener("change", filterByPaymentStatus);
document.getElementById("refreshBtn").addEventListener("click", refreshData);

document.querySelectorAll(".filter-btn").forEach(button => {
button.addEventListener("click", () => {
  const status = button.getAttribute("data-status");
  filterByStatus(status);
});
});

// Close modal when clicking on X
document.querySelector(".close-modal").addEventListener("click", closeModal);

// Close modal when clicking outside the image
window.addEventListener("click", function(event) {
const modal = document.getElementById("prescriptionModal");
if (event.target === modal) {
  closeModal();
}
});

// Initial data fetch
fetchData();