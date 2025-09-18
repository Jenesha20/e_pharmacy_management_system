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

loadComponent("sidebar", "../../../core/components/sidebar.html");

// Dummy data
const inventoryData = [
  { name: "Augmentin 625 Du.", id: "D06ID232435454", category: "Generic Medicine", stock: 350, expiry: "2026-05-12" ,effects:"Side effects",use:"How to use"},
  { name: "Azithral 500 Tablet", id: "D06ID232435451", category: "Generic Medicine", stock: 20, expiry: "2025-09-20"  ,effects:"Side effects",use:"How to use"},
  { name: "Ascoril LS Syrup", id: "D06ID232435452", category: "Diabetes", stock: 85, expiry: "2025-11-15"  ,effects:"Side effects",use:"How to use"},
  { name: "Azee 500 Tablet", id: "D06ID232435450", category: "Generic Medicine", stock: 75, expiry: "2026-01-01"  ,effects:"Side effects",use:"How to use"},
  { name: "Allegra 120mg Ta.", id: "D06ID232435455", category: "Diabetes", stock: 44, expiry: "2024-12-31"  ,effects:"Side effects",use:"How to use"},
  { name: "Alex Syrup", id: "D06ID232435456", category: "Generic Medicine", stock: 65, expiry: "2025-07-01" ,effects:"Side effects" ,use:"How to use"},
  { name: "Amoxyclav 625 Ta.", id: "D06ID232435457", category: "Generic Medicine", stock: 150, expiry: "2025-10-20" ,effects:"Side effects" ,use:"How to use"},
  { name: "Avil 25 Tablet", id: "D06ID232435458", category: "Generic Medicine", stock: 270, expiry: "2026-03-15" ,effects:"Side effects" ,use:"How to use"}
];

// Pagination
let currentPage = 1;
const rowsPerPage = 5;
let filteredData = [...inventoryData];
let baseData = [...inventoryData]; // keeps last applied Show Details set

// ---- Table Rendering ----
function renderTable(data) {
  const table = document.getElementById("inventoryTable");
  table.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(start, start + rowsPerPage);

  if (paginatedData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No records found</td></tr>`;
    return;
  }

  paginatedData.forEach(item => {
    const row = `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-3">${item.name}</td>
        <td class="p-3">${item.id}</td>
        <td class="p-3">${item.category}</td>
        <td class="p-3">${item.stock}</td>
        <td class="p-3">${item.expiry}</td>
        <td class="p-3 text-blue-600 cursor-pointer hover:underline">
        <a href="inventory_detail.html?
        &medId=${item.id}
        &medName=${encodeURIComponent(item.name)}
        &medCat=${encodeURIComponent(item.category)}
        &medStock=${item.stock}
        &medExpiry=${item.expiry}
        &medEffect=${encodeURIComponent(item.effects)}
        &medUse=${encodeURIComponent(item.use)}">
        View Full Detail »
        </a>
        </td>
      </tr>
    `;
    table.insertAdjacentHTML("beforeend", row);
  });

  renderPagination(data);
}

// ---- Pagination ----
function renderPagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.className =
    "px-3 py-1 border rounded " +
    (currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "");
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable(filteredData);
    }
  });
  pagination.appendChild(prevBtn);

  // Number Buttons
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className =
      "px-3 py-1 border rounded " +
      (i === currentPage ? "bg-blue-500 text-white" : "bg-white");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable(filteredData);
    });
    pagination.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className =
    "px-3 py-1 border rounded " +
    (currentPage === pageCount
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "");
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
  document.getElementById("allOrdersCount").textContent = inventoryData.length;

  const uniqueCategories = new Set(inventoryData.map(item => item.category));
  document.getElementById("inprogressCount").textContent = uniqueCategories.size;

  const shortage = inventoryData.filter(item => item.stock < 50);
  document.getElementById("packedCount").textContent = shortage.length;

  const today = new Date();
  const tenDaysLater = new Date();
  tenDaysLater.setDate(today.getDate() + 10);

  const expiringSoon = inventoryData.filter(item => {
    const expDate = new Date(item.expiry);
    return expDate >= today && expDate <= tenDaysLater;
  });
  document.getElementById("deliveredCount").textContent = expiringSoon.length;
}

// ---- Show Details Filters ----
function showDetails(type) {
  const messageBox = document.getElementById("tableMessage");

  if (type === "All") {
    baseData = [...inventoryData];
    messageBox.textContent = "Showing all medicines";
  } 
  else if (type === "Category") {
    const categoryMap = new Map();
    inventoryData.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, item);
      } else {
        const currentMax = categoryMap.get(item.category);
        if (item.stock > currentMax.stock) {
          categoryMap.set(item.category, item);
        }
      }
    });
    baseData = Array.from(categoryMap.values());
    messageBox.textContent = "Medicine details for each category with highest stock count";
  } 
  else if (type === "Shortage") {
    baseData = inventoryData.filter(item => item.stock < 50);
    messageBox.textContent = "Showing medicines with shortage (stock < 50)";
  } 
  else if (type === "Expiry") {
    const today = new Date();
    baseData = inventoryData.filter(item => new Date(item.expiry) < today);
    messageBox.textContent = "Showing expired medicines";
  }

  filteredData = [...baseData];
  currentPage = 1;
  renderTable(filteredData);
}

// ---- Search & Category Filter ----
function applyFilters() {
  const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
  const categoryValue = document.getElementById("categoryFilter").value;

  filteredData = baseData.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchValue) ||
      item.id.toLowerCase().includes(searchValue) ||
      item.category.toLowerCase().includes(searchValue);

    const matchesCategory = categoryValue === "" || item.category === categoryValue;

    return matchesSearch && matchesCategory;
  });

  const messageBox = document.getElementById("tableMessage");
  if (searchValue || categoryValue) {
    messageBox.textContent = "Filtered results";
  } else {
    messageBox.textContent = ""; // clear if no filters and not in Show Details
  }

  currentPage = 1;
  renderTable(filteredData);
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", () => {
  updateCounts();
  renderTable(filteredData);

  document.getElementById("searchClearBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    applyFilters();
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";
    baseData = [...inventoryData];
    filteredData = [...inventoryData];
    currentPage = 1;
    document.getElementById("tableMessage").textContent = "";
    renderTable(filteredData);
  });

  document.getElementById("categoryFilter").addEventListener("change", applyFilters);

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showDetails(btn.dataset.status);
    });
  });
});
  // ---- Handle query param from alerts page ----
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type"); // expiry | outofstock | pending

  if (type) {
    if (type === "expiry") {
      showDetails("Expiry");   // expired medicines
    } else if (type === "outofstock") {
      baseData = inventoryData.filter(item => item.stock === 0);
      filteredData = [...baseData];
      document.getElementById("tableMessage").textContent = "Showing out of stock medicines";
      renderTable(filteredData);
    } else if (type === "pending") {
      // if you want pending prescription logic, adapt this:
      baseData = inventoryData.filter(item => item.requiresPrescription);
      filteredData = [...baseData];
      document.getElementById("tableMessage").textContent = "Showing medicines with pending prescriptions";
      renderTable(filteredData);
    }
  }

