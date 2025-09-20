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

//   // ---- Customer Data ----
//   const inventoryData = [
//     { 
//         name: "Jenesha", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Lokitha", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Jane", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Malavvika", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Amritha", 
//         id: "D06ID232435454", 
//         city: "Salem", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Karunya", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Hari", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//       { 
//         name: "Nandhini", 
//         id: "D06ID232435454", 
//         city: "Erode", 
//         age: 35,
//         mail: "aug@example.com",
//         dob: "1989-03-12",
//         address: "123 Main Street, Erode"
//       },
//   ];

//   // ---- Pagination ----
//   let currentPage = 1;
//   const rowsPerPage = 10;
//   let filteredData = [...inventoryData];

//   // ---- Table Rendering ----
//   function renderTable(data) {
//     const table = document.getElementById("customerTable");
//     table.innerHTML = "";

//     const start = (currentPage - 1) * rowsPerPage;
//     const paginatedData = data.slice(start, start + rowsPerPage);

//     if (paginatedData.length === 0) {
//       table.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No records found</td></tr>`;
//       return;
//     }

//     paginatedData.forEach(item => {
//         const row = `
//           <tr class="border-b hover:bg-gray-50">
//             <td class="p-3">${item.name}</td>
//             <td class="p-3">${item.id}</td>
//             <td class="p-3">${item.city}</td>
//             <td class="p-3">${item.age}</td>
//             <td class="p-3 text-blue-600 cursor-pointer hover:underline">
//             <a href="customer_detail.html?
//             &custId=${item.id}
//             &custName=${encodeURIComponent(item.name)}
//             &custMail=${encodeURIComponent(item.mail)}
//             &custAge=${item.age}
//             &custDob=${item.dob}
//             &custAddress=${encodeURIComponent(item.address)}
//             &city=${encodeURIComponent(item.city)}">
//               View Full Detail »
//             </a>
            
//             </td>
//           </tr>
//         `;
//         table.insertAdjacentHTML("beforeend", row);
//       });
      

//     renderPagination(data);
//   }

//   // ---- Pagination Controls ----
//   function renderPagination(data) {
//     const pagination = document.getElementById("pagination");
//     pagination.innerHTML = "";

//     const pageCount = Math.ceil(data.length / rowsPerPage);

//     // Prev Button
//     const prevBtn = document.createElement("button");
//     prevBtn.textContent = "Prev";
//     prevBtn.className =
//       "px-3 py-1 border rounded " +
//       (currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "");
//     prevBtn.disabled = currentPage === 1;
//     prevBtn.addEventListener("click", () => {
//       if (currentPage > 1) {
//         currentPage--;
//         renderTable(filteredData);
//       }
//     });
//     pagination.appendChild(prevBtn);

//     // Number Buttons
//     for (let i = 1; i <= pageCount; i++) {
//       const btn = document.createElement("button");
//       btn.textContent = i;
//       btn.className =
//         "px-3 py-1 border rounded " +
//         (i === currentPage ? "bg-blue-500 text-white" : "bg-white");
//       btn.addEventListener("click", () => {
//         currentPage = i;
//         renderTable(filteredData);
//       });
//       pagination.appendChild(btn);
//     }

//     // Next Button
//     const nextBtn = document.createElement("button");
//     nextBtn.textContent = "Next";
//     nextBtn.className =
//       "px-3 py-1 border rounded " +
//       (currentPage === pageCount
//         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//         : "");
//     nextBtn.disabled = currentPage === pageCount;
//     nextBtn.addEventListener("click", () => {
//       if (currentPage < pageCount) {
//         currentPage++;
//         renderTable(filteredData);
//       }
//     });
//     pagination.appendChild(nextBtn);
//   }
// // Populate location filter with unique city values
// function populateLocationFilter(data) {
//     const filter = document.getElementById("categoryFilter");
//     const uniqueCities = [...new Set(data.map(item => item.city))]; // unique cities
  
//     uniqueCities.forEach(city => {
//       const option = document.createElement("option");
//       option.value = city;
//       option.textContent = city;
//       filter.appendChild(option);
//     });
//   }
  
//   // Handle filtering
//   document.getElementById("categoryFilter").addEventListener("change", (e) => {
//     const value = e.target.value;
//     currentPage = 1; // reset to page 1
  
//     if (value === "") {
//       filteredData = [...inventoryData];
//     } else {
//       filteredData = inventoryData.filter(item => item.city === value);
//     }
  
//     renderTable(filteredData);
//   });
  
//   // Reset button
//   document.getElementById("resetBtn").addEventListener("click", () => {
//     document.getElementById("categoryFilter").value = "";
//     filteredData = [...inventoryData];
//     currentPage = 1;
//     renderTable(filteredData);
//   });
  
//   // Call once on page load
//   populateLocationFilter(inventoryData);
  
//   // ---- Initial Render ----
//   renderTable(filteredData);

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
  PRESCRIPTIONS: `${API_BASE}/prescriptions`
};

// Global variables
let customersData = [];
let customerAddresses = [];
let ordersData = [];
let prescriptionsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Fetch data from API
async function fetchData() {
  try {
      // Show loading state
      document.getElementById("tableMessage").textContent = "Loading customer data...";
      
      // Fetch all data in parallel
      const [customersRes, addressesRes, ordersRes, prescriptionsRes] = await Promise.all([
          fetch(ENDPOINTS.CUSTOMERS),
          fetch(ENDPOINTS.CUSTOMER_ADDRESSES),
          fetch(ENDPOINTS.ORDERS),
          fetch(ENDPOINTS.PRESCRIPTIONS)
      ]);

      customersData = await customersRes.json();
      customerAddresses = await addressesRes.json();
      ordersData = await ordersRes.json();
      prescriptionsData = await prescriptionsRes.json();

      // Process and enrich customer data
      processCustomerData();
      
      // Initialize with all data
      filteredData = [...customersData];
      
      // Render the table
      renderTable(filteredData);
      populateLocationFilter();
      updateSummaryStats();
      
  } catch (error) {
      console.error("Error fetching data:", error);
      document.getElementById("tableMessage").textContent = "Error loading customer data. Please try again.";
  }
}

// Process and enrich customer data with additional information
function processCustomerData() {
  customersData.forEach(customer => {
      // Add address information
      const address = customerAddresses.find(addr => addr.customer_id == customer.customer_id);
      customer.city = address ? address.city : "N/A";
      customer.state = address ? address.state : "N/A";
      
      // Add order information
      customer.orders = ordersData.filter(order => order.customer_id == customer.customer_id);
      customer.orderCount = customer.orders.length;
      customer.totalSpent = customer.orders.reduce((total, order) => total + parseFloat(order.total_amount || 0), 0);
      
      // Add prescription information
      customer.prescriptions = prescriptionsData.filter(pres => pres.customer_id == customer.customer_id);
      customer.prescriptionCount = customer.prescriptions.length;
  });
}

// Render customer table
function renderTable(data) {
  const table = document.getElementById("customerTable");
  table.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(start, start + rowsPerPage);

  if (paginatedData.length === 0) {
      table.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-gray-500">No customers found</td></tr>`;
      document.getElementById("tableMessage").textContent = "No customers match your search criteria.";
      return;
  }

  document.getElementById("tableMessage").textContent = `Showing ${paginatedData.length} of ${data.length} customers`;

  paginatedData.forEach(customer => {
      const row = `
          <tr class="border-b hover:bg-gray-50">
              <td class="p-3">${customer.customer_id}</td>
              <td class="p-3 font-medium">${customer.first_name} ${customer.last_name}</td>
              <td class="p-3">${customer.email}</td>
              <td class="p-3">${customer.phone_number}</td>
              <td class="p-3">${customer.city}, ${customer.state}</td>
              <td class="p-3">${customer.orderCount} ($${customer.totalSpent.toFixed(2)})</td>
              <td class="p-3">
                  <span class="px-2 py-1 rounded-full text-xs ${customer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                      ${customer.is_verified ? 'Verified' : 'Unverified'}
                  </span>
              </td>
              <td class="p-3">
                  <a href="customer_detail.html?customerId=${customer.customer_id}" 
                     class="text-blue-600 hover:text-blue-800 font-medium">
                      View Details
                  </a>
              </td>
          </tr>
      `;
      table.insertAdjacentHTML("beforeend", row);
  });

  renderPagination(data);
}

// Populate location filter with unique city values
function populateLocationFilter() {
  const filter = document.getElementById("locationFilter");
  const uniqueCities = [...new Set(customersData.map(customer => customer.city))].filter(city => city !== "N/A");
  
  uniqueCities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      filter.appendChild(option);
  });
}

// Update summary statistics
function updateSummaryStats() {
  const totalCustomers = customersData.length;
  const verifiedCustomers = customersData.filter(c => c.is_verified).length;
  const totalOrders = ordersData.length;
  const totalRevenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  
  document.getElementById("summaryStats").innerHTML = `
      <span class="mr-4"><strong>${totalCustomers}</strong> Customers</span>
      <span class="mr-4"><strong>${verifiedCustomers}</strong> Verified</span>
      <span class="mr-4"><strong>${totalOrders}</strong> Orders</span>
      <span><strong>$${totalRevenue.toFixed(2)}</strong> Revenue</span>
  `;
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  applyFilters(searchTerm);
});

// Location filter
document.getElementById("locationFilter").addEventListener("change", (e) => {
  applyFilters();
});

// Status filter
document.getElementById("statusFilter").addEventListener("change", (e) => {
  applyFilters();
});

// Apply all filters
function applyFilters(searchTerm = "") {
  currentPage = 1;
  
  filteredData = customersData.filter(customer => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
          customer.first_name.toLowerCase().includes(searchTerm) ||
          customer.last_name.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm) ||
          customer.phone_number.includes(searchTerm);
      
      // Location filter
      const locationValue = document.getElementById("locationFilter").value;
      const matchesLocation = locationValue === "" || customer.city === locationValue;
      
      // Status filter
      const statusValue = document.getElementById("statusFilter").value;
      let matchesStatus = true;
      if (statusValue === "verified") {
          matchesStatus = customer.is_verified === true;
      } else if (statusValue === "unverified") {
          matchesStatus = customer.is_verified === false;
      }
      
      return matchesSearch && matchesLocation && matchesStatus;
  });
  
  renderTable(filteredData);
  updateSummaryStats();
}

// Reset button
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("locationFilter").value = "";
  document.getElementById("statusFilter").value = "";
  filteredData = [...customersData];
  currentPage = 1;
  renderTable(filteredData);
  updateSummaryStats();
});

// ---- Pagination Controls ----
function renderPagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);
  if (pageCount <= 1) return;

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.className = "px-3 py-1 border rounded " + 
      (currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "hover:bg-gray-200");
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
          currentPage--;
          renderTable(filteredData);
      }
  });
  pagination.appendChild(prevBtn);

  // Page Number Buttons
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "px-3 py-1 border rounded " + 
          (i === currentPage ? "bg-blue-500 text-white" : "hover:bg-gray-200");
      btn.addEventListener("click", () => {
          currentPage = i;
          renderTable(filteredData);
      });
      pagination.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "px-3 py-1 border rounded " + 
      (currentPage === pageCount ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "hover:bg-gray-200");
  nextBtn.disabled = currentPage === pageCount;
  nextBtn.addEventListener("click", () => {
      if (currentPage < pageCount) {
          currentPage++;
          renderTable(filteredData);
      }
  });
  pagination.appendChild(nextBtn);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", fetchData);