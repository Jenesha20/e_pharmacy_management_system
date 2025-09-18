function loadComponent(id, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;

      // run after sidebar is loaded
      highlightActiveLink();
    })
    .catch(err => console.error("Error loading component:", err));
}

function highlightActiveLink() {
  const currentPath = window.location.pathname; // full absolute path
  const links = document.querySelectorAll("#sidebar a");

  links.forEach(link => {
    const href = link.getAttribute("href");

    // Use endsWith() so relative paths also work
    if (currentPath.endsWith(href.replace("../", ""))) {
      link.classList.add("bg-blue-600", "text-white");
    } else {
      link.classList.remove("bg-blue-600", "text-white");
    }
  });
}


// Initialize sidebar
loadComponent("sidebar", "../../../core/components/sidebar.html");

document.addEventListener("DOMContentLoaded", () => {
  updateCounts();
});

function updateCounts() {
  // Customers count
  fetch("../customer/customer.html")
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const rows = doc.querySelectorAll("#customerTable tr"); // adjust ID
      document.querySelector("#customerCount").textContent = rows.length;
    });

  // Orders count
  fetch("../orders/orders.html")
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const rows = doc.querySelectorAll("#ordersTable tbody tr"); // adjust ID
      document.querySelector("#orderCount").textContent = rows.length;
    });

  // Sales total
  fetch("../reports/reports.html")
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      let total = 0;
      doc.querySelectorAll("#salesTable tbody tr").forEach(row => {
        const val = row.querySelector("td:nth-child(3)").textContent; // adjust column
        total += parseFloat(val.replace("$", "")) || 0;
      });
      document.querySelector("#salesCount").textContent = "$" + total;
    });

  // Out of Stock
  fetch("../inventory/inventory.html")
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const rows = doc.querySelectorAll("#inventoryTable tbody tr");
      let shortage = 0;
      rows.forEach(row => {
        const qty = parseInt(row.querySelector("td:nth-child(4)").textContent) || 0;
        if (qty === 0) shortage++;
      });
      document.querySelector("#stockCount").textContent = shortage;
    });
}


// Render CanvasJS Chart
const reportData = {
  "Cold": {
    stock: [
      { y: 120, label: "Paracetamol", color: "#ef4444" },
      { y: 90, label: "Cough Syrup", color: "#facc15" },
      { y: 60, label: "Vitamin C", color: "#22c55e" }
    ],
    sales: [
      { x: new Date("2025-09-10"), y: 45 },
      { x: new Date("2025-09-11"), y: 60 },
      { x: new Date("2025-09-12"), y: 35 }
    ]
  },
  "ENT": {
    stock: [
      { y: 80, label: "Nasal Spray", color: "#3b82f6" },
      { y: 40, label: "Ear Drops", color: "#f59e0b" }
    ],
    sales: [
      { x: new Date("2025-09-10"), y: 25 },
      { x: new Date("2025-09-11"), y: 40 },
      { x: new Date("2025-09-12"), y: 55 }
    ]
  },
  "Pain relief": {
    stock: [
      { y: 100, label: "Ibuprofen", color: "#a855f7" },
      { y: 70, label: "Pain Balm", color: "#f97316" }
    ],
    sales: [
      { x: new Date("2025-09-10"), y: 50 },
      { x: new Date("2025-09-11"), y: 72 },
      { x: new Date("2025-09-12"), y: 65 }
    ]
  },
  "All": {
    stock: [
      { y: 120, label: "Paracetamol", color: "#ef4444" },
      { y: 90, label: "Cough Syrup", color: "#facc15" },
      { y: 60, label: "Vitamin C", color: "#22c55e" },
      { y: 80, label: "Nasal Spray", color: "#3b82f6" },
      { y: 40, label: "Ear Drops", color: "#f59e0b" },
      { y: 100, label: "Ibuprofen", color: "#a855f7" },
      { y: 70, label: "Pain Balm", color: "#f97316" }
    ],
    sales: [
      { x: new Date("2025-09-10"), y: 71 },
      { x: new Date("2025-09-11"), y: 55 },
      { x: new Date("2025-09-12"), y: 50 }
    ]
  }
};

let stockChart, salesChart;
function renderSalesChart(category = "All", start = null, end = null) {
  const data = reportData[category];

  // filter sales data by time range
  let filteredSales = data.sales;
  if (start && end) {
    filteredSales = data.sales.filter(d => d.x >= start && d.x <= end);
  }

  // Sales Report (column with date)
  const salesChart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light1",
    axisX: { valueFormatString: "DD MMM" },
    axisY: { includeZero: true },
    data: [{
      type: "column",
      indexLabelFontSize: 12,
      dataPoints: filteredSales
    }]
  });
  salesChart.render();
}

// Run chart on page load
window.addEventListener("DOMContentLoaded", () => {
  renderSalesChart("All");
});



