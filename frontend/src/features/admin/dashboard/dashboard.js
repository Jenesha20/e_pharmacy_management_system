// function loadComponent(id, filePath) {
//   fetch(filePath)
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById(id).innerHTML = data;

//       // run after sidebar is loaded
//       highlightActiveLink();
//     })
//     .catch(err => console.error("Error loading component:", err));
// }

// function highlightActiveLink() {
//   const currentPath = window.location.pathname; // full absolute path
//   const links = document.querySelectorAll("#sidebar a");

//   links.forEach(link => {
//     const href = link.getAttribute("href");

//     // Use endsWith() so relative paths also work
//     if (currentPath.endsWith(href.replace("../", ""))) {
//       link.classList.add("bg-blue-600", "text-white");
//     } else {
//       link.classList.remove("bg-blue-600", "text-white");
//     }
//   });
// }


// // Initialize sidebar
// loadComponent("sidebar", "../../../core/components/sidebar.html");

// document.addEventListener("DOMContentLoaded", () => {
//   updateCounts();
// });

// function updateCounts() {
//   // Customers count
//   fetch("../customer/customer.html")
//     .then(res => res.text())
//     .then(html => {
//       const doc = new DOMParser().parseFromString(html, "text/html");
//       const rows = doc.querySelectorAll("#customerTable tr"); // adjust ID
//       document.querySelector("#customerCount").textContent = rows.length;
//     });

//   // Orders count
//   fetch("../orders/orders.html")
//     .then(res => res.text())
//     .then(html => {
//       const doc = new DOMParser().parseFromString(html, "text/html");
//       const rows = doc.querySelectorAll("#ordersTable tbody tr"); // adjust ID
//       document.querySelector("#orderCount").textContent = rows.length;
//     });

//   // Sales total
//   fetch("../reports/reports.html")
//     .then(res => res.text())
//     .then(html => {
//       const doc = new DOMParser().parseFromString(html, "text/html");
//       let total = 0;
//       doc.querySelectorAll("#salesTable tbody tr").forEach(row => {
//         const val = row.querySelector("td:nth-child(3)").textContent; // adjust column
//         total += parseFloat(val.replace("$", "")) || 0;
//       });
//       document.querySelector("#salesCount").textContent = "$" + total;
//     });

//   // Out of Stock
//   fetch("../inventory/inventory.html")
//     .then(res => res.text())
//     .then(html => {
//       const doc = new DOMParser().parseFromString(html, "text/html");
//       const rows = doc.querySelectorAll("#inventoryTable tbody tr");
//       let shortage = 0;
//       rows.forEach(row => {
//         const qty = parseInt(row.querySelector("td:nth-child(4)").textContent) || 0;
//         if (qty === 0) shortage++;
//       });
//       document.querySelector("#stockCount").textContent = shortage;
//     });
// }


// // Render CanvasJS Chart
// const reportData = {
//   "Cold": {
//     stock: [
//       { y: 120, label: "Paracetamol", color: "#ef4444" },
//       { y: 90, label: "Cough Syrup", color: "#facc15" },
//       { y: 60, label: "Vitamin C", color: "#22c55e" }
//     ],
//     sales: [
//       { x: new Date("2025-09-10"), y: 45 },
//       { x: new Date("2025-09-11"), y: 60 },
//       { x: new Date("2025-09-12"), y: 35 }
//     ]
//   },
//   "ENT": {
//     stock: [
//       { y: 80, label: "Nasal Spray", color: "#3b82f6" },
//       { y: 40, label: "Ear Drops", color: "#f59e0b" }
//     ],
//     sales: [
//       { x: new Date("2025-09-10"), y: 25 },
//       { x: new Date("2025-09-11"), y: 40 },
//       { x: new Date("2025-09-12"), y: 55 }
//     ]
//   },
//   "Pain relief": {
//     stock: [
//       { y: 100, label: "Ibuprofen", color: "#a855f7" },
//       { y: 70, label: "Pain Balm", color: "#f97316" }
//     ],
//     sales: [
//       { x: new Date("2025-09-10"), y: 50 },
//       { x: new Date("2025-09-11"), y: 72 },
//       { x: new Date("2025-09-12"), y: 65 }
//     ]
//   },
//   "All": {
//     stock: [
//       { y: 120, label: "Paracetamol", color: "#ef4444" },
//       { y: 90, label: "Cough Syrup", color: "#facc15" },
//       { y: 60, label: "Vitamin C", color: "#22c55e" },
//       { y: 80, label: "Nasal Spray", color: "#3b82f6" },
//       { y: 40, label: "Ear Drops", color: "#f59e0b" },
//       { y: 100, label: "Ibuprofen", color: "#a855f7" },
//       { y: 70, label: "Pain Balm", color: "#f97316" }
//     ],
//     sales: [
//       { x: new Date("2025-09-10"), y: 71 },
//       { x: new Date("2025-09-11"), y: 55 },
//       { x: new Date("2025-09-12"), y: 50 }
//     ]
//   }
// };

// let stockChart, salesChart;
// function renderSalesChart(category = "All", start = null, end = null) {
//   const data = reportData[category];

//   // filter sales data by time range
//   let filteredSales = data.sales;
//   if (start && end) {
//     filteredSales = data.sales.filter(d => d.x >= start && d.x <= end);
//   }

//   // Sales Report (column with date)
//   const salesChart = new CanvasJS.Chart("chartContainer", {
//     animationEnabled: true,
//     exportEnabled: true,
//     theme: "light1",
//     axisX: { valueFormatString: "DD MMM" },
//     axisY: { includeZero: true },
//     data: [{
//       type: "column",
//       indexLabelFontSize: 12,
//       dataPoints: filteredSales
//     }]
//   });
//   salesChart.render();
// }

// // Run chart on page load
// window.addEventListener("DOMContentLoaded", () => {
//   renderSalesChart("All");
// });



// ... your existing loadComponent and highlightActiveLink functions remain the same ...


// API configuration
const API_BASE = 'http://localhost:3000';
//let useMockData = false;

// Mock data for demonstration
// const mockData = {
//   customers: Array(45).fill().map((_, i) => ({ id: i+1 })),
//   orders: Array(128).fill().map((_, i) => ({ 
//     id: i+1, 
//     total_amount: Math.floor(Math.random() * 500) + 50,
//     status: ['pending', 'completed', 'shipped', 'cancelled'][Math.floor(Math.random() * 4)],
//     order_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString()
//   })),
//   inventory: Array(78).fill().map((_, i) => ({ 
//     id: i+1, 
//     quantity_in_stock: Math.floor(Math.random() * 100)
//   })),
//   prescriptions: Array(12).fill().map((_, i) => ({ 
//     id: i+1, 
//     status: Math.random() > 0.5 ? 'pending' : 'approved'
//   })),
//   notifications: Array(8).fill().map((_, i) => ({ 
//     id: i+1, 
//     is_read: Math.random() > 0.7
//   })),
//   products: Array(25).fill().map((_, i) => ({
//     id: i+1,
//     name: ['Paracetamol', 'Cough Syrup', 'Vitamin C', 'Nasal Spray', 'Ibuprofen', 'Pain Balm'][i % 6]
//   })),
//   order_items: Array(200).fill().map((_, i) => ({
//     id: i+1,
//     product_id: Math.floor(Math.random() * 25) + 1,
//     quantity: Math.floor(Math.random() * 5) + 1,
//     order_id: Math.floor(Math.random() * 128) + 1
//   }))
// };

// Load sidebar component dynamically
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

// Highlight active link in sidebar
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

// Fetch data from server or use mock data
async function fetchData(endpoint) {
  // if (useMockData) {
  //   return mockData[endpoint];
  // }
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    if (!useMockData) {
      useMockData = true;
      document.getElementById('serverError').classList.remove('hidden');
      return mockData[endpoint];
    }
    throw error;
  }
}

// Update all dashboard metrics
async function updateCounts() {
  try {
    const [customers, orders, inventory, prescriptions, notifications, products, orderItems] = await Promise.all([
      fetchData('customers'),
      fetchData('orders'),
      fetchData('inventory'),
      fetchData('prescriptions'),
      fetchData('notifications'),
      fetchData('products'),
      fetchData('order_items')
    ]);

    document.getElementById('customerCount').textContent = customers.length;
    document.getElementById('orderCount').textContent = orders.length;

    const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    document.getElementById('salesCount').textContent = `Rs ${totalSales.toFixed(2)}`;

    const outOfStockCount = inventory.filter(item => item.quantity_in_stock === 0).length;
    document.getElementById('stockCount').textContent = outOfStockCount;

    // const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
    // document.getElementById('prescriptionCount').textContent = pendingPrescriptions;

    // const unreadNotifications = notifications.filter(n => !n.is_read).length;
    // document.getElementById('notificationCount').textContent = unreadNotifications;

    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();

    renderCharts(orders, products, orderItems);
  } catch (error) {
    console.error("Error updating dashboard counts:", error);
  }
}

// Render all charts
function renderCharts(orders, products, orderItems) {
  renderSalesChart(orders);
  renderStatusChart(orders);
  renderProductsChart(orderItems, products);
}

// Render sales chart
function renderSalesChart(orders) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  const salesData = last7Days.map(day => {
    const sales = orders.filter(order => {
      const orderDate = new Date(order.order_date || new Date());
      return orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === day;
    }).reduce((sum, order) => sum + (order.total_amount || 0), 0);
    return { label: day, y: sales };
  });
  const chart = new CanvasJS.Chart("salesChartContainer", {
    animationEnabled: true,
    theme: "light2",
    axisX: { title: "Date", valueFormatString: "DD MMM" },
    axisY: { title: "Sales (Rs)", includeZero: true },
    data: [{ type: "column", indexLabel: "{y}", indexLabelPlacement: "outside", dataPoints: salesData }]
  });
  chart.render();
}

// Render order status chart
function renderStatusChart(orders) {
  const statusCount = {};
  orders.forEach(order => {
    const status = order.status || 'unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });
  const statusData = Object.keys(statusCount).map(status => ({
    y: statusCount[status],
    label: status.charAt(0).toUpperCase() + status.slice(1)
  }));
  const chart = new CanvasJS.Chart("statusChartContainer", {
    animationEnabled: true,
    theme: "light2",
    data: [{ type: "pie", indexLabel: "{label} - {y}", dataPoints: statusData }]
  });
  chart.render();
}

// Render top products chart
function renderProductsChart(orderItems, products) {
  const productSales = {};
  orderItems.forEach(item => {
    const productId = item.product_id;
    productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id == productId || p.product_id == productId);
      return { y: quantity, label: product ? product.name : `Product ${productId}` };
    });
  const chart = new CanvasJS.Chart("productsChartContainer", {
    animationEnabled: true,
    theme: "light2",
    axisX: { 
      title: "Products",
      interval: 1,
      intervalType: "number"
    },
    axisY: { 
      title: "Quantity Sold",
      interval: 1,
      intervalType: "number"
    },
    data: [{ type: "bar", indexLabel: "{y}", indexLabelPlacement: "outside", dataPoints: topProducts }]
  });
  chart.render();
}

// function downloadCSV(data, filename) {
//   const csvRows = [];
//   const headers = Object.keys(data[0]);
//   csvRows.push(headers.join(','));
//   for (const row of data) {
//     csvRows.push(headers.map(field => row[field]).join(','));
//   }
//   const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = filename;
//   a.click();
//   window.URL.revokeObjectURL(url);
// }

// function downloadJSON(data, filename) {
//   const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = filename;
//   a.click();
//   window.URL.revokeObjectURL(url);
// }

// function printData(data) {
//   const newWin = window.open("");
//   newWin.document.write("<h3>7-Day Sales Data</h3>");
//   newWin.document.write("<table border='1' style='border-collapse:collapse'><tr><th>Date</th><th>Sales</th></tr>");
//   data.forEach(row => {
//     newWin.document.write(`<tr><td>${row.date}</td><td>${row.sales}</td></tr>`);
//   });
//   newWin.document.write("</table>");
//   newWin.print();
//   newWin.close();
// }
// Mobile menu toggle
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
    overlay.classList.toggle('hidden');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.add('sidebar-hidden');
    overlay.classList.add('hidden');
  });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadComponent("sidebar", "../../../core/components/sidebar.html");
  updateCounts();
  setupMobileMenu();
  setInterval(updateCounts, 60000);
});
