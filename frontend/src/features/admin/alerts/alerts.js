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

// ---- Customer Data ----
const alertData = [
  { 
      type:"Expiry",
      notification:"med101 is about to expire in 10 days"
    },
    { 
      type:"Out of Stock",
      notification:"med101 is about to expire in 10 days"
    },
    { 
      type:"Pending prescription",
      notification:"med101 is about to expire in 10 days"
    },
    
];

// ---- Pagination ----
let currentPage = 1;
const rowsPerPage = 10;
let filteredData = [...alertData];

// ---- Table Rendering ----
function renderTable(data) {
  const table = document.getElementById("alertTable");
  table.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(start, start + rowsPerPage);

  if (paginatedData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No records found</td></tr>`;
    return;
  }

  // <a href="customer_detail.html?
  // &custId=${item.id}
  // &custName=${encodeURIComponent(item.name)}
  // &custMail=${encodeURIComponent(item.mail)}
  // &custAge=${item.age}
  // &custDob=${item.dob}
  // &custAddress=${encodeURIComponent(item.address)}
  // &city=${encodeURIComponent(item.city)}"> </a>
  paginatedData.forEach(item => {
    let targetPage = "../inventory/inventory.html"; // default page
    let queryParam = "";
  
    if (item.type === "Expiry") {
      queryParam = "?type=expiry";
      targetPage = "../inventory/inventory.html";
    } else if (item.type === "Out of Stock") {
      queryParam = "?type=outofstock";
      targetPage = "../inventory/inventory.html";
    } else if (item.type === "Pending prescription") {
      queryParam = "?type=pending";
      targetPage = "../verification/verification.html";
    }
  
    const row = `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-3">${item.type}</td>
        <td class="p-3">${item.notification}</td>
        <td class="p-3">
          <a href="${targetPage}${queryParam}" 
             class="text-blue-600 hover:underline">
            View Full Detail »
          </a>
        </td>
      </tr>
    `;
    table.insertAdjacentHTML("beforeend", row);
  });
  
    

  renderPagination(data);
}

// ---- Pagination Controls ----
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
// Populate location filter with unique city values
function populateLocationFilter(data) {
  const filter = document.getElementById("categoryFilter");
  const uniqueCities = [...new Set(data.map(item => item.city))]; // unique cities

  uniqueCities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    filter.appendChild(option);
  });
}

// Handle filtering
document.getElementById("categoryFilter").addEventListener("change", (e) => {
  const value = e.target.value;
  currentPage = 1; // reset to page 1

  if (value === "") {
    filteredData = [...alertData];
  } else {
    filteredData = alertData.filter(item => item.type === value);
  }

  renderTable(filteredData);
});

// Reset button
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("categoryFilter").value = "";
  filteredData = [...alertData];
  currentPage = 1;
  renderTable(filteredData);
});

// Call once on page load
populateLocationFilter(alertData);

// ---- Initial Render ----
renderTable(filteredData);