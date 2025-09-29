
const API_BASE = 'http://localhost:3000';


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
