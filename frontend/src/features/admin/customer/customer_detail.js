
  //   function loadComponent(id, filePath) {
  //   fetch(filePath)
  //     .then(response => response.text())
  //     .then(data => {
  //       document.getElementById(id).innerHTML = data;
  //       highlightActiveLink();
  //     })
  //     .catch(err => console.error("Error loading component:", err));
  // }

  // function highlightActiveLink() {
  //   const currentPath = window.location.pathname;
  //   const links = document.querySelectorAll("#sidebar a");

  //   links.forEach(link => {
  //     const href = link.getAttribute("href");
  //     if (currentPath.endsWith(href.replace("../", ""))) {
  //       link.classList.add("bg-blue-600", "text-white");
  //     } else {
  //       link.classList.remove("bg-blue-600", "text-white");
  //     }
  //   });
  // }

  // loadComponent("sidebar", "../../../core/components/sidebar.html");
  //   // Dummy database (replace with API later)
  //  // customer_detail.js
  //  document.addEventListener("DOMContentLoaded", () => {
  //   const params = new URLSearchParams(window.location.search);
  
  //   // Fill customer info
  //   document.getElementById("custId").value = params.get("custId");
  //   document.getElementById("custName").value = params.get("custName");
  //   document.getElementById("custMail").value = params.get("custMail");
  //   document.getElementById("custAge").value = params.get("custAge");
  //   document.getElementById("custDob").value = params.get("custDob");
  //   document.getElementById("custAddress").value = params.get("custAddress");
  
  //   // Dummy orders for testing
  //   const orders = [
  //     { orderId: "O-1001", customerId: "D06ID232435454", category: "Medicine", name: "Paracetamol", qty: 2, price: "₹40" },
  //     { orderId: "O-1002", customerId: "D06ID232435454", category: "Health", name: "Vitamin C", qty: 1, price: "₹120" },
  //     { orderId: "O-2001", customerId: "SomeOtherId", category: "Wellness", name: "Protein Powder", qty: 1, price: "₹500" }
  //   ];
  
  //   const tableBody = document.getElementById("ordersTable");
  //   tableBody.innerHTML = "";
  
  //   const custId = params.get("custId");
  //   orders
  //     .filter(order => order.customerId == custId)
  //     .forEach(order => {
  //       const row = `
  //         <tr>
  //           <td class="border px-4 py-2">${order.orderId}</td>
  //           <td class="border px-4 py-2">${order.customerId}</td>
  //           <td class="border px-4 py-2">${order.category}</td>
  //           <td class="border px-4 py-2">${order.name}</td>
  //           <td class="border px-4 py-2">${order.qty}</td>
  //           <td class="border px-4 py-2">${order.price}</td>
  //         </tr>`;
  //       tableBody.insertAdjacentHTML("beforeend", row);
  //     });
  
  //   // If no orders found, show message
  //   if (tableBody.innerHTML === "") {
  //     tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No orders found</td></tr>`;
  //   }
  // });
  

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
  
  // API endpoints
  const API_BASE = "http://localhost:3000";
  const ENDPOINTS = {
    CUSTOMERS: `${API_BASE}/customers`,
    CUSTOMER_ADDRESSES: `${API_BASE}/customer_addresses`,
    ORDERS: `${API_BASE}/orders`,
    ORDER_ITEMS: `${API_BASE}/order_items`,
    PRODUCTS: `${API_BASE}/products`,
    PRESCRIPTIONS: `${API_BASE}/prescriptions`
  };
  
  // Global variables
  let customerData = null;
  let customerAddresses = [];
  let customerOrders = [];
  let customerPrescriptions = [];
  
  // Fetch customer data from API
  async function fetchCustomerData(customerId) {
    try {
      // Show loading state
      document.getElementById("ordersTable").innerHTML = 
        '<tr><td colspan="7" class="p-4 text-center text-gray-500">Loading orders...</td></tr>';
      document.getElementById("prescriptionsTable").innerHTML = 
        '<tr><td colspan="5" class="p-4 text-center text-gray-500">Loading prescriptions...</td></tr>';
  
      // Fetch all data in parallel
      const [customerRes, addressesRes, ordersRes, prescriptionsRes] = await Promise.all([
        fetch(`${ENDPOINTS.CUSTOMERS}/${customerId}`),
        fetch(`${ENDPOINTS.CUSTOMER_ADDRESSES}?customer_id=${customerId}`),
        fetch(`${ENDPOINTS.ORDERS}?customer_id=${customerId}`),
        fetch(`${ENDPOINTS.PRESCRIPTIONS}?customer_id=${customerId}`)
      ]);
  
      if (!customerRes.ok) throw new Error("Customer not found");
      
      customerData = await customerRes.json();
      customerAddresses = await addressesRes.json();
      customerOrders = await ordersRes.json();
      customerPrescriptions = await prescriptionsRes.json();
  
      // Fetch order items for all orders
      if (customerOrders.length > 0) {
        const orderIds = customerOrders.map(order => order.order_id);
        const orderItemsRes = await fetch(`${ENDPOINTS.ORDER_ITEMS}?order_id=${orderIds.join('&order_id=')}`);
        const allOrderItems = await orderItemsRes.json();
        
        // Add order items to each order
        customerOrders.forEach(order => {
          order.items = allOrderItems.filter(item => item.order_id == order.order_id);
        });
      }
  
      // Render all data
      renderCustomerProfile();
      renderAddresses();
      renderOrders();
      renderPrescriptions();
      
    } catch (error) {
      console.error("Error fetching customer data:", error);
      document.getElementById("ordersTable").innerHTML = 
        '<tr><td colspan="7" class="p-4 text-center text-red-500">Error loading orders</td></tr>';
      document.getElementById("prescriptionsTable").innerHTML = 
        '<tr><td colspan="5" class="p-4 text-center text-red-500">Error loading prescriptions</td></tr>';
    }
  }
  
  // Render customer profile information
  function renderCustomerProfile() {
    if (!customerData) return;
    
    document.getElementById("custId").textContent = customerData.customer_id;
    document.getElementById("custName").textContent = `${customerData.first_name} ${customerData.last_name}`;
    document.getElementById("custMail").textContent = customerData.email;
    document.getElementById("custPhone").textContent = customerData.phone_number;
    document.getElementById("custDob").textContent = formatDate(customerData.date_of_birth);
    document.getElementById("custAge").textContent = calculateAge(customerData.date_of_birth);
    document.getElementById("custGender").textContent = customerData.gender ? customerData.gender.charAt(0).toUpperCase() + customerData.gender.slice(1) : "N/A";
    document.getElementById("custStatus").innerHTML = customerData.is_verified ? 
      '<span class="text-green-600 font-medium">Verified</span>' : 
      '<span class="text-yellow-600 font-medium">Unverified</span>';
    document.getElementById("custCreated").textContent = formatDate(customerData.created_at);
  }
  
  // Render customer addresses
  function renderAddresses() {
    const addressContainer = document.getElementById("addressContainer");
    
    if (customerAddresses.length == 0) {
      addressContainer.innerHTML = '<p class="text-gray-500 col-span-2 text-center py-4">No addresses found</p>';
      return;
    }
    
    addressContainer.innerHTML = '';
    
    customerAddresses.forEach(address => {
      const addressCard = `
        <div class="border rounded-lg p-4 ${address.is_default ? 'border-blue-400 bg-blue-50' : ''}">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium">${address.address_line1}</h3>
            ${address.is_default ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>' : ''}
          </div>
          ${address.address_line2 ? `<p class="text-gray-600">${address.address_line2}</p>` : ''}
          <p class="text-gray-600">${address.city}, ${address.state} ${address.zip_code}</p>
          <p class="text-gray-600">${address.country}</p>
          <div class="mt-2 text-sm text-gray-500">
            ${address.is_serviceable ? '<span class="text-green-600">Serviceable area</span>' : '<span class="text-red-600">Not serviceable</span>'}
          </div>
        </div>
      `;
      addressContainer.insertAdjacentHTML('beforeend', addressCard);
    });
  }
  
  // Render customer orders
  function renderOrders() {
    const ordersTable = document.getElementById("ordersTable");
    const orderCount = document.getElementById("orderCount");
    
    if (customerOrders.length == 0) {
      ordersTable.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-gray-500">No orders found</td></tr>';
      orderCount.textContent = "0 orders";
      return;
    }
    
    orderCount.textContent = `${customerOrders.length} order${customerOrders.length != 1 ? 's' : ''}`;
    ordersTable.innerHTML = '';
    
    customerOrders.forEach(order => {
      const orderRow = `
        <tr class="hover:bg-gray-50">
          <td class="border px-4 py-2 font-medium">${order.order_number}</td>
          <td class="border px-4 py-2">${formatDate(order.order_date)}</td>
          <td class="border px-4 py-2">${order.items ? order.items.length : 0} item${order.items && order.items.length != 1 ? 's' : ''}</td>
          <td class="border px-4 py-2">$${parseFloat(order.total_amount).toFixed(2)}</td>
          <td class="border px-4 py-2">
            <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}">${formatStatus(order.status)}</span>
          </td>
          <td class="border px-4 py-2">
            <span class="px-2 py-1 rounded-full text-xs ${getPaymentStatusClass(order.payment_status)}">${formatPaymentStatus(order.payment_status)}</span>
          </td>
          <td class="border px-4 py-2">
            <button class="text-blue-600 hover:text-blue-800 text-sm view-order" data-order-id="${order.order_id}">
              View Details
            </button>
          </td>
        </tr>
      `;
      ordersTable.insertAdjacentHTML('beforeend', orderRow);
    });
    
    // Add event listeners to view order buttons
    document.querySelectorAll('.view-order').forEach(button => {
      button.addEventListener('click', (e) => {
        const orderId = e.target.getAttribute('data-order-id');
        // You can implement order detail view functionality here
        alert(`View order details for order ID: ${orderId}`);
      });
    });
  }
  
  // Render customer prescriptions
  function renderPrescriptions() {
    const prescriptionsTable = document.getElementById("prescriptionsTable");
    const prescriptionCount = document.getElementById("prescriptionCount");
    
    if (customerPrescriptions.length == 0) {
      prescriptionsTable.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No prescriptions found</td></tr>';
      prescriptionCount.textContent = "0 prescriptions";
      return;
    }
    
    prescriptionCount.textContent = `${customerPrescriptions.length} prescription${customerPrescriptions.length != 1 ? 's' : ''}`;
    prescriptionsTable.innerHTML = '';
    
    customerPrescriptions.forEach(prescription => {
      const prescriptionRow = `
        <tr class="hover:bg-gray-50">
          <td class="border px-4 py-2 font-medium">${prescription.prescription_id}</td>
          <td class="border px-4 py-2">${formatDate(prescription.created_at)}</td>
          <td class="border px-4 py-2">
            <span class="px-2 py-1 rounded-full text-xs ${getPrescriptionStatusClass(prescription.status)}">${formatPrescriptionStatus(prescription.status)}</span>
          </td>
          <td class="border px-4 py-2">${prescription.verified_by || 'N/A'}</td>
          <td class="border px-4 py-2">
            <button class="text-blue-600 hover:text-blue-800 text-sm view-prescription" data-prescription-id="${prescription.prescription_id}">
              View Details
            </button>
          </td>
        </tr>
      `;
      prescriptionsTable.insertAdjacentHTML('beforeend', prescriptionRow);
    });
    
    // Add event listeners to view prescription buttons
    document.querySelectorAll('.view-prescription').forEach(button => {
      button.addEventListener('click', (e) => {
        const prescriptionId = e.target.getAttribute('data-prescription-id');
        // You can implement prescription detail view functionality here
        alert(`View prescription details for prescription ID: ${prescriptionId}`);
      });
    });
  }
  
  // Utility functions
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return "N/A";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff == 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
  
  function formatStatus(status) {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  function getStatusClass(status) {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function formatPaymentStatus(status) {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  function getPaymentStatusClass(status) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function formatPrescriptionStatus(status) {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  function getPrescriptionStatusClass(status) {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Initialize the page
  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');
    
    if (customerId) {
      fetchCustomerData(customerId);
    } else {
      document.getElementById("ordersTable").innerHTML = 
        '<tr><td colspan="7" class="p-4 text-center text-red-500">Customer ID not provided</td></tr>';
      document.getElementById("prescriptionsTable").innerHTML = 
        '<tr><td colspan="5" class="p-4 text-center text-red-500">Customer ID not provided</td></tr>';
    }
  });