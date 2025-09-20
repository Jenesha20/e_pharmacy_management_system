// // Sidebar
// function loadComponent(id, filePath) {
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

// // Dummy data
// const inventoryData = [
//   { name: "Augmentin 625 Du.", id: "D06ID232435454", category: "Generic Medicine", stock: 350, expiry: "2026-05-12" ,effects:"Side effects",use:"How to use"},
//   { name: "Azithral 500 Tablet", id: "D06ID232435451", category: "Generic Medicine", stock: 20, expiry: "2025-09-20"  ,effects:"Side effects",use:"How to use"},
//   { name: "Ascoril LS Syrup", id: "D06ID232435452", category: "Diabetes", stock: 85, expiry: "2025-11-15"  ,effects:"Side effects",use:"How to use"},
//   { name: "Azee 500 Tablet", id: "D06ID232435450", category: "Generic Medicine", stock: 75, expiry: "2026-01-01"  ,effects:"Side effects",use:"How to use"},
//   { name: "Allegra 120mg Ta.", id: "D06ID232435455", category: "Diabetes", stock: 44, expiry: "2024-12-31"  ,effects:"Side effects",use:"How to use"},
//   { name: "Alex Syrup", id: "D06ID232435456", category: "Generic Medicine", stock: 65, expiry: "2025-07-01" ,effects:"Side effects" ,use:"How to use"},
//   { name: "Amoxyclav 625 Ta.", id: "D06ID232435457", category: "Generic Medicine", stock: 150, expiry: "2025-10-20" ,effects:"Side effects" ,use:"How to use"},
//   { name: "Avil 25 Tablet", id: "D06ID232435458", category: "Generic Medicine", stock: 270, expiry: "2026-03-15" ,effects:"Side effects" ,use:"How to use"}
// ];

// // Pagination
// let currentPage = 1;
// const rowsPerPage = 5;
// let filteredData = [...inventoryData];
// let baseData = [...inventoryData]; // keeps last applied Show Details set

// // ---- Table Rendering ----
// function renderTable(data) {
//   const table = document.getElementById("inventoryTable");
//   table.innerHTML = "";

//   const start = (currentPage - 1) * rowsPerPage;
//   const paginatedData = data.slice(start, start + rowsPerPage);

//   if (paginatedData.length === 0) {
//     table.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No records found</td></tr>`;
//     return;
//   }

//   paginatedData.forEach(item => {
//     const row = `
//       <tr class="border-b hover:bg-gray-50">
//         <td class="p-3">${item.name}</td>
//         <td class="p-3">${item.id}</td>
//         <td class="p-3">${item.category}</td>
//         <td class="p-3">${item.stock}</td>
//         <td class="p-3">${item.expiry}</td>
//         <td class="p-3 text-blue-600 cursor-pointer hover:underline">
//         <a href="inventory_detail.html?
//         &medId=${item.id}
//         &medName=${encodeURIComponent(item.name)}
//         &medCat=${encodeURIComponent(item.category)}
//         &medStock=${item.stock}
//         &medExpiry=${item.expiry}
//         &medEffect=${encodeURIComponent(item.effects)}
//         &medUse=${encodeURIComponent(item.use)}">
//         View Full Detail »
//         </a>
//         </td>
//       </tr>
//     `;
//     table.insertAdjacentHTML("beforeend", row);
//   });

//   renderPagination(data);
// }

// // ---- Pagination ----
// function renderPagination(data) {
//   const pagination = document.getElementById("pagination");
//   pagination.innerHTML = "";

//   const pageCount = Math.ceil(data.length / rowsPerPage);

//   // Prev Button
//   const prevBtn = document.createElement("button");
//   prevBtn.textContent = "Prev";
//   prevBtn.className =
//     "px-3 py-1 border rounded " +
//     (currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "");
//   prevBtn.disabled = currentPage === 1;
//   prevBtn.addEventListener("click", () => {
//     if (currentPage > 1) {
//       currentPage--;
//       renderTable(filteredData);
//     }
//   });
//   pagination.appendChild(prevBtn);

//   // Number Buttons
//   for (let i = 1; i <= pageCount; i++) {
//     const btn = document.createElement("button");
//     btn.textContent = i;
//     btn.className =
//       "px-3 py-1 border rounded " +
//       (i === currentPage ? "bg-blue-500 text-white" : "bg-white");
//     btn.addEventListener("click", () => {
//       currentPage = i;
//       renderTable(filteredData);
//     });
//     pagination.appendChild(btn);
//   }

//   // Next Button
//   const nextBtn = document.createElement("button");
//   nextBtn.textContent = "Next";
//   nextBtn.className =
//     "px-3 py-1 border rounded " +
//     (currentPage === pageCount
//       ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//       : "");
//   nextBtn.disabled = currentPage === pageCount;
//   nextBtn.addEventListener("click", () => {
//     if (currentPage < pageCount) {
//       currentPage++;
//       renderTable(filteredData);
//     }
//   });
//   pagination.appendChild(nextBtn);
// }

// // ---- Count Update ----
// function updateCounts() {
//   document.getElementById("allOrdersCount").textContent = inventoryData.length;

//   const uniqueCategories = new Set(inventoryData.map(item => item.category));
//   document.getElementById("inprogressCount").textContent = uniqueCategories.size;

//   const shortage = inventoryData.filter(item => item.stock < 50);
//   document.getElementById("packedCount").textContent = shortage.length;

//   const today = new Date();
//   const tenDaysLater = new Date();
//   tenDaysLater.setDate(today.getDate() + 10);

//   const expiringSoon = inventoryData.filter(item => {
//     const expDate = new Date(item.expiry);
//     return expDate >= today && expDate <= tenDaysLater;
//   });
//   document.getElementById("deliveredCount").textContent = expiringSoon.length;
// }

// // ---- Show Details Filters ----
// function showDetails(type) {
//   const messageBox = document.getElementById("tableMessage");

//   if (type === "All") {
//     baseData = [...inventoryData];
//     messageBox.textContent = "Showing all medicines";
//   } 
//   else if (type === "Category") {
//     const categoryMap = new Map();
//     inventoryData.forEach(item => {
//       if (!categoryMap.has(item.category)) {
//         categoryMap.set(item.category, item);
//       } else {
//         const currentMax = categoryMap.get(item.category);
//         if (item.stock > currentMax.stock) {
//           categoryMap.set(item.category, item);
//         }
//       }
//     });
//     baseData = Array.from(categoryMap.values());
//     messageBox.textContent = "Medicine details for each category with highest stock count";
//   } 
//   else if (type === "Shortage") {
//     baseData = inventoryData.filter(item => item.stock < 50);
//     messageBox.textContent = "Showing medicines with shortage (stock < 50)";
//   } 
//   else if (type === "Expiry") {
//     const today = new Date();
//     baseData = inventoryData.filter(item => new Date(item.expiry) < today);
//     messageBox.textContent = "Showing expired medicines";
//   }

//   filteredData = [...baseData];
//   currentPage = 1;
//   renderTable(filteredData);
// }

// // ---- Search & Category Filter ----
// function applyFilters() {
//   const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
//   const categoryValue = document.getElementById("categoryFilter").value;

//   filteredData = baseData.filter(item => {
//     const matchesSearch =
//       item.name.toLowerCase().includes(searchValue) ||
//       item.id.toLowerCase().includes(searchValue) ||
//       item.category.toLowerCase().includes(searchValue);

//     const matchesCategory = categoryValue === "" || item.category === categoryValue;

//     return matchesSearch && matchesCategory;
//   });

//   const messageBox = document.getElementById("tableMessage");
//   if (searchValue || categoryValue) {
//     messageBox.textContent = "Filtered results";
//   } else {
//     messageBox.textContent = ""; // clear if no filters and not in Show Details
//   }

//   currentPage = 1;
//   renderTable(filteredData);
// }

// // ---- Initialize ----
// document.addEventListener("DOMContentLoaded", () => {
//   updateCounts();
//   renderTable(filteredData);

//   document.getElementById("searchClearBtn").addEventListener("click", () => {
//     document.getElementById("searchInput").value = "";
//     applyFilters();
//   });

//   document.getElementById("resetBtn").addEventListener("click", () => {
//     document.getElementById("searchInput").value = "";
//     document.getElementById("categoryFilter").value = "";
//     baseData = [...inventoryData];
//     filteredData = [...inventoryData];
//     currentPage = 1;
//     document.getElementById("tableMessage").textContent = "";
//     renderTable(filteredData);
//   });

//   document.getElementById("categoryFilter").addEventListener("change", applyFilters);

//   document.querySelectorAll(".filter-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//       showDetails(btn.dataset.status);
//     });
//   });
// });
//   // ---- Handle query param from alerts page ----
//   const urlParams = new URLSearchParams(window.location.search);
//   const type = urlParams.get("type"); // expiry | outofstock | pending

//   if (type) {
//     if (type === "expiry") {
//       showDetails("Expiry");   // expired medicines
//     } else if (type === "outofstock") {
//       baseData = inventoryData.filter(item => item.stock === 0);
//       filteredData = [...baseData];
//       document.getElementById("tableMessage").textContent = "Showing out of stock medicines";
//       renderTable(filteredData);
//     } else if (type === "pending") {
//       // if you want pending prescription logic, adapt this:
//       baseData = inventoryData.filter(item => item.requiresPrescription);
//       filteredData = [...baseData];
//       document.getElementById("tableMessage").textContent = "Showing medicines with pending prescriptions";
//       renderTable(filteredData);
//     }
//   }


// API endpoints
const API_BASE = 'http://localhost:3000';
const ENDPOINTS = {
  products: `${API_BASE}/products`,
  inventory: `${API_BASE}/inventory`,
  categories: `${API_BASE}/categories`,
  notifications: `${API_BASE}/notifications`
};

// Global variables
let productsData = [];
let inventoryData = [];
let categoriesData = [];
let combinedData = [];
let currentPage = 1;
const rowsPerPage = 5;
let filteredData = [];
let baseData = [];
let currentRestockProductId = null;

// Sidebar
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

// API functions
async function fetchData() {
  try {
    const [productsResponse, inventoryResponse, categoriesResponse] = await Promise.all([
      fetch(ENDPOINTS.products),
      fetch(ENDPOINTS.inventory),
      fetch(ENDPOINTS.categories)
    ]);

    productsData = await productsResponse.json();
    inventoryData = await inventoryResponse.json();
    categoriesData = await categoriesResponse.json();

    // Combine product and inventory data
    combinedData = productsData.map(product => {
      const inventory = inventoryData.find(inv => inv.product_id == product.product_id) || {};
      const category = categoriesData.find(cat => cat.category_id == product.category_id) || {};
      
      return {
        ...product,
        ...inventory,
        category_name: category.name || 'Uncategorized',
        low_stock_threshold: inventory.low_stock_threshold || 10,
        // Update image path
        image_url: product.image_url ? `images/${product.image_url}` : '/images/placeholder-medicine.jpg'
      };
    });

    populateCategoryFilter();
    updateCounts();
    baseData = [...combinedData];
    filteredData = [...combinedData];
    renderTable(filteredData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  // Clear existing options except the first one
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Add new categories
  
  // Add categories from API
  categoriesData.forEach(category => {
    if (category.is_active) {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    }
  });
  
  // Add new categories
 
}

// ---- Table Rendering ----
function renderTable(data) {
  const table = document.getElementById("inventoryTable");
  table.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(start, start + rowsPerPage);

  if (paginatedData.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-gray-500">No records found</td></tr>`;
    return;
  }

  paginatedData.forEach(item => {
    const isLowStock = item.quantity_in_stock <= item.low_stock_threshold && item.quantity_in_stock > 0;
    const isOutOfStock = item.quantity_in_stock === 0;
    
    // Check if product is expiring soon (within 30 days)
    const today = new Date();
    const expiryDate = new Date(item.expiry_date);
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    const isExpired = daysUntilExpiry < 0;
    
    let rowClass = '';
    if (isOutOfStock) rowClass = 'out-of-stock';
    else if (isLowStock) rowClass = 'low-stock';
    else if (isExpiringSoon) rowClass = 'expiring-soon';
    else if (isExpired) rowClass = 'out-of-stock';

    const row = `
      <tr class="border-b hover:bg-gray-50 ${rowClass}">
        <td class="p-3 text-center">
          <img src="${item.image_url}" alt="${item.name}" class="w-12 h-12 object-contain mx-auto">
        </td>
        <td class="p-3 font-medium">${item.name}</td>
        <td class="p-3">${item.sku}</td>
        <td class="p-3">${item.category_name}</td>
        <td class="p-3">
          ${item.quantity_in_stock}
          ${isLowStock ? '<span class="text-yellow-600 ml-1"><i class="fas fa-exclamation-circle"></i></span>' : ''}
          ${isOutOfStock ? '<span class="text-red-600 ml-1"><i class="fas fa-times-circle"></i></span>' : ''}
        </td>
        <td class="p-3">$${item.price.toFixed(2)}</td>
        <td class="p-3 ${isExpiringSoon ? 'text-yellow-600 font-medium' : ''} ${isExpired ? 'text-red-600 font-medium' : ''}">
          ${new Date(item.expiry_date).toLocaleDateString()}
          ${isExpiringSoon ? '<span class="ml-1"><i class="fas fa-exclamation-circle"></i></span>' : ''}
          ${isExpired ? '<span class="ml-1"><i class="fas fa-times-circle"></i></span>' : ''}
        </td>
        <td class="p-3">
          <div class="flex flex-col space-y-2">
            <button class="text-blue-600 hover:text-blue-800 text-sm edit-btn" data-id="${item.product_id}">
              <i class="fas fa-edit mr-1"></i> Edit
            </button>
            <button class="text-green-600 hover:text-green-800 text-sm restock-btn" data-id="${item.product_id}">
              <i class="fas fa-cubes mr-1"></i> Restock
            </button>
            <a href="inventory_detail.html?productId=${item.product_id}" class="text-purple-600 hover:text-purple-800 text-sm">
              <i class="fas fa-info-circle mr-1"></i> Details
            </a>
          </div>
        </td>
      </tr>
    `;
    table.insertAdjacentHTML("beforeend", row);
  });

  // Add event listeners to the action buttons
  document.querySelectorAll('.restock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('.restock-btn').dataset.id;
      openRestockModal(productId);
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('.edit-btn').dataset.id;
      window.location.href = `inventory_addition.html?edit=${productId}`;
    });
  });

  renderPagination(data);
}

// ---- Pagination ----
function renderPagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);
  if (pageCount <= 1) return;

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
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

  // Number Buttons
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
      (i === currentPage ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable(filteredData);
    });
    pagination.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
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

// ---- Count Update ----
function updateCounts() {
  document.getElementById("allProductsCount").textContent = combinedData.length;

  const uniqueCategories = new Set(combinedData.map(item => item.category_name));
  document.getElementById("categoriesCount").textContent = uniqueCategories.size;

  const lowStock = combinedData.filter(item => 
    item.quantity_in_stock > 0 && item.quantity_in_stock <= item.low_stock_threshold
  );
  document.getElementById("lowStockCount").textContent = lowStock.length;

  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiringSoon = combinedData.filter(item => {
    const expDate = new Date(item.expiry_date);
    return expDate >= today && expDate <= thirtyDaysLater;
  });
  document.getElementById("expiringCount").textContent = expiringSoon.length;
}

// ---- Show Details Filters ----
function showDetails(type) {
  const messageBox = document.getElementById("tableMessage");

  if (type === "All") {
    baseData = [...combinedData];
    messageBox.textContent = "Showing all products";
  } 
  else if (type === "Category") {
    const categoryMap = new Map();
    combinedData.forEach(item => {
      if (!categoryMap.has(item.category_name)) {
        categoryMap.set(item.category_name, item);
      } else {
        const currentMax = categoryMap.get(item.category_name);
        if (item.quantity_in_stock > currentMax.quantity_in_stock) {
          categoryMap.set(item.category_name, item);
        }
      }
    });
    baseData = Array.from(categoryMap.values());
    messageBox.textContent = "Showing one product per category with highest stock count";
  } 
  else if (type === "LowStock") {
    baseData = combinedData.filter(item => 
      item.quantity_in_stock > 0 && item.quantity_in_stock <= item.low_stock_threshold
    );
    messageBox.textContent = "Showing products with low stock";
  } 
  else if (type === "Expiry") {
    const today = new Date();
    baseData = combinedData.filter(item => {
      const expDate = new Date(item.expiry_date);
      return expDate < today;
    });
    messageBox.textContent = "Showing expired products";
  }

  filteredData = [...baseData];
  currentPage = 1;
  renderTable(filteredData);
}

// ---- Search & Filter Functions ----
function applyFilters() {
  const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
  const categoryValue = document.getElementById("categoryFilter").value;
  const stockValue = document.getElementById("stockFilter").value;

  filteredData = baseData.filter(item => {
    // Search filter
    const matchesSearch =
      item.name.toLowerCase().includes(searchValue) ||
      item.sku.toLowerCase().includes(searchValue) ||
      item.category_name.toLowerCase().includes(searchValue);

    // Category filter
    const matchesCategory = categoryValue === "" || item.category_name === categoryValue;
    
    // Stock status filter
    let matchesStock = true;
    if (stockValue === "low") {
      matchesStock = item.quantity_in_stock > 0 && item.quantity_in_stock <= item.low_stock_threshold;
    } else if (stockValue === "out") {
      matchesStock = item.quantity_in_stock === 0;
    } else if (stockValue === "sufficient") {
      matchesStock = item.quantity_in_stock > item.low_stock_threshold;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const messageBox = document.getElementById("tableMessage");
  if (searchValue || categoryValue || stockValue) {
    messageBox.textContent = `Showing ${filteredData.length} filtered results`;
  } else {
    messageBox.textContent = "";
  }

  currentPage = 1;
  renderTable(filteredData);
}

// ---- Restock Modal Functions ----
function openRestockModal(productId) {
  currentRestockProductId = productId;
  const product = combinedData.find(p => p.product_id == productId);
  
  if (product) {
    document.getElementById('restockModal').classList.remove('hidden');
    document.getElementById('restockQuantity').value = "";
  }
}

function closeRestockModal() {
  document.getElementById('restockModal').classList.add('hidden');
  currentRestockProductId = null;
}

async function handleRestock() {
  const quantity = parseInt(document.getElementById('restockQuantity').value);
  
  if (isNaN(quantity) || quantity <= 0) {
    alert("Please enter a valid quantity");
    return;
  }
  
  try {
    // Find the inventory record for this product
    const inventoryId = inventoryData.find(inv => inv.product_id == currentRestockProductId)?.id;
    
    if (inventoryId) {
      // Update the inventory via PATCH request
      const response = await fetch(`${ENDPOINTS.inventory}/${inventoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity_in_stock: inventoryData.find(inv => inv.product_id == currentRestockProductId).quantity_in_stock + quantity,
          last_restocked_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Refresh data
        await fetchData();
        closeRestockModal();
        alert(`Successfully added ${quantity} units to stock`);
      } else {
        throw new Error('Failed to update inventory');
      }
    }
  } catch (error) {
    console.error("Error restocking product:", error);
    alert("Error restocking product. Please try again.");
  }
}

// ---- Export Function ----
function exportToCSV() {
  const dataToExport = filteredData.length > 0 ? filteredData : combinedData;
  
  // CSV header
  let csv = "Product Name,SKU,Category,Stock Quantity,Price,Expiry Date\n";
  
  // CSV rows
  dataToExport.forEach(item => {
    csv += `"${item.name}",${item.sku},${item.category_name},${item.quantity_in_stock},${item.price},"${new Date(item.expiry_date).toLocaleDateString()}"\n`;
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("sidebar", "../../../core/components/sidebar.html");
  fetchData();

  // Event listeners
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("searchClearBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    applyFilters();
  });

  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("stockFilter").addEventListener("change", applyFilters);

  document.getElementById("resetBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("stockFilter").value = "";
    baseData = [...combinedData];
    filteredData = [...combinedData];
    currentPage = 1;
    document.getElementById("tableMessage").textContent = "";
    renderTable(filteredData);
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showDetails(btn.dataset.status);
    });
  });

  // Restock modal events
  document.getElementById("cancelRestock").addEventListener("click", closeRestockModal);
  document.getElementById("confirmRestock").addEventListener("click", handleRestock);
  
  // Export button
  document.getElementById("exportBtn").addEventListener("click", exportToCSV);

  // Close modal when clicking outside
  document.getElementById("restockModal").addEventListener("click", (e) => {
    if (e.target.id === "restockModal") {
      closeRestockModal();
    }
  });

  // Handle query param from alerts page
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type"); // expiry | outofstock | lowstock

  if (type) {
    if (type === "expiry") {
      showDetails("Expiry");
    } else if (type === "outofstock") {
      baseData = combinedData.filter(item => item.quantity_in_stock === 0);
      filteredData = [...baseData];
      document.getElementById("tableMessage").textContent = "Showing out of stock products";
      renderTable(filteredData);
    } else if (type === "lowstock") {
      baseData = combinedData.filter(item => 
        item.quantity_in_stock > 0 && item.quantity_in_stock <= item.low_stock_threshold
      );
      filteredData = [...baseData];
      document.getElementById("tableMessage").textContent = "Showing low stock products";
      renderTable(filteredData);
    }
  }
});