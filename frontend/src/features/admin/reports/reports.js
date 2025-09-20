// function loadComponent(id, filePath) {
//     fetch(filePath)
//       .then(response => response.text())
//       .then(data => {
//         document.getElementById(id).innerHTML = data;
//         highlightActiveLink();
//       })
//       .catch(err => console.error("Error loading component:", err));
//   }

//   function highlightActiveLink() {
//     const currentPath = window.location.pathname;
//     const links = document.querySelectorAll("#sidebar a");

//     links.forEach(link => {
//       const href = link.getAttribute("href");
//       if (currentPath.endsWith(href.replace("../", ""))) {
//         link.classList.add("bg-blue-600", "text-white");
//       } else {
//         link.classList.remove("bg-blue-600", "text-white");
//       }
//     });
//   }

//   loadComponent("sidebar", "../../../core/components/sidebar.html");

  

//    // Sample stock & sales data with dates
//    const reportData = {
//     "Cold": {
//       stock: [
//         { y: 120, label: "Paracetamol", color: "#ef4444" },
//         { y: 90, label: "Cough Syrup", color: "#facc15" },
//         { y: 60, label: "Vitamin C", color: "#22c55e" }
//       ],
//       sales: [
//         { x: new Date("2025-09-10"), y: 45 },
//         { x: new Date("2025-09-11"), y: 60 },
//         { x: new Date("2025-09-12"), y: 35 }
//       ]
//     },
//     "ENT": {
//       stock: [
//         { y: 80, label: "Nasal Spray", color: "#3b82f6" },
//         { y: 40, label: "Ear Drops", color: "#f59e0b" }
//       ],
//       sales: [
//         { x: new Date("2025-09-10"), y: 25 },
//         { x: new Date("2025-09-11"), y: 40 },
//         { x: new Date("2025-09-12"), y: 55 }
//       ]
//     },
//     "Pain relief": {
//       stock: [
//         { y: 100, label: "Ibuprofen", color: "#a855f7" },
//         { y: 70, label: "Pain Balm", color: "#f97316" }
//       ],
//       sales: [
//         { x: new Date("2025-09-10"), y: 50 },
//         { x: new Date("2025-09-11"), y: 72 },
//         { x: new Date("2025-09-12"), y: 65 }
//       ]
//     },
//     "All": {
//       stock: [
//         { y: 120, label: "Paracetamol", color: "#ef4444" },
//         { y: 90, label: "Cough Syrup", color: "#facc15" },
//         { y: 60, label: "Vitamin C", color: "#22c55e" },
//         { y: 80, label: "Nasal Spray", color: "#3b82f6" },
//         { y: 40, label: "Ear Drops", color: "#f59e0b" },
//         { y: 100, label: "Ibuprofen", color: "#a855f7" },
//         { y: 70, label: "Pain Balm", color: "#f97316" }
//       ],
//       sales: [
//         { x: new Date("2025-09-10"), y: 71 },
//         { x: new Date("2025-09-11"), y: 55 },
//         { x: new Date("2025-09-12"), y: 50 }
//       ]
//     }
//   };

//   let stockChart, salesChart;

//   function renderCharts(category = "All", start = null, end = null) {
//     const data = reportData[category];

//     // filter sales data by time range
//     let filteredSales = data.sales;
//     if (start && end) {
//       filteredSales = data.sales.filter(d => d.x >= start && d.x <= end);
//     }

//     // Stock Report (doughnut)
//     stockChart = new CanvasJS.Chart("reportChart", {
//       animationEnabled: true,
//       exportEnabled: true, // download options
//       data: [{
//         type: "doughnut",
//         innerRadius: 60,
//         dataPoints: data.stock
//       }]
//     });
//     stockChart.render();

//     // Sales Report (column with date)
//     salesChart = new CanvasJS.Chart("chartContainer", {
//       animationEnabled: true,
//       exportEnabled: true,
//       theme: "light1",
//       axisX: { valueFormatString: "DD MMM" },
//       axisY: { includeZero: true },
//       data: [{
//         type: "column",
//         indexLabelFontSize: 12,
//         dataPoints: filteredSales
//       }]
//     });
//     salesChart.render();
//   }

//   window.onload = function () {
//     renderCharts("All");

//     document.getElementById("filterBtn").addEventListener("click", function () {
//       const category = document.getElementById("categoryFilter").value || "All";
//       const startDate = document.getElementById("startDate").value ? new Date(document.getElementById("startDate").value) : null;
//       const endDate = document.getElementById("endDate").value ? new Date(document.getElementById("endDate").value) : null;
//       renderCharts(category, startDate, endDate);
//     });

//     document.getElementById("resetBtn").addEventListener("click", function () {
//       document.getElementById("categoryFilter").value = "";
//       document.getElementById("startDate").value = "";
//       document.getElementById("endDate").value = "";
//       renderCharts("All");
//     });

//     document.getElementById("printBtn").addEventListener("click", function () {
//       window.print();
//     });
//   }

let customers = [];
let customerAddresses = [];
let categories = [];
let products = [];
let inventory = [];
let prescriptions = [];
let orders = [];
let orderItems = [];
let notifications = [];

// Chart instances
let mainChart, secondaryChart;

// Function to load component
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

// Fetch data from JSON server
async function fetchData() {
  try {
    const endpoints = [
      'http://localhost:3000/customers',
      'http://localhost:3000/customer_addresses',
      'http://localhost:3000/categories',
      'http://localhost:3000/products',
      'http://localhost:3000/inventory',
      'http://localhost:3000/prescriptions',
      'http://localhost:3000/orders',
      'http://localhost:3000/order_items',
      'http://localhost:3000/notifications'
    ];
    
    const responses = await Promise.all(endpoints.map(url => fetch(url)));
    const data = await Promise.all(responses.map(res => res.json()));
    
    // Assign data to variables
    customers = data[0];
    customerAddresses = data[1];
    categories = data[2];
    products = data[3];
    inventory = data[4];
    prescriptions = data[5];
    orders = data[6];
    orderItems = data[7];
    notifications = data[8];
    
    // Populate category filter
    populateCategoryFilter();
    
    // Generate initial reports
    generateReports();
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Populate category filter dropdown
function populateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.category_id;
    option.textContent = category.name;
    categoryFilter.appendChild(option);
  });
}

// Generate reports based on selected type and filters
function generateReports() {
  const reportType = document.getElementById('reportType').value;
  const categoryId = document.getElementById('categoryFilter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  // Filter data based on date range
  let filteredOrders = orders;
  if (startDate && endDate) {
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
  }
  
  // Generate report based on type
  switch(reportType) {
    case 'sales':
      generateSalesReport(filteredOrders, categoryId);
      break;
    case 'customer':
      generateCustomerReport(filteredOrders);
      break;
    case 'product':
      generateProductReport(filteredOrders, categoryId);
      break;
    case 'stock':
      generateStockReport(categoryId);
      break;
    case 'prescription':
      generatePrescriptionReport();
      break;
  }
}

// Generate Sales Report
function generateSalesReport(orders, categoryId) {
  // Calculate total sales
  const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Calculate number of orders
  const numberOfOrders = orders.length;
  
  // Calculate average order value
  const averageOrderValue = numberOfOrders > 0 ? totalSales / numberOfOrders : 0;
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Sales', value: `$${totalSales.toFixed(2)}`, change: '+12%' },
    { title: 'Number of Orders', value: numberOfOrders, change: '+5%' },
    { title: 'Average Order Value', value: `$${averageOrderValue.toFixed(2)}`, change: '+3%' },
    { title: 'Top Selling Category', value: 'Pain Relief', change: '+8%' }
  ]);
  
  // Prepare sales data for chart (group by date)
  const salesByDate = {};
  orders.forEach(order => {
    const date = order.order_date.split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = 0;
    }
    salesByDate[date] += order.total_amount;
  });
  
  const salesDataPoints = Object.keys(salesByDate).map(date => ({
    x: new Date(date),
    y: salesByDate[date]
  })).sort((a, b) => a.x - b.x);
  
  // Render main chart (sales over time)
  renderMainChart(salesDataPoints, 'Sales Over Time', 'Date', 'Amount ($)', 'line');
  
  // Prepare category sales data for secondary chart
  const categorySales = {};
  orders.forEach(order => {
    // Get order items for this order
    const items = orderItems.filter(item => item.order_id == order.id);
    items.forEach(item => {
      const product = products.find(p => p.id == item.product_id);
      if (product) {
        const category = categories.find(c => c.category_id == product.category_id);
        if (category) {
          if (!categorySales[category.name]) {
            categorySales[category.name] = 0;
          }
          categorySales[category.name] += item.subtotal;
        }
      }
    });
  });
  
  const categoryDataPoints = Object.keys(categorySales).map(category => ({
    y: categorySales[category],
    label: category
  }));
  
  // Render secondary chart (sales by category)
  renderSecondaryChart(categoryDataPoints, 'Sales by Category', 'Category', 'Amount ($)', 'pie');
  
  // Update data table
  updateDataTable([
    { id: 'S001', name: 'Total Revenue', value: `$${totalSales.toFixed(2)}`, change: '+12%' },
    { id: 'S002', name: 'Completed Orders', value: orders.filter(o => o.status === 'delivered').length, change: '+8%' },
    { id: 'S003', name: 'Processing Orders', value: orders.filter(o => o.status === 'processing').length, change: '-2%' },
    { id: 'S004', name: 'Credit Card Payments', value: orders.filter(o => o.payment_method === 'credit_card').length, change: '+5%' }
  ]);
}

// Generate Customer Report
function generateCustomerReport(orders) {
  // Calculate new vs returning customers
  const customerOrderCount = {};
  orders.forEach(order => {
    if (!customerOrderCount[order.customer_id]) {
      customerOrderCount[order.customer_id] = 0;
    }
    customerOrderCount[order.customer_id]++;
  });
  
  const newCustomers = Object.values(customerOrderCount).filter(count => count === 1).length;
  const returningCustomers = Object.values(customerOrderCount).filter(count => count > 1).length;
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Customers', value: customers.length, change: '+8%' },
    { title: 'New Customers', value: newCustomers, change: '+12%' },
    { title: 'Returning Customers', value: returningCustomers, change: '+5%' },
    { title: 'Avg. Orders per Customer', value: (orders.length / Object.keys(customerOrderCount).length).toFixed(1), change: '+3%' }
  ]);
  
  // Prepare customer data for chart (customers over time)
  const customersByDate = {};
  customers.forEach(customer => {
    const date = customer.created_at.split('T')[0];
    if (!customersByDate[date]) {
      customersByDate[date] = 0;
    }
    customersByDate[date]++;
  });
  
  const customerDataPoints = Object.keys(customersByDate).map(date => ({
    x: new Date(date),
    y: customersByDate[date]
  })).sort((a, b) => a.x - b.x);
  
  // Render main chart (customers over time)
  renderMainChart(customerDataPoints, 'Customer Acquisition', 'Date', 'New Customers', 'column');
  
  // Prepare customer type data for secondary chart
  const customerTypeDataPoints = [
    { y: newCustomers, label: 'New Customers' },
    { y: returningCustomers, label: 'Returning Customers' }
  ];
  
  // Render secondary chart (customer types)
  renderSecondaryChart(customerTypeDataPoints, 'Customer Types', 'Type', 'Count', 'pie');
  
  // Update data table
  updateDataTable([
    { id: 'C001', name: 'Verified Customers', value: customers.filter(c => c.is_verified).length, change: '+10%' },
    { id: 'C002', name: 'Customers with Address', value: customerAddresses.length, change: '+8%' },
    { id: 'C003', name: 'Female Customers', value: customers.filter(c => c.gender === 'female').length, change: '+5%' },
    { id: 'C004', name: 'Male Customers', value: customers.filter(c => c.gender === 'male').length, change: '+3%' }
  ]);
}

// Generate Product Performance Report
function generateProductReport(orders, categoryId) {
  // Calculate product sales
  const productSales = {};
  const productQuantities = {};
  
  orders.forEach(order => {
    // Get order items for this order
    const items = orderItems.filter(item => item.order_id == order.id);
    items.forEach(item => {
      const product = products.find(p => p.id == item.product_id);
      if (product && (!categoryId || product.category_id == categoryId)) {
        if (!productSales[product.name]) {
          productSales[product.name] = 0;
          productQuantities[product.name] = 0;
        }
        productSales[product.name] += item.subtotal;
        productQuantities[product.name] += item.quantity;
      }
    });
  });
  
  // Sort products by sales
  const sortedProducts = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a]);
  
  // Get top 5 products
  const topProducts = sortedProducts.slice(0, 5);
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Products', value: products.length, change: '+5%' },
    { title: 'Products Sold', value: Object.keys(productSales).length, change: '+8%' },
    { title: 'Total Units Sold', value: Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0), change: '+12%' },
    { title: 'Top Product', value: topProducts[0] || 'N/A', change: '+15%' }
  ]);
  
  // Prepare top products data for main chart
  const topProductsDataPoints = topProducts.map(product => ({
    y: productSales[product],
    label: product
  }));
  
  // Render main chart (top products by revenue)
  renderMainChart(topProductsDataPoints, 'Top Products by Revenue', 'Product', 'Revenue ($)', 'column');
  
  // Prepare product quantity data for secondary chart
  const productQuantityDataPoints = topProducts.map(product => ({
    y: productQuantities[product],
    label: product
  }));
  
  // Render secondary chart (top products by quantity)
  renderSecondaryChart(productQuantityDataPoints, 'Top Products by Quantity', 'Product', 'Quantity', 'column');
  
  // Update data table
  const tableData = topProducts.map((product, index) => ({
    id: `P${index + 1}`,
    name: product,
    value: `$${productSales[product].toFixed(2)}`,
    change: '+15%'
  }));
  
  updateDataTable(tableData);
}

// Generate Stock Report
function generateStockReport(categoryId) {
  // Filter products by category if specified
  let filteredProducts = products;
  if (categoryId) {
    filteredProducts = products.filter(product => product.category_id == categoryId);
  }
  
  // Calculate total stock value
  const totalStockValue = filteredProducts.reduce((sum, product) => {
    const inv = inventory.find(i => i.product_id == product.id);
    return sum + (product.price * (inv ? inv.quantity_in_stock : 0));
  }, 0);
  
  // Find low stock items
  const lowStockItems = filteredProducts.filter(product => {
    const inv = inventory.find(i => i.product_id == product.id);
    return inv && inv.quantity_in_stock <= inv.low_stock_threshold;
  });
  
  // Find out of stock items
  const outOfStockItems = filteredProducts.filter(product => {
    const inv = inventory.find(i => i.product_id == product.id);
    return inv && inv.quantity_in_stock === 0;
  });
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Stock Value', value: `$${totalStockValue.toFixed(2)}`, change: '+5%' },
    { title: 'Total Products', value: filteredProducts.length, change: '+3%' },
    { title: 'Low Stock Items', value: lowStockItems.length, change: '-8%' },
    { title: 'Out of Stock Items', value: outOfStockItems.length, change: '-12%' }
  ]);
  
  // Prepare stock value by category data for main chart
  const categoryStockValue = {};
  filteredProducts.forEach(product => {
    const category = categories.find(c => c.category_id == product.category_id);
    if (category) {
      const inv = inventory.find(i => i.product_id == product.id);
      const value = product.price * (inv ? inv.quantity_in_stock : 0);
      
      if (!categoryStockValue[category.name]) {
        categoryStockValue[category.name] = 0;
      }
      categoryStockValue[category.name] += value;
    }
  });
  
  const categoryStockDataPoints = Object.keys(categoryStockValue).map(category => ({
    y: categoryStockValue[category],
    label: category
  }));
  
  // Render main chart (stock value by category)
  renderMainChart(categoryStockDataPoints, 'Stock Value by Category', 'Category', 'Value ($)', 'pie');
  
  // Prepare low stock data for secondary chart
  const lowStockDataPoints = lowStockItems.map(product => {
    const inv = inventory.find(i => i.product_id == product.id);
    return {
      y: inv ? inv.quantity_in_stock : 0,
      label: product.name
    };
  });
  
  // Render secondary chart (low stock items)
  renderSecondaryChart(lowStockDataPoints, 'Low Stock Items', 'Product', 'Quantity', 'column');
  
  // Update data table
  const tableData = lowStockItems.slice(0, 5).map((product, index) => {
    const inv = inventory.find(i => i.product_id == product.id);
    return {
      id: `ST${index + 1}`,
      name: product.name,
      value: inv ? inv.quantity_in_stock : 0,
      change: '-15%'
    };
  });
  
  updateDataTable(tableData);
}

// Generate Prescription Report
function generatePrescriptionReport() {
  // Calculate prescription stats
  const totalPrescriptions = prescriptions.length;
  const approvedPrescriptions = prescriptions.filter(p => p.status === 'approved').length;
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
  const rejectedPrescriptions = totalPrescriptions - approvedPrescriptions - pendingPrescriptions;
  
  // Calculate approval ratio
  const approvalRatio = totalPrescriptions > 0 ? (approvedPrescriptions / totalPrescriptions) * 100 : 0;
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Prescriptions', value: totalPrescriptions, change: '+12%' },
    { title: 'Approved Prescriptions', value: approvedPrescriptions, change: '+8%' },
    { title: 'Pending Prescriptions', value: pendingPrescriptions, change: '+5%' },
    { title: 'Approval Ratio', value: `${approvalRatio.toFixed(1)}%`, change: '+3%' }
  ]);
  
  // Prepare prescription status data for main chart
  const prescriptionStatusDataPoints = [
    { y: approvedPrescriptions, label: 'Approved' },
    { y: pendingPrescriptions, label: 'Pending' },
    { y: rejectedPrescriptions, label: 'Rejected' }
  ];
  
  // Render main chart (prescription status)
  renderMainChart(prescriptionStatusDataPoints, 'Prescription Status', 'Status', 'Count', 'pie');
  
  // Prepare prescriptions over time data for secondary chart
  const prescriptionsByDate = {};
  prescriptions.forEach(prescription => {
    const date = prescription.created_at.split('T')[0];
    if (!prescriptionsByDate[date]) {
      prescriptionsByDate[date] = 0;
    }
    prescriptionsByDate[date]++;
  });
  
  const prescriptionsOverTimeDataPoints = Object.keys(prescriptionsByDate).map(date => ({
    x: new Date(date),
    y: prescriptionsByDate[date]
  })).sort((a, b) => a.x - b.x);
  
  // Render secondary chart (prescriptions over time)
  renderSecondaryChart(prescriptionsOverTimeDataPoints, 'Prescriptions Over Time', 'Date', 'Count', 'line');
  
  // Update data table
  updateDataTable([
    { id: 'PR001', name: 'Total Prescriptions', value: totalPrescriptions, change: '+12%' },
    { id: 'PR002', name: 'Approval Rate', value: `${approvalRatio.toFixed(1)}%`, change: '+3%' },
    { id: 'PR003', name: 'Avg. Verification Time', value: '2.5 hrs', change: '-5%' },
    { id: 'PR004', name: 'Prescriptions Today', value: prescriptions.filter(p => p.created_at.split('T')[0] === new Date().toISOString().split('T')[0]).length, change: '+8%' }
  ]);
}

// Update summary cards
function updateSummaryCards(cardData) {
  const summaryCardsContainer = document.getElementById('summaryCards');
  summaryCardsContainer.innerHTML = '';
  
  cardData.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = 'bg-white p-4 rounded-lg shadow';
    cardElement.innerHTML = `
      <h3 class="text-sm font-medium text-gray-500">${card.title}</h3>
      <div class="flex items-baseline justify-between mt-2">
        <p class="text-2xl font-semibold">${card.value}</p>
        <p class="text-sm ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${card.change}</p>
      </div>
    `;
    summaryCardsContainer.appendChild(cardElement);
  });
}

// Update data table
function updateDataTable(tableData) {
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = '';
  
  tableData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${row.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.value}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm ${row.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${row.change}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Render main chart
function renderMainChart(dataPoints, title, xTitle, yTitle, chartType) {
  document.getElementById('mainChartTitle').textContent = title;
  
  mainChart = new CanvasJS.Chart("mainChartContainer", {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light1",
    title: {
      text: title
    },
    axisX: {
      title: xTitle,
      valueFormatString: chartType === 'line' || chartType === 'column' ? "DD MMM" : undefined
    },
    axisY: {
      title: yTitle,
      includeZero: true
    },
    data: [{
      type: chartType,
      indexLabel: chartType === 'pie' ? "{label}: {y}" : undefined,
      indexLabelFontSize: 12,
      dataPoints: dataPoints
    }]
  });
  mainChart.render();
}

// Render secondary chart
function renderSecondaryChart(dataPoints, title, xTitle, yTitle, chartType) {
  document.getElementById('secondaryChartTitle').textContent = title;
  
  secondaryChart = new CanvasJS.Chart("secondaryChartContainer", {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light1",
    title: {
      text: title
    },
    axisX: {
      title: xTitle,
      valueFormatString: chartType === 'line' || chartType === 'column' ? "DD MMM" : undefined
    },
    axisY: {
      title: yTitle,
      includeZero: true
    },
    data: [{
      type: chartType,
      indexLabel: chartType === 'pie' ? "{label}: {y}" : undefined,
      indexLabelFontSize: 12,
      dataPoints: dataPoints
    }]
  });
  secondaryChart.render();
}

// Export to PDF
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Pharmacy Management System Report', 14, 22);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add report type
  const reportType = document.getElementById('reportType');
  doc.text(`Report Type: ${reportType.options[reportType.selectedIndex].text}`, 14, 38);
  
  // Add filters
  const categoryFilter = document.getElementById('categoryFilter');
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  doc.text(`Category: ${categoryFilter.value ? categoryFilter.options[categoryFilter.selectedIndex].text : 'All'}`, 14, 46);
  doc.text(`Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`, 14, 54);
  
  // Add summary cards data
  doc.setFontSize(16);
  doc.text('Summary', 14, 70);
  
  const cards = document.querySelectorAll('#summaryCards > div');
  let yPosition = 80;
  
  cards.forEach((card, index) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    const title = card.querySelector('h3').textContent;
    const value = card.querySelector('.text-2xl').textContent;
    const change = card.querySelector('.text-sm').textContent;
    
    doc.setFontSize(12);
    doc.text(`${title}: ${value} (${change})`, 14, yPosition);
    yPosition += 10;
  });
  
  // Save the PDF
  doc.save('pharmacy_report.pdf');
}

// Export to Excel
function exportToExcel() {
  // Get table data
  const table = document.getElementById('dataTable');
  const rows = Array.from(table.querySelectorAll('tr'));
  
  // Convert table data to worksheet
  const ws = XLSX.utils.table_to_sheet(table);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
  
  // Save to file
  XLSX.writeFile(wb, 'pharmacy_report.xlsx');
}

// Initialize the page
window.onload = function () {
  loadComponent("sidebar", "../../../core/components/sidebar.html");
  fetchData();
  
  // Set default date range to last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
  document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
  
  // Add event listeners
  document.getElementById('reportType').addEventListener('change', generateReports);
  document.getElementById('categoryFilter').addEventListener('change', generateReports);
  document.getElementById('filterBtn').addEventListener('click', generateReports);
  
  document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    generateReports();
  });
  
  document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
  document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
};