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
  
 // Mock Orders Data
let orders = [
    { orderId: 101, customerId: "C001", name: "Paracetamol", quantity: 2, price: 50, status: "Inprogress", orderDate: "2025-09-01" },
    { orderId: 102, customerId: "C002", name: "Amoxicillin", quantity: 1, price: 120, status: "Packed", orderDate: "2025-09-05" },
    { orderId: 103, customerId: "C003", name: "Cough Syrup", quantity: 3, price: 90, status: "Delivered", orderDate: "2025-09-07" },
    { orderId: 104, customerId: "C004", name: "Vitamin C", quantity: 5, price: 200, status: "Inprogress", orderDate: "2025-09-09" },
    { orderId: 105, customerId: "C005", name: "Ibuprofen", quantity: 2, price: 75, status: "Packed", orderDate: "2025-09-10" },
    { orderId: 106, customerId: "C006", name: "Antacid", quantity: 4, price: 60, status: "Delivered", orderDate: "2025-09-11" },
    { orderId: 107, customerId: "C007", name: "Insulin", quantity: 1, price: 500, status: "Inprogress", orderDate: "2025-09-12" },
    { orderId: 108, customerId: "C008", name: "Aspirin", quantity: 2, price: 110, status: "Delivered", orderDate: "2025-09-12" }
  ];
  
  let currentPage = 1;
  const rowsPerPage = 5;
  let filteredOrders = [...orders]; // filtered by date (initially all)
  let tableOrders = [...filteredOrders]; // what will be displayed in the table
  
  
  // Render Table
  function renderTable() {
    let tbody = document.getElementById("ordersTable");
    tbody.innerHTML = "";
  
    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedOrders = tableOrders.slice(start, end);
  
    paginatedOrders.forEach(order => {
      let row = `
        <tr class="text-center border">
          <td class="p-3 border">${order.orderId}</td>
          <td class="p-3 border">${order.customerId}</td>
          <td class="p-3 border">${order.name}</td>
          <td class="p-3 border">${order.quantity}</td>
          <td class="p-3 border">₹${order.price}</td>
          <td class="p-3 border">${order.orderDate}</td>
          <td class="p-3 border">
            <select class="border rounded-md px-2 py-1 focus:ring focus:ring-green-300"
              onchange="updateStatus(${order.orderId}, this.value)">
              <option ${order.status === "Inprogress" ? "selected" : ""}>Inprogress</option>
              <option ${order.status === "Packed" ? "selected" : ""}>Packed</option>
              <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
            </select>
          </td>
        </tr>`;
      tbody.innerHTML += row;
    });
  
    document.getElementById("pageInfo").innerText =
      `Page ${currentPage} of ${Math.ceil(tableOrders.length / rowsPerPage)}`;
  
    updateCards();
  }
  
  // Update Cards
  function updateCards() {
    const all = filteredOrders.length;
    const inprogress = filteredOrders.filter(o => o.status === "Inprogress").length;
    const packed = filteredOrders.filter(o => o.status === "Packed").length;
    const delivered = filteredOrders.filter(o => o.status === "Delivered").length;
  
    document.getElementById("allOrdersCount").innerText = all;
    document.getElementById("inprogressCount").innerText = inprogress;
    document.getElementById("packedCount").innerText = packed;
    document.getElementById("deliveredCount").innerText = delivered;
  }
  
  
  // Update Status
  function updateStatus(orderId, newStatus) {
    let order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = newStatus;
      showToast(`✅ Order #${orderId} updated to ${newStatus}`);
      renderTable();
    }
  }
  function filterByStatus(status) {
    if (status === "All") {
      filteredOrders = [...orders];
    } else {
      filteredOrders = orders.filter(o => o.status === status);
    }
    currentPage = 1;
    renderTable();
  }

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("data-status");
      if (status === "All") {
        tableOrders = [...filteredOrders]; // table shows all filtered by date
      } else {
        tableOrders = filteredOrders.filter(o => o.status === status);
      }
      currentPage = 1;
      renderTable();
    });
  });
  
  
  
  // Toast
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
  
  // Pagination
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  
  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < Math.ceil(filteredOrders.length / rowsPerPage)) {
      currentPage++;
      renderTable();
    }
  });
  
  // Date Filter
  function filterByDate() {
    let start = document.getElementById("startDate").value;
    let end = document.getElementById("endDate").value;
  
    if (start && end) {
      filteredOrders = orders.filter(o => o.orderDate >= start && o.orderDate <= end);
    } else {
      filteredOrders = [...orders]; // reset if no range
    }
  
    tableOrders = [...filteredOrders]; // table initially shows all filteredOrders
    currentPage = 1;
    renderTable();
  }
  
  
  document.getElementById("startDate").addEventListener("change", filterByDate);
  document.getElementById("endDate").addEventListener("change", filterByDate);
  
  // Refresh
  document.getElementById("refreshBtn").addEventListener("click", () => {
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    filteredOrders = [...orders];
    tableOrders = [...filteredOrders]; // reset tableOrders too
    currentPage = 1;
    renderTable();
  });
  
  
  // Initial render
  renderTable();
  