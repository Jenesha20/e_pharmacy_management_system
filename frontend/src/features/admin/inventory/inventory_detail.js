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

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
  
    // Fill customer info
    document.getElementById("medId").value = params.get("medId");
    document.getElementById("medName").value = params.get("medName");
    document.getElementById("medCat").value = params.get("medCat");
    document.getElementById("medStock").value = params.get("medStock");
    document.getElementById("medExpiry").value = params.get("medExpiry");
    document.getElementById("medEffect").value = params.get("medEffect");
    document.getElementById("medUse").value = params.get("medUse");
  
    // Dummy orders for testing
    const orders = [
      { medId: "D06ID232435454", medName: "Augmentin 625 Du.", medCat: "Generic Medicine", medStock: 2, medExpiry: "₹40",medEffect:"Side effects",medUse:"How to use" },
      { orderId: "O-1002", customerId: "D06ID232435454", category: "Health", name: "Vitamin C", qty: 1, price: "₹120" },
      { orderId: "O-2001", customerId: "SomeOtherId", category: "Wellness", name: "Protein Powder", qty: 1, price: "₹500" }
    ];
  
    const tableBody = document.getElementById("ordersTable");
    tableBody.innerHTML = "";
  
    const custId = params.get("medId");
    orders
      .filter(order => order.customerId == custId)
      .forEach(order => {
        const row = `
          <tr>
            <td class="border px-4 py-2">${order.medId}</td>
            <td class="border px-4 py-2">${order.medName}</td>
            <td class="border px-4 py-2">${order.medCat}</td>
            <td class="border px-4 py-2">${order.medStock}</td>
            <td class="border px-4 py-2">${order.medExpiry}</td>
            <td class="border px-4 py-2">${order.medEffect}</td>
            <td class="border px-4 py-2">${order.medUse}</td>
          </tr>`;
        tableBody.insertAdjacentHTML("beforeend", row);
      });
  
    // If no orders found, show message
    if (tableBody.innerHTML === "") {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No orders found</td></tr>`;
    }
  });