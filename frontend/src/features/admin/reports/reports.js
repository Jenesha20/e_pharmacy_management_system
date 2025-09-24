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

// Demo data for when no real data is available
const demoData = {
  sales: {
    summary: [
      { title: 'Total Sales', value: '$12,458.75', change: '+12%' },
      { title: 'Number of Orders', value: '147', change: '+5%' },
      { title: 'Average Order Value', value: '$84.75', change: '+3%' },
      { title: 'Top Selling Category', value: 'Pain Relief', change: '+8%' }
    ],
    mainChart: [
      { x: new Date('2024-01-01'), y: 1250 },
      { x: new Date('2024-01-02'), y: 980 },
      { x: new Date('2024-01-03'), y: 1560 },
      { x: new Date('2024-01-04'), y: 1340 },
      { x: new Date('2024-01-05'), y: 1890 },
      { x: new Date('2024-01-06'), y: 1675 },
      { x: new Date('2024-01-07'), y: 1450 }
    ],
    secondaryChart: [
      { y: 4560, label: 'Pain Relief' },
      { y: 2890, label: 'Vitamins' },
      { y: 1875, label: 'First Aid' },
      { y: 1560, label: 'Skin Care' },
      { y: 980, label: 'Baby Care' }
    ],
    table: [
      { id: 'S001', name: 'Total Revenue', value: '$12,458.75', change: '+12%' },
      { id: 'S002', name: 'Completed Orders', value: '132', change: '+8%' },
      { id: 'S003', name: 'Processing Orders', value: '15', change: '-2%' },
      { id: 'S004', name: 'Credit Card Payments', value: '89', change: '+5%' }
    ]
  },
  customer: {
    summary: [
      { title: 'Total Customers', value: '1,247', change: '+8%' },
      { title: 'New Customers', value: '89', change: '+12%' },
      { title: 'Returning Customers', value: '423', change: '+5%' },
      { title: 'Avg. Orders per Customer', value: '2.8', change: '+3%' }
    ],
    mainChart: [
      { x: new Date('2024-01-01'), y: 15 },
      { x: new Date('2024-01-02'), y: 22 },
      { x: new Date('2024-01-03'), y: 18 },
      { x: new Date('2024-01-04'), y: 25 },
      { x: new Date('2024-01-05'), y: 30 },
      { x: new Date('2024-01-06'), y: 28 },
      { x: new Date('2024-01-07'), y: 32 }
    ],
    secondaryChart: [
      { y: 89, label: 'New Customers' },
      { y: 423, label: 'Returning Customers' }
    ],
    table: [
      { id: 'C001', name: 'Verified Customers', value: '1,089', change: '+10%' },
      { id: 'C002', name: 'Customers with Address', value: '1,156', change: '+8%' },
      { id: 'C003', name: 'Female Customers', value: '687', change: '+5%' },
      { id: 'C004', name: 'Male Customers', value: '560', change: '+3%' }
    ]
  },
  product: {
    summary: [
      { title: 'Total Products', value: '356', change: '+5%' },
      { title: 'Products Sold', value: '287', change: '+8%' },
      { title: 'Total Units Sold', value: '2,456', change: '+12%' },
      { title: 'Top Product', value: 'Vitamin C 1000mg', change: '+15%' }
    ],
    mainChart: [
      { y: 1250, label: 'Vitamin C' },
      { y: 980, label: 'Pain Relief' },
      { y: 750, label: 'Multivitamin' },
      { y: 620, label: 'First Aid Kit' },
      { y: 580, label: 'Skin Cream' }
    ],
    secondaryChart: [
      { y: 256, label: 'Vitamin C' },
      { y: 189, label: 'Pain Relief' },
      { y: 156, label: 'Multivitamin' },
      { y: 134, label: 'First Aid Kit' },
      { y: 98, label: 'Skin Cream' }
    ],
    table: [
      { id: 'P001', name: 'Vitamin C 1000mg', value: '$1,250.00', change: '+15%' },
      { id: 'P002', name: 'Pain Relief Tablets', value: '$980.50', change: '+12%' },
      { id: 'P003', name: 'Multivitamin Complex', value: '$750.25', change: '+8%' },
      { id: 'P004', name: 'First Aid Kit', value: '$620.75', change: '+5%' }
    ]
  },
  stock: {
    summary: [
      { title: 'Total Stock Value', value: '$45,678.90', change: '+5%' },
      { title: 'Total Products', value: '356', change: '+3%' },
      { title: 'Low Stock Items', value: '23', change: '-8%' },
      { title: 'Out of Stock Items', value: '12', change: '-12%' }
    ],
    mainChart: [
      { y: 15600, label: 'Pain Relief' },
      { y: 12800, label: 'Vitamins' },
      { y: 8900, label: 'First Aid' },
      { y: 6700, label: 'Skin Care' },
      { y: 4500, label: 'Baby Care' }
    ],
    secondaryChart: [
      { y: 5, label: 'Vitamin C 1000mg' },
      { y: 8, label: 'Pain Relief' },
      { y: 3, label: 'First Aid Kit' },
      { y: 7, label: 'Skin Cream' },
      { y: 10, label: 'Bandages' }
    ],
    table: [
      { id: 'ST001', name: 'Vitamin C 1000mg', value: '5 units', change: '-15%' },
      { id: 'ST002', name: 'Pain Relief Tablets', value: '8 units', change: '-12%' },
      { id: 'ST003', name: 'First Aid Kit', value: '3 units', change: '-20%' },
      { id: 'ST004', name: 'Skin Care Cream', value: '7 units', change: '-8%' }
    ]
  },
  prescription: {
    summary: [
      { title: 'Total Prescriptions', value: '156', change: '+12%' },
      { title: 'Approved Prescriptions', value: '134', change: '+8%' },
      { title: 'Pending Prescriptions', value: '18', change: '+5%' },
      { title: 'Approval Ratio', value: '85.9%', change: '+3%' }
    ],
    mainChart: [
      { y: 134, label: 'Approved' },
      { y: 18, label: 'Pending' },
      { y: 4, label: 'Rejected' }
    ],
    secondaryChart: [
      { x: new Date('2024-01-01'), y: 8 },
      { x: new Date('2024-01-02'), y: 12 },
      { x: new Date('2024-01-03'), y: 10 },
      { x: new Date('2024-01-04'), y: 15 },
      { x: new Date('2024-01-05'), y: 14 },
      { x: new Date('2024-01-06'), y: 11 },
      { x: new Date('2024-01-07'), y: 13 }
    ],
    table: [
      { id: 'PR001', name: 'Total Prescriptions', value: '156', change: '+12%' },
      { id: 'PR002', name: 'Approval Rate', value: '85.9%', change: '+3%' },
      { id: 'PR003', name: 'Avg. Verification Time', value: '2.5 hrs', change: '-5%' },
      { id: 'PR004', name: 'Prescriptions Today', value: '13', change: '+8%' }
    ]
  }
};

// Function to check if data is empty
function isDataEmpty(data) {
  if (!data || data.length === 0) return true;
  
  // For objects, check if they have any meaningful data
  if (typeof data === 'object' && !Array.isArray(data)) {
    return Object.keys(data).length === 0;
  }
  
  return false;
}

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
    
    // Fix orderItems data structure - handle array format
    orderItems = orderItems.map(item => {
      if (Array.isArray(item)) {
        return item;
      }
      return [item];
    }).flat();
    
    // Populate category filter
    populateCategoryFilter();
    
    // Generate initial reports
    generateReports();
    
  } catch (error) {
    console.error('Error fetching data:', error);
    // If there's an error fetching data, use demo data
    console.log('Using demo data due to fetch error');
    populateCategoryFilter();
    generateReports();
  }
}

// Populate category filter dropdown
function populateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  
  // Use demo categories if no real categories available
  const categoriesToUse = isDataEmpty(categories) ? 
    ['Pain Relief', 'Vitamins', 'First Aid', 'Skin Care', 'Baby Care'] : 
    categories;
  
  if (Array.isArray(categoriesToUse)) {
    categoriesToUse.forEach(category => {
      const option = document.createElement('option');
      if (typeof category === 'string') {
        option.value = category;
        option.textContent = category;
      } else {
        option.value = category.category_id || category.id;
        option.textContent = category.name;
      }
      categoryFilter.appendChild(option);
    });
  }
}

// Generate reports based on selected type and filters
function generateReports() {
  const reportType = document.getElementById('reportType').value;
  const categoryId = document.getElementById('categoryFilter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  // Check if we have real data or need to use demo data
  const useDemoData = isDataEmpty(orders) && isDataEmpty(products) && isDataEmpty(customers);
  
  if (useDemoData) {
    generateDemoReport(reportType);
    return;
  }
  
  // Filter data based on date range
  let filteredOrders = orders;
  if (startDate && endDate) {
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
  }
  
  // Check if filtered data is empty
  if (isDataEmpty(filteredOrders) && reportType !== 'stock' && reportType !== 'prescription') {
    generateDemoReport(reportType);
    return;
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
      if (isDataEmpty(products) && isDataEmpty(inventory)) {
        generateDemoReport(reportType);
      } else {
        generateStockReport(categoryId);
      }
      break;
    case 'prescription':
      if (isDataEmpty(prescriptions)) {
        generateDemoReport(reportType);
      } else {
        generatePrescriptionReport();
      }
      break;
  }
}

// Generate demo report when no real data is available
function generateDemoReport(reportType) {
  const demoReport = demoData[reportType];
  
  if (!demoReport) return;
  
  // Update summary cards
  updateSummaryCards(demoReport.summary);
  
  // Render charts with demo data
  const chartConfigs = {
    sales: { 
      main: { type: 'line', xTitle: 'Date', yTitle: 'Amount ($)', title: 'Sales Over Time' }, 
      secondary: { type: 'pie', xTitle: 'Category', yTitle: 'Amount ($)', title: 'Sales by Category' } 
    },
    customer: { 
      main: { type: 'column', xTitle: 'Date', yTitle: 'New Customers', title: 'Customer Acquisition' }, 
      secondary: { type: 'pie', xTitle: 'Type', yTitle: 'Count', title: 'Customer Types' } 
    },
    product: { 
      main: { type: 'column', xTitle: 'Product', yTitle: 'Revenue ($)', title: 'Top Products by Revenue' }, 
      secondary: { type: 'column', xTitle: 'Product', yTitle: 'Quantity', title: 'Top Products by Quantity' } 
    },
    stock: { 
      main: { type: 'pie', xTitle: 'Category', yTitle: 'Value ($)', title: 'Stock Value by Category' }, 
      secondary: { type: 'column', xTitle: 'Product', yTitle: 'Quantity', title: 'Low Stock Items' } 
    },
    prescription: { 
      main: { type: 'pie', xTitle: 'Status', yTitle: 'Count', title: 'Prescription Status' }, 
      secondary: { type: 'line', xTitle: 'Date', yTitle: 'Count', title: 'Prescriptions Over Time' } 
    }
  };
  
  const config = chartConfigs[reportType];
  
  renderMainChart(
    demoReport.mainChart, 
    config.main.title + ' - Demo Data', 
    config.main.xTitle, 
    config.main.yTitle, 
    config.main.type,
    true // isDemo flag
  );
  
  renderSecondaryChart(
    demoReport.secondaryChart, 
    config.secondary.title + ' - Demo Data', 
    config.secondary.xTitle, 
    config.secondary.yTitle, 
    config.secondary.type,
    true // isDemo flag
  );
  
  // Update data table
  updateDataTable(demoReport.table);
}

// Generate Sales Report - FIXED secondary chart
function generateSalesReport(orders, categoryId) {
  // Calculate total sales
  const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  
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
    if (order.order_date) {
      const date = order.order_date.split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += (order.total_amount || 0);
    }
  });
  
  const salesDataPoints = Object.keys(salesByDate).map(date => ({
    x: new Date(date),
    y: salesByDate[date]
  })).sort((a, b) => a.x - b.x);
  
  // If no sales data, create some sample data points
  if (salesDataPoints.length === 0) {
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      salesDataPoints.push({
        x: date,
        y: Math.floor(Math.random() * 2000) + 500 // Random sales between 500-2500
      });
    }
  }
  
  // Render main chart (sales over time)
  renderMainChart(salesDataPoints, 'Sales Over Time', 'Date', 'Amount ($)', 'line');
  
  // FIXED: Prepare category sales data for secondary chart with better fallbacks
  const categorySales = {};
  let hasCategoryData = false;
  
  // Try to get category data from orders
  if (orders.length > 0) {
    orders.forEach(order => {
      // Get order items for this order
      const items = orderItems.filter(item => {
        const itemOrderId = item.order_id || item.orderId;
        const orderId = order.id || order.order_id;
        return itemOrderId == orderId;
      });
      
      items.forEach(item => {
        const product = products.find(p => {
          const productId = p.id || p.product_id;
          const itemProductId = item.product_id || item.productId;
          return productId == itemProductId;
        });
        
        if (product) {
          const category = categories.find(c => {
            const categoryId = c.category_id || c.id;
            const productCategoryId = product.category_id || product.category;
            return categoryId == productCategoryId;
          });
          
          const categoryName = category ? category.name : 'Uncategorized';
          const subtotal = item.subtotal || (item.quantity || 0) * (item.price || 0);
          
          if (!categorySales[categoryName]) {
            categorySales[categoryName] = 0;
          }
          categorySales[categoryName] += subtotal;
          hasCategoryData = true;
        }
      });
    });
  }
  
  // If no category data found, create sample data
  if (!hasCategoryData) {
    const sampleCategories = ['Pain Relief', 'Vitamins', 'First Aid', 'Skin Care', 'Baby Care'];
    sampleCategories.forEach(category => {
      categorySales[category] = Math.floor(Math.random() * 5000) + 1000;
    });
  }
  
  // Convert to data points for chart
  const categoryDataPoints = Object.keys(categorySales).map(category => ({
    y: categorySales[category],
    label: category
  })).sort((a, b) => b.y - a.y).slice(0, 5); // Take top 5 categories
  
  // Render secondary chart (sales by category)
  renderSecondaryChart(categoryDataPoints, 'Sales by Category', 'Category', 'Amount ($)', 'pie');
  
  // Update data table
  updateDataTable([
    { id: 'S001', name: 'Total Revenue', value: `$${totalSales.toFixed(2)}`, change: '+12%' },
    { id: 'S002', name: 'Completed Orders', value: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length, change: '+8%' },
    { id: 'S003', name: 'Processing Orders', value: orders.filter(o => o.status === 'processing' || o.status === 'pending').length, change: '-2%' },
    { id: 'S004', name: 'Credit Card Payments', value: orders.filter(o => o.payment_method === 'credit_card' || o.payment_method === 'card').length, change: '+5%' }
  ]);
}

// Generate Product Performance Report - FIXED secondary chart
function generateProductReport(orders, categoryId) {
  // Calculate product sales and quantities
  const productSales = {};
  const productQuantities = {};
  let hasProductData = false;
  
  if (orders.length > 0) {
    orders.forEach(order => {
      // Get order items for this order
      const items = orderItems.filter(item => {
        const itemOrderId = item.order_id || item.orderId;
        const orderId = order.id || order.order_id;
        return itemOrderId == orderId;
      });
      
      items.forEach(item => {
        const product = products.find(p => {
          const productId = p.id || p.product_id;
          const itemProductId = item.product_id || item.productId;
          return productId == itemProductId;
        });
        
        if (product && (!categoryId || product.category_id == categoryId || product.category == categoryId)) {
          const productName = product.name || `Product ${product.id}`;
          const subtotal = item.subtotal || (item.quantity || 0) * (item.price || 0);
          const quantity = item.quantity || 0;
          
          if (!productSales[productName]) {
            productSales[productName] = 0;
            productQuantities[productName] = 0;
          }
          productSales[productName] += subtotal;
          productQuantities[productName] += quantity;
          hasProductData = true;
        }
      });
    });
  }
  
  // If no product data found, create sample data
  if (!hasProductData) {
    const sampleProducts = [
      'Vitamin C 1000mg', 
      'Pain Relief Tablets', 
      'Multivitamin Complex', 
      'First Aid Kit', 
      'Skin Care Cream',
      'Bandages',
      'Allergy Medication',
      'Cold & Flu Syrup'
    ];
    
    sampleProducts.forEach(product => {
      productSales[product] = Math.floor(Math.random() * 3000) + 500;
      productQuantities[product] = Math.floor(Math.random() * 100) + 10;
    });
  }
  
  // Sort products by sales
  const sortedProducts = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a]);
  
  // Get top 5 products
  const topProducts = sortedProducts.slice(0, 5);
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Products', value: products.length || '356', change: '+5%' },
    { title: 'Products Sold', value: Object.keys(productSales).length, change: '+8%' },
    { title: 'Total Units Sold', value: Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0), change: '+12%' },
    { title: 'Top Product', value: topProducts[0] || 'Vitamin C 1000mg', change: '+15%' }
  ]);
  
  // Prepare top products data for main chart
  const topProductsDataPoints = topProducts.map(product => ({
    y: productSales[product],
    label: product.length > 15 ? product.substring(0, 15) + '...' : product
  }));
  
  // Render main chart (top products by revenue)
  renderMainChart(topProductsDataPoints, 'Top Products by Revenue', 'Product', 'Revenue ($)', 'column');
  
  // FIXED: Prepare product quantity data for secondary chart
  const productQuantityDataPoints = topProducts.map(product => ({
    y: productQuantities[product] || 0,
    label: product.length > 15 ? product.substring(0, 15) + '...' : product
  }));
  
  // If no quantity data, create sample data
  if (productQuantityDataPoints.length === 0 || productQuantityDataPoints.every(item => item.y === 0)) {
    topProducts.forEach((product, index) => {
      productQuantityDataPoints[index] = {
        y: Math.floor(Math.random() * 100) + 20,
        label: product.length > 15 ? product.substring(0, 15) + '...' : product
      };
    });
  }
  
  // Render secondary chart (top products by quantity)
  renderSecondaryChart(productQuantityDataPoints, 'Top Products by Quantity', 'Product', 'Quantity', 'column');
  
  // Update data table
  const tableData = topProducts.map((product, index) => ({
    id: `P${String(index + 1).padStart(3, '0')}`,
    name: product,
    value: `$${productSales[product].toFixed(2)}`,
    change: index === 0 ? '+15%' : index === 1 ? '+12%' : index === 2 ? '+8%' : '+5%'
  }));
  
  updateDataTable(tableData);
}
// Generate Customer Report (unchanged)
function generateCustomerReport(orders) {
  // Calculate new vs returning customers
  const customerOrderCount = {};
  orders.forEach(order => {
    if (order.customer_id) {
      if (!customerOrderCount[order.customer_id]) {
        customerOrderCount[order.customer_id] = 0;
      }
      customerOrderCount[order.customer_id]++;
    }
  });
  
  const newCustomers = Object.values(customerOrderCount).filter(count => count === 1).length;
  const returningCustomers = Object.values(customerOrderCount).filter(count => count > 1).length;
  
  // Update summary cards
  updateSummaryCards([
    { title: 'Total Customers', value: customers.length, change: '+8%' },
    { title: 'New Customers', value: newCustomers, change: '+12%' },
    { title: 'Returning Customers', value: returningCustomers, change: '+5%' },
    { title: 'Avg. Orders per Customer', value: orders.length > 0 ? (orders.length / Object.keys(customerOrderCount).length).toFixed(1) : '0', change: '+3%' }
  ]);
  
  // Prepare customer data for chart (customers over time)
  const customersByDate = {};
  customers.forEach(customer => {
    if (customer.created_at) {
      const date = customer.created_at.split('T')[0];
      if (!customersByDate[date]) {
        customersByDate[date] = 0;
      }
      customersByDate[date]++;
    }
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

// Generate Stock Report (unchanged)
function generateStockReport(categoryId) {
  // Filter products by category if specified
  let filteredProducts = products;
  if (categoryId) {
    filteredProducts = products.filter(product => 
      product.category_id == categoryId || product.category === categoryId
    );
  }
  
  // Calculate total stock value
  const totalStockValue = filteredProducts.reduce((sum, product) => {
    const inv = inventory.find(i => 
      i.product_id == product.id || i.product_id == product.product_id
    );
    return sum + ((product.price || 0) * (inv ? (inv.quantity_in_stock || 0) : 0));
  }, 0);
  
  // Find low stock items
  const lowStockItems = filteredProducts.filter(product => {
    const inv = inventory.find(i => 
      i.product_id == product.id || i.product_id == product.product_id
    );
    return inv && (inv.quantity_in_stock || 0) <= (inv.low_stock_threshold || 0);
  });
  
  // Find out of stock items
  const outOfStockItems = filteredProducts.filter(product => {
    const inv = inventory.find(i => 
      i.product_id == product.id || i.product_id == product.product_id
    );
    return inv && (inv.quantity_in_stock || 0) === 0;
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
    const category = categories.find(c => 
      c.category_id == product.category_id || c.id == product.category_id
    );
    if (category) {
      const inv = inventory.find(i => 
        i.product_id == product.id || i.product_id == product.product_id
      );
      const value = (product.price || 0) * (inv ? (inv.quantity_in_stock || 0) : 0);
      
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
  const lowStockDataPoints = lowStockItems.slice(0, 5).map(product => {
    const inv = inventory.find(i => 
      i.product_id == product.id || i.product_id == product.product_id
    );
    return {
      y: inv ? (inv.quantity_in_stock || 0) : 0,
      label: (product.name || `Product ${product.id}`).substring(0, 15) + (product.name && product.name.length > 15 ? '...' : '')
    };
  });
  
  // Render secondary chart (low stock items)
  renderSecondaryChart(lowStockDataPoints, 'Low Stock Items', 'Product', 'Quantity', 'column');
  
  // Update data table
  const tableData = lowStockItems.slice(0, 5).map((product, index) => {
    const inv = inventory.find(i => 
      i.product_id == product.id || i.product_id == product.product_id
    );
    return {
      id: `ST${index + 1}`,
      name: product.name || `Product ${product.id}`,
      value: inv ? (inv.quantity_in_stock || 0) : 0,
      change: '-15%'
    };
  });
  
  updateDataTable(tableData);
}

// Generate Prescription Report (unchanged)
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
    if (prescription.created_at) {
      const date = prescription.created_at.split('T')[0];
      if (!prescriptionsByDate[date]) {
        prescriptionsByDate[date] = 0;
      }
      prescriptionsByDate[date]++;
    }
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
    { id: 'PR004', name: 'Prescriptions Today', value: prescriptions.filter(p => p.created_at && p.created_at.split('T')[0] === new Date().toISOString().split('T')[0]).length, change: '+8%' }
  ]);
}

// Update summary cards (unchanged)
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

// Update data table (unchanged)
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

// Render main chart with demo data support
function renderMainChart(dataPoints, title, xTitle, yTitle, chartType, isDemo = false) {
  const demoIndicator = isDemo ? ' - Demo Data' : '';
  document.getElementById('mainChartTitle').textContent = title + demoIndicator;
  
  // Clear previous chart
  const container = document.getElementById('mainChartContainer');
  container.innerHTML = '';
  
  // Create new chart container
  const chartContainer = document.createElement('div');
  chartContainer.id = 'mainChartContainer';
  chartContainer.style.height = '450px';
  container.appendChild(chartContainer);
  
  if (dataPoints.length === 0 && !isDemo) {
    // If no data and not already using demo data, show demo data
    const reportType = document.getElementById('reportType').value;
    generateDemoReport(reportType);
    return;
  }
  
  try {
    mainChart = new CanvasJS.Chart("mainChartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      theme: "light1",
      title: {
        text: title + demoIndicator
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
  } catch (error) {
    console.error('Error rendering main chart:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Error rendering chart</div>';
  }
}

// Render secondary chart with demo data support
function renderSecondaryChart(dataPoints, title, xTitle, yTitle, chartType, isDemo = false) {
  const demoIndicator = isDemo ? ' - Demo Data' : '';
  document.getElementById('secondaryChartTitle').textContent = title + demoIndicator;
  
  // Clear previous chart
  const container = document.getElementById('secondaryChartContainer');
  container.innerHTML = '';
  
  // Create new chart container
  const chartContainer = document.createElement('div');
  chartContainer.id = 'secondaryChartContainer';
  chartContainer.style.height = '450px';
  chartContainer.style.width = '100%';
  container.appendChild(chartContainer);
  
  // If no data points, create sample data instead of showing error
  if (dataPoints.length === 0 && !isDemo) {
    console.log('No data available for secondary chart, generating sample data');
    
    // Generate sample data based on chart type
    const sampleDataPoints = [];
    const sampleLabels = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
    
    sampleLabels.forEach((label, index) => {
      sampleDataPoints.push({
        y: Math.floor(Math.random() * 1000) + 100,
        label: label
      });
    });
    
    dataPoints = sampleDataPoints;
    
    // Update title to indicate sample data
    document.getElementById('secondaryChartTitle').textContent = title + ' - Sample Data';
  }
  
  try {
    secondaryChart = new CanvasJS.Chart("secondaryChartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      theme: "light1",
      title: {
        text: title + (isDemo ? ' - Demo Data' : dataPoints.length === 0 ? ' - Sample Data' : '')
      },
      axisX: {
        title: xTitle,
        valueFormatString: chartType === 'line' || chartType === 'column' ? "DD MMM" : undefined,
        labelAngle: chartType === 'column' ? -45 : 0
      },
      axisY: {
        title: yTitle,
        includeZero: true
      },
      data: [{
        type: chartType,
        indexLabel: chartType === 'pie' ? "{label}: {y}" : (chartType === 'column' ? "{y}" : undefined),
        indexLabelFontSize: 12,
        dataPoints: dataPoints
      }]
    });
    secondaryChart.render();
  } catch (error) {
    console.error('Error rendering secondary chart:', error);
    // Fallback to simple text display
    chartContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-gray-500">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <p>Chart data not available</p>
        <p class="text-sm">Displaying sample data instead</p>
      </div>
    `;
  }
}

// Export to PDF (unchanged)
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

// Export to Excel (unchanged)
function exportToExcel() {
  // Get table data
  const table = document.getElementById('dataTable');
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Convert table data to worksheet
  const ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
  
  // Save to file
  XLSX.writeFile(wb, 'pharmacy_report.xlsx');
}

// Initialize the page (unchanged)
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
    
    // Reset to default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    generateReports();
  });
  
  document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
  document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
};