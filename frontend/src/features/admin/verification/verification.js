// /* verification.js
//    Put this file next to verification.html and open verification.html in the browser.
//    NOTE: the sample prescription image is set to the path below.
//    If that path doesn't work with your server, change SAMPLE_IMAGE to a path that resolves
//    from the browser (e.g. "/frontend/src/core/assests/pres1.png", "../core/assests/pres1.png", etc.)
// */

// const SAMPLE_IMAGE = "/frontend/src/core/assests/pres1.png"; // <- change if needed

// // ------------- Sidebar loader (returns Promise) -------------
// function loadComponent(id, filePath) {
//   return fetch(filePath)
//     .then(res => {
//       if (!res.ok) throw new Error("Failed to load " + filePath);
//       return res.text();
//     })
//     .then(html => {
//       document.getElementById(id).innerHTML = html;
//       highlightActiveLink();
//     })
//     .catch(err => {
//       // sidebar load failure is non-fatal
//       console.warn("Sidebar load failed:", err.message);
//     });
// }

// function highlightActiveLink() {
//   const currentPath = window.location.pathname;
//   const links = document.querySelectorAll("#sidebar a");
//   links.forEach(link => {
//     const href = link.getAttribute("href");
//     if (href && currentPath.endsWith(href.replace("../", ""))) {
//       link.classList.add("bg-blue-600", "text-white");
//     } else {
//       link.classList.remove("bg-blue-600", "text-white");
//     }
//   });
// }

// // ------------- Mock data -------------
// let prescriptions = [
//   { orderId: "ORD001", medicineId: "D06ID232435454", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD002", medicineId: "D06ID232435451", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD003", medicineId: "D06ID232435452", category: "Diabetes", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD004", medicineId: "D06ID232435450", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD005", medicineId: "D06ID232435455", category: "Diabetes", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD006", medicineId: "D06ID232435456", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD007", medicineId: "D06ID232435457", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD008", medicineId: "D06ID232435458", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD009", medicineId: "D06ID232435459", category: "Antibiotics", status: "Pending", image: SAMPLE_IMAGE },
//   { orderId: "ORD010", medicineId: "D06ID232435460", category: "Antibiotics", status: "Pending", image: SAMPLE_IMAGE }
// ];

// let currentFiltered = [...prescriptions];
// let currentPage = 1;
// const rowsPerPage = 10;

// // ------------- DOM getters -------------
// const tbody = () => document.getElementById("verificationTable");
// const pageInfo = () => document.getElementById("pageInfo");
// const prevBtn = () => document.getElementById("prevPage");
// const nextBtn = () => document.getElementById("nextPage");
// const searchInput = () => document.getElementById("searchInput");
// const categoryFilter = () => document.getElementById("categoryFilter");
// const resetBtn = () => document.getElementById("resetBtn");
// const searchClearBtn = () => document.getElementById("searchClearBtn");
// const toastEl = () => document.getElementById("toast");
// const modal = () => document.getElementById("prescriptionModal");
// const modalImage = () => document.getElementById("prescriptionImage");
// const modalCloseBtn = () => document.getElementById("modalClose");
// const modalApproveBtn = () => document.getElementById("modalApprove");
// const modalRejectBtn = () => document.getElementById("modalReject");

// let selectedOrderId = null;

// // ------------- Utility -------------
// function escapeHtml(s) {
//   return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// }

// function showToast(msg) {
//   const t = toastEl();
//   if (!t) return;
//   t.textContent = msg;
//   t.classList.remove("opacity-0", "translate-y-2");
//   t.style.opacity = "1";
//   if (t._timer) clearTimeout(t._timer);
//   t._timer = setTimeout(() => {
//     t.style.opacity = "0";
//     t.classList.add("translate-y-2");
//   }, 2400);
// }

// // ------------- Render table with pagination -------------
// function renderTable() {
//   const table = tbody();
//   table.innerHTML = "";

//   const total = currentFiltered.length;
//   const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
//   if (currentPage > totalPages) currentPage = totalPages;

//   const start = (currentPage - 1) * rowsPerPage;
//   const end = start + rowsPerPage;
//   const pageData = currentFiltered.slice(start, end);

//   if (pageData.length === 0) {
//     table.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500">No prescriptions found</td></tr>`;
//   } else {
//     pageData.forEach(item => {
//       const statusBadge = item.status === "Pending"
//         ? `<span class="px-2 py-1 rounded-md text-sm bg-yellow-100 text-yellow-800">${escapeHtml(item.status)}</span>`
//         : item.status === "Approved"
//           ? `<span class="px-2 py-1 rounded-md text-sm bg-green-100 text-green-800">${escapeHtml(item.status)}</span>`
//           : `<span class="px-2 py-1 rounded-md text-sm bg-red-100 text-red-800">${escapeHtml(item.status)}</span>`;

//       const actionHtml = item.status === "Pending"
//         ? `<div class="flex items-center justify-center gap-2">
//              <button data-order="${item.orderId}" class="view-btn px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600">View</button>
//              <button data-order="${item.orderId}" class="approve-btn px-3 py-1 rounded-md bg-green-500 text-white text-sm hover:bg-green-600">Approve</button>
//              <button data-order="${item.orderId}" class="reject-btn px-3 py-1 rounded-md bg-red-500 text-white text-sm hover:bg-red-600">Reject</button>
//            </div>`
//         : `<div class="flex items-center justify-center gap-2">
//              ${statusBadge}
//              <button data-order="${item.orderId}" class="view-btn px-3 py-1 rounded-md bg-gray-200 text-sm hover:bg-gray-300">View</button>
//            </div>`;

//       table.innerHTML += `
//         <tr class="border-b hover:bg-gray-50">
//           <td class="py-3 px-4">${escapeHtml(item.orderId)}</td>
//           <td class="py-3 px-4">${escapeHtml(item.medicineId)}</td>
//           <td class="py-3 px-4">${escapeHtml(item.category)}</td>
//           <td class="py-3 px-4">${statusBadge}</td>
//           <td class="py-3 px-4 text-center">${actionHtml}</td>
//         </tr>`;
//     });
//   }

//   // Update page info (if element exists)
//   if (pageInfo()) pageInfo().textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(total / rowsPerPage))}`;

//   // enable/disable prev/next
//   if (prevBtn()) {
//     prevBtn().disabled = currentPage <= 1;
//     prevBtn().classList.toggle("opacity-50", prevBtn().disabled);
//   }
//   if (nextBtn()) {
//     nextBtn().disabled = currentPage >= Math.max(1, Math.ceil(total / rowsPerPage));
//     nextBtn().classList.toggle("opacity-50", nextBtn().disabled);
//   }
// }

// // ------------- Filters -------------
// function applyFilters(resetPage = true) {
//   const q = (searchInput() ? searchInput().value.trim().toLowerCase() : "");
//   const cat = (categoryFilter() ? categoryFilter().value : "");

//   currentFiltered = prescriptions.filter(p => {
//     const matchQ = !q || p.orderId.toLowerCase().includes(q) || p.medicineId.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
//     const matchCat = !cat || p.category === cat;
//     return matchQ && matchCat;
//   });

//   if (resetPage) currentPage = 1;
//   renderTable();
// }

// // ------------- Table actions (delegate) -------------
// function tableActionsHandler(e) {
//   const approveBtn = e.target.closest(".approve-btn");
//   const rejectBtn = e.target.closest(".reject-btn");
//   const viewBtn = e.target.closest(".view-btn");

//   if (approveBtn) {
//     const orderId = approveBtn.dataset.order;
//     const p = prescriptions.find(x => x.orderId === orderId);
//     if (p) {
//       p.status = "Approved";
//       showToast(`Order ${orderId} approved`);
//       applyFilters(false);
//     }
//     return;
//   }

//   if (rejectBtn) {
//     const orderId = rejectBtn.dataset.order;
//     const p = prescriptions.find(x => x.orderId === orderId);
//     if (p) {
//       p.status = "Rejected";
//       showToast(`Order ${orderId} rejected`);
//       applyFilters(false);
//     }
//     return;
//   }

//   if (viewBtn) {
//     const orderId = viewBtn.dataset.order;
//     openModal(orderId);
//     return;
//   }
// }

// // ------------- Modal control -------------
// function openModal(orderId) {
//   selectedOrderId = orderId;
//   const p = prescriptions.find(x => x.orderId === orderId);
//   const m = modal();
//   const img = modalImage();

//   // use the image from the record if present; otherwise fall back to SAMPLE_IMAGE
//   img.src = (p && p.image) ? p.image : SAMPLE_IMAGE;

//   m.classList.remove("hidden");
//   // small accessibility focus trap
//   m.querySelector('div')?.focus?.();
// }

// function closeModal() {
//   selectedOrderId = null;
//   const m = modal();
//   m.classList.add("hidden");
// }

// // ------------- Wire controls -------------
// function wireControls() {
//   // search debounce
//   let sDeb = null;
//   if (searchInput()) {
//     searchInput().addEventListener("input", () => {
//       if (sDeb) clearTimeout(sDeb);
//       sDeb = setTimeout(() => applyFilters(), 200);
//     });
//   }

//   if (searchClearBtn()) {
//     searchClearBtn().addEventListener("click", () => {
//       if (searchInput()) searchInput().value = "";
//       applyFilters();
//     });
//   }

//   if (categoryFilter()) {
//     categoryFilter().addEventListener("change", () => applyFilters());
//   }

//   if (resetBtn()) {
//     resetBtn().addEventListener("click", () => {
//       if (searchInput()) searchInput().value = "";
//       if (categoryFilter()) categoryFilter().value = "";
//       currentFiltered = [...prescriptions];
//       currentPage = 1;
//       renderTable();
//     });
//   }

//   if (prevBtn()) prevBtn().addEventListener("click", () => {
//     if (currentPage > 1) { currentPage--; renderTable(); }
//   });
//   if (nextBtn()) nextBtn().addEventListener("click", () => {
//     const totalPages = Math.max(1, Math.ceil(currentFiltered.length / rowsPerPage));
//     if (currentPage < totalPages) { currentPage++; renderTable(); }
//   });

//   // delegate table actions
//   const table = document.getElementById("verificationTable");
//   if (table) table.addEventListener("click", tableActionsHandler);

//   // modal buttons
//   if (modalCloseBtn()) modalCloseBtn().addEventListener("click", closeModal);
//   if (modalApproveBtn()) modalApproveBtn().addEventListener("click", () => {
//     if (!selectedOrderId) return;
//     const p = prescriptions.find(x => x.orderId === selectedOrderId);
//     if (p) {
//       p.status = "Approved";
//       showToast(`Order ${selectedOrderId} approved`);
//       applyFilters(false);
//     }
//     closeModal();
//   });
//   if (modalRejectBtn()) modalRejectBtn().addEventListener("click", () => {
//     if (!selectedOrderId) return;
//     const p = prescriptions.find(x => x.orderId === selectedOrderId);
//     if (p) {
//       p.status = "Rejected";
//       showToast(`Order ${selectedOrderId} rejected`);
//       applyFilters(false);
//     }
//     closeModal();
//   });

//   // click outside modal to close
//   if (modal()) {
//     modal().addEventListener("click", (e) => {
//       if (e.target === modal()) closeModal();
//     });
//   }

//   // Escape to close
//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") closeModal();
//   });
// }

// // ------------- Init -------------
// function init() {
//   currentFiltered = [...prescriptions];
//   currentPage = 1;
//   renderTable();
//   wireControls();
// }

// // ------------- Start -------------
// document.addEventListener("DOMContentLoaded", () => {
//   // load sidebar (non-fatal) then init
//   loadComponent("sidebar", "../../../core/components/sidebar.html")
//     .finally(() => init());
// });


/* verification.js
   Enhanced with JSON server integration
*/

/* verification.js
   Enhanced with JSON server integration
*/

const API_BASE = "http://localhost:3000";
let prescriptions = [];
let customers = [];
let orders = [];
let orderItems = [];
let customerAddresses = [];
let products = [];
let currentFiltered = [];
let currentPage = 1;
const rowsPerPage = 10;
let selectedPrescriptionId = null;
let currentAction = null; // 'approve' or 'reject'

// ------------- Sidebar loader (returns Promise) -------------
function loadComponent(id, filePath) {
  return fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load " + filePath);
      return res.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
      highlightActiveLink();
    })
    .catch(err => {
      console.warn("Sidebar load failed:", err.message);
    });
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll("#sidebar a");
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href && currentPath.endsWith(href.replace("../", ""))) {
      link.classList.add("bg-blue-600", "text-white");
    } else {
      link.classList.remove("bg-blue-600", "text-white");
    }
  });
}

// ------------- API Functions -------------
async function fetchData() {
  try {
    const [
      prescriptionsRes, 
      customersRes, 
      ordersRes, 
      orderItemsRes, 
      addressesRes,
      productsRes
    ] = await Promise.all([
      fetch(`${API_BASE}/prescriptions`),
      fetch(`${API_BASE}/customers`),
      fetch(`${API_BASE}/orders`),
      fetch(`${API_BASE}/order_items`),
      fetch(`${API_BASE}/customer_addresses`),
      fetch(`${API_BASE}/products`)
    ]);

    if (!prescriptionsRes.ok) throw new Error('Failed to fetch prescriptions');
    if (!customersRes.ok) throw new Error('Failed to fetch customers');
    if (!ordersRes.ok) throw new Error('Failed to fetch orders');
    if (!orderItemsRes.ok) throw new Error('Failed to fetch order items');
    if (!addressesRes.ok) throw new Error('Failed to fetch addresses');
    if (!productsRes.ok) throw new Error('Failed to fetch products');

    prescriptions = await prescriptionsRes.json();
    customers = await customersRes.json();
    orders = await ordersRes.json();
    orderItems = await orderItemsRes.json();
    customerAddresses = await addressesRes.json();
    products = await productsRes.json();

    // Update customer filter dropdown
    updateCustomerFilter();
    
    // Update stats
    updateStats();
    
    // Apply initial filters and render
    applyFilters();
  } catch (error) {
    console.error('Error fetching data:', error);
    showToast('Failed to load data. Please check your JSON server.', true);
  }
}

async function updatePrescription(prescriptionId, updates) {
  try {
    const response = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error('Failed to update prescription');
    
    return await response.json();
  } catch (error) {
    console.error('Error updating prescription:', error);
    showToast('Failed to update prescription.', true);
    throw error;
  }
}

// ------------- DOM getters -------------
const tbody = () => document.getElementById("verificationTable");
const pageInfo = () => document.getElementById("pageInfo");
const prevBtn = () => document.getElementById("prevPage");
const nextBtn = () => document.getElementById("nextPage");
const searchInput = () => document.getElementById("searchInput");
const customerFilter = () => document.getElementById("customerFilter");
const dateFilter = () => document.getElementById("dateFilter");
const resetBtn = () => document.getElementById("resetBtn");
const searchClearBtn = () => document.getElementById("searchClearBtn");
const toastEl = () => document.getElementById("toast");
const modal = () => document.getElementById("prescriptionModal");
const modalImage = () => document.getElementById("prescriptionImage");
const modalCloseBtn = () => document.getElementById("modalClose");
const modalApproveBtn = () => document.getElementById("modalApprove");
const modalRejectBtn = () => document.getElementById("modalReject");
const confirmActionBtn = () => document.getElementById("confirmAction");
const rejectionSection = () => document.getElementById("rejectionSection");
const rejectionReason = () => document.getElementById("rejectionReason");
const verificationNotes = () => document.getElementById("verificationNotes");
const verificationHistory = () => document.getElementById("verificationHistory");

// ------------- Utility -------------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showToast(msg, isError = false) {
  const t = toastEl();
  if (!t) return;
  
  t.textContent = msg;
  t.classList.remove("opacity-0", "translate-y-2");
  
  if (isError) {
    t.classList.add("bg-red-600");
    t.classList.remove("bg-gray-800");
  } else {
    t.classList.remove("bg-red-600");
    t.classList.add("bg-gray-800");
  }
  
  t.style.opacity = "1";
  if (t._timer) clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = "0";
    t.classList.add("translate-y-2");
  }, 3000);
}

function updateStats() {
  const totalCount = prescriptions.length;
  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;
  const approvedCount = prescriptions.filter(p => p.status === 'approved').length;
  const rejectedCount = prescriptions.filter(p => p.status === 'rejected').length;
  
  document.getElementById('totalCount').textContent = totalCount;
  document.getElementById('pendingCount').textContent = pendingCount;
  document.getElementById('approvedCount').textContent = approvedCount;
  document.getElementById('rejectedCount').textContent = rejectedCount;
}

function updateCustomerFilter() {
  const filter = customerFilter();
  if (!filter) return;
  
  // Clear existing options except the first one
  filter.innerHTML = '<option value="">All customers</option>';
  
  // Add customer options
  customers.forEach(customer => {
    const option = document.createElement('option');
    option.value = customer.id;
    option.textContent = `${customer.first_name} ${customer.last_name}`;
    filter.appendChild(option);
  });
}

function getProductName(productId) {
  const product = products.find(p => p.id === productId.toString());
  return product ? product.name : `Product ${productId}`;
}

// ------------- Render table with pagination -------------
function renderTable() {
  const table = tbody();
  if (!table) return;
  
  table.innerHTML = "";

  const total = currentFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = currentFiltered.slice(start, end);

  if (pageData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-gray-500">No prescriptions found</td></tr>`;
  } else {
    pageData.forEach(prescription => {
      const customer = customers.find(c => c.id === prescription.customer_id.toString());
      const order = orders.find(o => o.prescription_id == prescription.id);
      const status = prescription.status || 'pending';
      
      let statusBadge;
      if (status === "pending") {
        statusBadge = `<span class="px-2 py-1 rounded-md text-lg bg-yellow-100 text-yellow-800">Pending</span>`;
      } else if (status === "approved") {
        statusBadge = `<span class="px-2 py-1 rounded-md text-lg bg-green-100 text-green-800">Approved</span>`;
      } else {
        statusBadge = `<span class="px-2 py-1 rounded-md text-lg bg-red-100 text-red-800">Rejected</span>`;
      }
      
      const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
      const orderNumber = prescription.medicine_id ? prescription.medicine_id : 'N/A';
      
      const actionHtml = status === "pending"
        ? `<div class="flex items-center justify-center gap-2">
             <button data-id="${prescription.id}" class="view-btn px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600">Review</button>
           </div>`
        : `<div class="flex items-center justify-center gap-2">
             ${statusBadge}
             <button data-id="${prescription.id}" class="view-btn px-3 py-1 rounded-md bg-gray-200 text-lg hover:bg-gray-300">View</button>
           </div>`;

      table.innerHTML += `
        <tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-4">${escapeHtml(prescription.prescription_id || prescription.id)}</td>
          <td class="py-3 px-4">${escapeHtml(customerName)}</td>
          <td class="py-3 px-4">${escapeHtml(orderNumber)}</td>
          <td class="py-3 px-4">${formatDate(prescription.created_at)}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4 text-center">${actionHtml}</td>
        </tr>`;
    });
  }

  // Update page info
  if (pageInfo()) {
    pageInfo().textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(total / rowsPerPage))}`;
  }

  // enable/disable prev/next
  if (prevBtn()) {
    prevBtn().disabled = currentPage <= 1;
    prevBtn().classList.toggle("opacity-50", prevBtn().disabled);
  }
  if (nextBtn()) {
    nextBtn().disabled = currentPage >= Math.max(1, Math.ceil(total / rowsPerPage));
    nextBtn().classList.toggle("opacity-50", nextBtn().disabled);
  }
}

// ------------- Filters -------------
function applyFilters(resetPage = true) {
  const q = (searchInput() ? searchInput().value.trim().toLowerCase() : "");
  const customerId = (customerFilter() ? customerFilter().value : "");
  const date = (dateFilter() ? dateFilter().value : "");
  const status = document.querySelector('.status-filter-btn.active')?.dataset.status || 'all';

  currentFiltered = prescriptions.filter(p => {
    const customer = customers.find(c => c.id === p.customer_id.toString());
    const customerName = customer ? `${customer.first_name} ${customer.last_name}`.toLowerCase() : '';
    
    // Text search
    const matchQ = !q || 
      (p.prescription_id && p.prescription_id.toString().toLowerCase().includes(q)) ||
      customerName.includes(q);
    
    // Customer filter
    const matchCustomer = !customerId || p.customer_id.toString() === customerId;
    
    // Date filter
    let matchDate = true;
    if (date) {
      const prescriptionDate = new Date(p.created_at).toISOString().split('T')[0];
      matchDate = prescriptionDate === date;
    }
    
    // Status filter
    let matchStatus = true;
    if (status !== 'all') {
      matchStatus = p.status === status;
    }
    
    return matchQ && matchCustomer && matchDate && matchStatus;
  });

  if (resetPage) currentPage = 1;
  renderTable();
}

// ------------- Modal control -------------
function openModal(prescriptionId) {
  selectedPrescriptionId = prescriptionId;
  const prescription = prescriptions.find(p => p.id === prescriptionId);
  if (!prescription) return;
  
  const m = modal();
  const img = modalImage();
  const customer = customers.find(c => c.id === prescription.customer_id.toString());
  const order = orders.find(o => o.prescription_id == prescriptionId);
  const product=products.find(o => o.product_id==prescription.medicine_id)
  const address = customerAddresses.find(a => a.customer_id == prescription.customer_id && a.is_default);
  
  // Set prescription image
  img.src = prescription.image_url || '/frontend/src/core/assests/pres1.png';
  
  // Set customer info
  if (customer) {
    document.getElementById('customerName').textContent = `${customer.first_name} ${customer.last_name}`;
    document.getElementById('customerEmail').textContent = customer.email;
    document.getElementById('customerPhone').textContent = customer.phone_number;
    
    if (address) {
      document.getElementById('customerAddress').textContent = 
        `${address.address_line1 || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip_code || ''}`;
    } else {
      document.getElementById('customerAddress').textContent = 'No address found';
    }
  } else {
    document.getElementById('customerName').textContent = 'Unknown customer';
    document.getElementById('customerEmail').textContent = '-';
    document.getElementById('customerPhone').textContent = '-';
    document.getElementById('customerAddress').textContent = '-';
  }
  
  // Set order info
  if (order) {
    document.getElementById('orderId').textContent = order.order_number;
    document.getElementById('orderDate').textContent = formatDate(order.order_date);
    document.getElementById('orderAmount').textContent = `$${order.total_amount}`;
    
    // Get order items
    const items = orderItems.filter(oi => oi.order_id == order.id);
    document.getElementById('orderItems').textContent = items.length > 0 
      ? items.map(oi => `${oi.quantity} x ${getProductName(oi.product_id)}`).join(', ')
      : 'No items';
  } else if (product) {
    // Fix: Only show product info if product exists
    document.getElementById('orderId').textContent = product.id;
    document.getElementById('orderDate').textContent = product.name;
    document.getElementById('orderAmount').textContent = product.composition || 'N/A';
    document.getElementById('orderItems').textContent = product.description || 'No description';
  } else {
    // Fix: Handle case where neither order nor product is found
    document.getElementById('orderId').textContent = prescription.medicine_id || 'N/A';
    document.getElementById('orderDate').textContent = 'No product info';
    document.getElementById('orderAmount').textContent = 'N/A';
    document.getElementById('orderItems').textContent = 'No information available';
  }
  
  // Show verification history if already verified
  if (prescription.status !== 'pending') {
    verificationHistory().classList.remove('hidden');
    document.getElementById('verifiedBy').textContent = prescription.verified_by ? `Admin ${prescription.verified_by}` : 'Unknown';
    document.getElementById('verifiedOn').textContent = formatDate(prescription.updated_at);
    document.getElementById('historyNotes').textContent = prescription.verification_notes || 'No notes provided';
    
    // Hide action buttons for already verified prescriptions
    modalApproveBtn().classList.add('hidden');
    modalRejectBtn().classList.add('hidden');
  } else {
    verificationHistory().classList.add('hidden');
    modalApproveBtn().classList.remove('hidden');
    modalRejectBtn().classList.remove('hidden');
  }
  
  // Hide rejection section and confirm button initially
  rejectionSection().classList.add('hidden');
  confirmActionBtn().classList.add('hidden');
  
  m.classList.remove("hidden");
}

function closeModal() {
  selectedPrescriptionId = null;
  currentAction = null;
  const m = modal();
  m.classList.add("hidden");
  
  // Reset rejection fields
  if (rejectionReason()) rejectionReason().value = '';
  if (verificationNotes()) verificationNotes().value = '';
}

async function performAction() {
  if (!selectedPrescriptionId || !currentAction) return;
  
  try {
    const updates = {
      status: currentAction,
      updated_at: new Date().toISOString(),
      verified_by: 1 // Assuming admin ID 1 for now
    };
    
    // Add verification notes for rejections
    if (currentAction === 'rejected') {
      const reason = rejectionReason().value;
      const notes = verificationNotes().value;
      
      if (!reason) {
        showToast('Please select a rejection reason', true);
        return;
      }
      
      updates.verification_notes = `${reason}${notes ? ': ' + notes : ''}`;
    }
    
    // Update the prescription
    await updatePrescription(selectedPrescriptionId, updates);
    
    // Update local data
    const index = prescriptions.findIndex(p => p.id === selectedPrescriptionId);
    if (index !== -1) {
      prescriptions[index] = { ...prescriptions[index], ...updates };
    }
    
    // Show success message
    showToast(`Prescription ${currentAction} successfully`);
    
    // Update stats and filters
    updateStats();
    applyFilters(false);
    
    // Close modal
    closeModal();
  } catch (error) {
    console.error('Error performing action:', error);
    showToast('Failed to update prescription', true);
  }
}

// ------------- Wire controls -------------
function wireControls() {
  // Status filter buttons
  const statusButtons = document.querySelectorAll('.status-filter-btn');
  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      statusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
  
  // search debounce
  let sDeb = null;
  if (searchInput()) {
    searchInput().addEventListener("input", () => {
      if (sDeb) clearTimeout(sDeb);
      sDeb = setTimeout(() => applyFilters(), 200);
    });
  }

  if (searchClearBtn()) {
    searchClearBtn().addEventListener("click", () => {
      if (searchInput()) searchInput().value = "";
      applyFilters();
    });
  }

  if (customerFilter()) {
    customerFilter().addEventListener("change", () => applyFilters());
  }
  
  if (dateFilter()) {
    dateFilter().addEventListener("change", () => applyFilters());
  }

  if (resetBtn()) {
    resetBtn().addEventListener("click", () => {
      if (searchInput()) searchInput().value = "";
      if (customerFilter()) customerFilter().value = "";
      if (dateFilter()) dateFilter().value = "";
      
      // Reset status filter to 'all'
      statusButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('[data-status="all"]').classList.add('active');
      
      applyFilters();
    });
  }

  if (prevBtn()) prevBtn().addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });
  
  if (nextBtn()) nextBtn().addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(currentFiltered.length / rowsPerPage));
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  // delegate table actions
  const table = document.getElementById("verificationTable");
  if (table) table.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) {
      const prescriptionId = viewBtn.dataset.id;
      openModal(prescriptionId);
    }
  });

  // modal buttons
  if (modalCloseBtn()) modalCloseBtn().addEventListener("click", closeModal);
  
  if (modalApproveBtn()) modalApproveBtn().addEventListener("click", () => {
    currentAction = 'approved';
    confirmActionBtn().classList.remove('hidden');
    rejectionSection().classList.add('hidden');
  });
  
  if (modalRejectBtn()) modalRejectBtn().addEventListener("click", () => {
    currentAction = 'rejected';
    confirmActionBtn().classList.remove('hidden');
    rejectionSection().classList.remove('hidden');
  });
  
  if (confirmActionBtn()) confirmActionBtn().addEventListener("click", performAction);

  // click outside modal to close
  if (modal()) {
    modal().addEventListener("click", (e) => {
      if (e.target === modal()) closeModal();
    });
  }

  // Escape to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ------------- Init -------------
function init() {
  fetchData();
  wireControls();
}

// ------------- Start -------------
document.addEventListener("DOMContentLoaded", () => {
  // load sidebar (non-fatal) then init
  loadComponent("sidebar", "../../../core/components/sidebar.html")
    .finally(() => init());
});