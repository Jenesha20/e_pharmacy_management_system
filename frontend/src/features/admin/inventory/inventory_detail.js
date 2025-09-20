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

//   document.addEventListener("DOMContentLoaded", () => {
//     const params = new URLSearchParams(window.location.search);
  
//     // Fill customer info
//     document.getElementById("medId").value = params.get("medId");
//     document.getElementById("medName").value = params.get("medName");
//     document.getElementById("medCat").value = params.get("medCat");
//     document.getElementById("medStock").value = params.get("medStock");
//     document.getElementById("medExpiry").value = params.get("medExpiry");
//     document.getElementById("medEffect").value = params.get("medEffect");
//     document.getElementById("medUse").value = params.get("medUse");
  
//     // Dummy orders for testing
//     const orders = [
//       { medId: "D06ID232435454", medName: "Augmentin 625 Du.", medCat: "Generic Medicine", medStock: 2, medExpiry: "₹40",medEffect:"Side effects",medUse:"How to use" },
//       { orderId: "O-1002", customerId: "D06ID232435454", category: "Health", name: "Vitamin C", qty: 1, price: "₹120" },
//       { orderId: "O-2001", customerId: "SomeOtherId", category: "Wellness", name: "Protein Powder", qty: 1, price: "₹500" }
//     ];
  
//     const tableBody = document.getElementById("ordersTable");
//     tableBody.innerHTML = "";
  
//     const custId = params.get("medId");
//     orders
//       .filter(order => order.customerId == custId)
//       .forEach(order => {
//         const row = `
//           <tr>
//             <td class="border px-4 py-2">${order.medId}</td>
//             <td class="border px-4 py-2">${order.medName}</td>
//             <td class="border px-4 py-2">${order.medCat}</td>
//             <td class="border px-4 py-2">${order.medStock}</td>
//             <td class="border px-4 py-2">${order.medExpiry}</td>
//             <td class="border px-4 py-2">${order.medEffect}</td>
//             <td class="border px-4 py-2">${order.medUse}</td>
//           </tr>`;
//         tableBody.insertAdjacentHTML("beforeend", row);
//       });
  
//     // If no orders found, show message
//     if (tableBody.innerHTML === "") {
//       tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No orders found</td></tr>`;
//     }
//   });


const API_BASE = 'http://localhost:3000';
const ENDPOINTS = {
  products: `${API_BASE}/products`,
  inventory: `${API_BASE}/inventory`,
  categories: `${API_BASE}/categories`
};

// Global variables
let productData = null;
let inventoryData = null;

// Sidebar
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

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("sidebar", "../../../core/components/sidebar.html");
  
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId');
  
  if (productId) {
    loadProductData(productId);
  } else {
    alert("No product ID specified!");
    window.location.href = "inventory.html";
  }
});

// Load product data
async function loadProductData(productId) {
  try {
    // Fetch product data using query parameter
    const productResponse = await fetch(`${ENDPOINTS.products}?id=${productId}`);
    
    if (!productResponse.ok) {
      throw new Error(`HTTP error! status: ${productResponse.status}`);
    }
    
    const products = await productResponse.json();
    
    if (products.length === 0) {
      // Try with product_id instead of id
      const altProductResponse = await fetch(`${ENDPOINTS.products}?product_id=${productId}`);
      if (!altProductResponse.ok) {
        throw new Error('Product not found');
      }
      const altProducts = await altProductResponse.json();
      if (altProducts.length === 0) {
        throw new Error('Product not found');
      }
      productData = altProducts[0];
    } else {
      productData = products[0];
    }
    
    // Fetch inventory data
    const inventoryResponse = await fetch(`${ENDPOINTS.inventory}?product_id=${productId}`);
    if (!inventoryResponse.ok) {
      throw new Error(`HTTP error! status: ${inventoryResponse.status}`);
    }
    const inventory = await inventoryResponse.json();
    inventoryData = inventory.length > 0 ? inventory[0] : null;
    
    // Fetch category name
    let categoryName = 'Unknown';
    if (productData.category_id) {
      // Check if category_id is a number (ID) or string (category name)
      if (typeof productData.category_id === 'number') {
        const categoryResponse = await fetch(`${ENDPOINTS.categories}?id=${productData.category_id}`);
        if (categoryResponse.ok) {
          const categories = await categoryResponse.json();
          categoryName = categories.length > 0 ? categories[0].name : 'Unknown';
        }
      } else {
        // It's already a category name string
        categoryName = productData.category_id;
      }
    }
    
    // Populate the page with data
    populateProductDetails(productData, inventoryData, categoryName);
    
    // Set up edit button
    document.getElementById('edit-button').href = `inventory_addition.html?edit=${productData.id || productData.product_id}`;
    
    // Set up restock button
    document.getElementById('restock-button').addEventListener('click', () => {
      const quantity = prompt(`Enter quantity to add to ${productData.name}:`, "10");
      if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
        restockProduct(productId, parseInt(quantity));
      }
    });
    
  } catch (error) {
    console.error("Error loading product data:", error);
    alert("Error loading product details: " + error.message);
    window.location.href = "inventory.html";
  }
}

// Populate product details on the page
function populateProductDetails(product, inventory, categoryName) {
  // Set product image - update path to use images/ format
  const imageUrl = product.image_url ? 
    (product.image_url.startsWith('images/') ? product.image_url : `images/${product.image_url}`) : 
    '/images/placeholder-medicine.jpg';
  document.getElementById('product-image').src = imageUrl;
  
  // Set basic info
  document.getElementById('medicine-name').textContent = product.name || 'N/A';
  document.getElementById('medicine-sku').textContent = product.sku || 'N/A';
  document.getElementById('medicine-category').textContent = categoryName || 'N/A';
  document.getElementById('manufacturer').textContent = product.manufacturer || 'N/A';
  document.getElementById('composition').textContent = product.composition || 'N/A';
  document.getElementById('price').textContent = `₹${product.price ? product.price.toFixed(2) : '0.00'}`;
  document.getElementById('description').textContent = product.description || 'No description available';
  document.getElementById('side-effects').textContent = product.side_effects || 'None reported';
  
  // Set inventory info
  if (inventory) {
    document.getElementById('stock-quantity').textContent = inventory.quantity_in_stock || '0';
    document.getElementById('low-stock-threshold').textContent = inventory.low_stock_threshold || '10';
  } else {
    document.getElementById('stock-quantity').textContent = '0';
    document.getElementById('low-stock-threshold').textContent = '10';
  }
  
  // Set expiry date
  if (product.expiry_date) {
    try {
      const expiryDate = new Date(product.expiry_date);
      if (!isNaN(expiryDate.getTime())) {
        document.getElementById('expiry-date').textContent = expiryDate.toLocaleDateString();
      } else {
        document.getElementById('expiry-date').textContent = 'Invalid date';
      }
    } catch (e) {
      document.getElementById('expiry-date').textContent = product.expiry_date;
    }
  } else {
    document.getElementById('expiry-date').textContent = 'Not set';
  }
  
  // Set prescription requirement
  document.getElementById('requires-prescription').textContent = product.requires_prescription ? 'Yes' : 'No';
  
  // Set featured status
  document.getElementById('featured-product').textContent = product.featured_product ? 'Yes' : 'No';
}

// Restock product
async function restockProduct(productId, quantity) {
  try {
    // Find inventory record
    const inventoryResponse = await fetch(`${ENDPOINTS.inventory}?product_id=${productId}`);
    if (!inventoryResponse.ok) {
      throw new Error('Failed to fetch inventory');
    }
    const inventoryRecords = await inventoryResponse.json();
    
    if (inventoryRecords.length > 0) {
      const inventoryId = inventoryRecords[0].id;
      const currentStock = inventoryRecords[0].quantity_in_stock || 0;
      
      // Update inventory
      const updateResponse = await fetch(`${ENDPOINTS.inventory}/${inventoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity_in_stock: currentStock + quantity,
          last_restocked_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update inventory');
      }
      
      alert(`Successfully added ${quantity} units to stock!`);
      // Reload the page to show updated stock
      window.location.reload();
    } else {
      // Create new inventory record
      const createResponse = await fetch(ENDPOINTS.inventory, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          quantity_in_stock: quantity,
          low_stock_threshold: 10,
          last_restocked_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create inventory record');
      }
      
      alert(`Successfully created inventory record with ${quantity} units!`);
      // Reload the page to show updated stock
      window.location.reload();
    }
  } catch (error) {
    console.error("Error restocking product:", error);
    alert("Error restocking product. Please try again.");
  }
}