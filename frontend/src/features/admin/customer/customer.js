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
  const inventoryData = [
    { 
        name: "Jenesha", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Lokitha", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Jane", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Malavvika", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Amritha", 
        id: "D06ID232435454", 
        city: "Salem", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Karunya", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Hari", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
      { 
        name: "Nandhini", 
        id: "D06ID232435454", 
        city: "Erode", 
        age: 35,
        mail: "aug@example.com",
        dob: "1989-03-12",
        address: "123 Main Street, Erode"
      },
  ];

  // ---- Pagination ----
  let currentPage = 1;
  const rowsPerPage = 10;
  let filteredData = [...inventoryData];

  // ---- Table Rendering ----
  function renderTable(data) {
    const table = document.getElementById("customerTable");
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
            <td class="p-3">${item.city}</td>
            <td class="p-3">${item.age}</td>
            <td class="p-3 text-blue-600 cursor-pointer hover:underline">
            <a href="customer_detail.html?
            &custId=${item.id}
            &custName=${encodeURIComponent(item.name)}
            &custMail=${encodeURIComponent(item.mail)}
            &custAge=${item.age}
            &custDob=${item.dob}
            &custAddress=${encodeURIComponent(item.address)}
            &city=${encodeURIComponent(item.city)}">
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
      filteredData = [...inventoryData];
    } else {
      filteredData = inventoryData.filter(item => item.city === value);
    }
  
    renderTable(filteredData);
  });
  
  // Reset button
  document.getElementById("resetBtn").addEventListener("click", () => {
    document.getElementById("categoryFilter").value = "";
    filteredData = [...inventoryData];
    currentPage = 1;
    renderTable(filteredData);
  });
  
  // Call once on page load
  populateLocationFilter(inventoryData);
  
  // ---- Initial Render ----
  renderTable(filteredData);