
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
    // Dummy database (replace with API later)
   // customer_detail.js
   document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
  
    // Fill customer info
    document.getElementById("custId").value = params.get("custId");
    document.getElementById("custName").value = params.get("custName");
    document.getElementById("custMail").value = params.get("custMail");
    document.getElementById("custAge").value = params.get("custAge");
    document.getElementById("custDob").value = params.get("custDob");
    document.getElementById("custAddress").value = params.get("custAddress");
  
    // Dummy orders for testing
    const orders = [
      { orderId: "O-1001", customerId: "D06ID232435454", category: "Medicine", name: "Paracetamol", qty: 2, price: "₹40" },
      { orderId: "O-1002", customerId: "D06ID232435454", category: "Health", name: "Vitamin C", qty: 1, price: "₹120" },
      { orderId: "O-2001", customerId: "SomeOtherId", category: "Wellness", name: "Protein Powder", qty: 1, price: "₹500" }
    ];
  
    const tableBody = document.getElementById("ordersTable");
    tableBody.innerHTML = "";
  
    const custId = params.get("custId");
    orders
      .filter(order => order.customerId == custId)
      .forEach(order => {
        const row = `
          <tr>
            <td class="border px-4 py-2">${order.orderId}</td>
            <td class="border px-4 py-2">${order.customerId}</td>
            <td class="border px-4 py-2">${order.category}</td>
            <td class="border px-4 py-2">${order.name}</td>
            <td class="border px-4 py-2">${order.qty}</td>
            <td class="border px-4 py-2">${order.price}</td>
          </tr>`;
        tableBody.insertAdjacentHTML("beforeend", row);
      });
  
    // If no orders found, show message
    if (tableBody.innerHTML === "") {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No orders found</td></tr>`;
    }
  });
  