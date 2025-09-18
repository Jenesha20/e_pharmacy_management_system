function loadComponent(id, filePath) {
    fetch(filePath)
      .then(response => response.text())
      .then(data => {
        document.getElementById(id).innerHTML = data;
      })
      .catch(err => console.error("Error loading component:", err));
  }
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");

  async function fetchProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
  
    if (!id) {
      document.getElementById("product-detail").innerHTML =
        "<p class='text-red-500'>No product selected.</p>";
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:3000/medicine/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const product = await res.json();
  
      // Render product details
      document.getElementById("product-detail").innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      <!-- Left Side (Image) -->
      <div class="flex flex-col">
        <div class="bg-[#A1E970] bg-opacity-50 rounded-lg flex items-center justify-center p-6">
          <img src="${product.image_url}" alt="${product.name}" 
               class="w-full max-h-[450px] object-contain rounded-lg" />
        </div>
        <p class="text-center text-2xl font-bold text-gray-900 mt-6">
          MRP Rs.${product.price}
        </p>
      </div>
    
      <!-- Right Side (Details + Cart) -->
      <div class="flex flex-col h-full">
        <!-- Product Details -->
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-gray-900">${product.name}</h2>
          <p class="text-gray-500 mt-1">${product.composition}</p>
    
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900">Category</h3>
            <p class="text-gray-600 mt-1">${product.category}</p>
          </div>
    
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900">Use By</h3>
            <p class="text-gray-600 mt-1">${product.expiry_date}</p>
          </div>
    
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900">Manufacturer</h3>
            <p class="text-gray-600 mt-1">${product.manufacturer}</p>
          </div>
    
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900">Description</h3>
            <p class="text-gray-600 mt-1">${product.description}</p>
          </div>
    
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900">Side Effects</h3>
            <p class="text-gray-600 mt-1">${product.side_effects}</p>
          </div>
        </div>
    
        <!-- Cart Controls -->
        <div class="mt-8 flex items-center space-x-6">
          <div class="flex items-center border border-gray-300 rounded-lg">
            <button id="decrement" 
                    class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">
              <span class="material-icons text-base">remove</span>
            </button>
            <input id="quantity" type="number" min="1" value="1" 
                   class="w-16 text-center py-2 px-4 focus:outline-none" />
            <button id="increment" 
                    class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">
              <span class="material-icons text-base">add</span>
            </button>
          </div>
          <button id="add-to-cart" 
            class="flex-1 bg-[#A1E970] bg-opacity-90 hover:bg-[#A1E970] text-black font-bold py-3 px-6 rounded-lg transition duration-300">
            Add to cart
          </button>
        </div>
      </div>
    </div>
    
      `;
  
      // ✅ Attach functionality AFTER rendering
      const quantityInput = document.getElementById("quantity");
      const incrementBtn = document.getElementById("increment");
      const decrementBtn = document.getElementById("decrement");
      const addToCartBtn = document.getElementById("add-to-cart");
  
      incrementBtn.addEventListener("click", () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      });
  
      decrementBtn.addEventListener("click", () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });
  
      addToCartBtn.addEventListener("click", () => {
        const quantity = parseInt(quantityInput.value);
        addToCart(product.id, quantity);
      });
  
    } catch (err) {
      console.error(err);
      document.getElementById("product-detail").innerHTML =
        "<p class='text-red-500'>Failed to load product.</p>";
    }
  }
  
  // Get current user from localStorage
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
  }
  
  // Add product to cart (same functionality as browse.js but with quantity support)
  async function addToCart(productId, quantity = 1) {
    const now = new Date().toISOString();
    
    // Case 1: User is logged in → save to backend
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userId = currentUser.id;
  
      try {
        // Check if product already in backend cart
        const res = await fetch(`http://localhost:3000/cart?user_id=${userId}&product_id=${productId}`);
        const data = await res.json();
  
        if (data.length > 0) {
          // Already in cart → increment quantity
          const existingItem = data[0];
          await fetch(`http://localhost:3000/cart/${existingItem.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: existingItem.quantity + quantity })
          });
        } else {
          // Not in cart → add new record
          await fetch("http://localhost:3000/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              product_id: productId,
              quantity: quantity,
              status: "active",
              added_at: now
            })
          });
        }
  
        alert("Product added to cart!");
      } catch (err) {
        console.error("Error adding to cart (backend):", err);
      }
    }
  
    // Case 2: User is NOT logged in → save in localStorage
    else {
      let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
  
      const existingItem = guestCart.find(item => item.product_id === productId);
  
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestCart.push({
          product_id: productId,
          quantity: quantity,
          added_at: now
        });
      }
  
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      alert("Product added to cart (guest mode)!");
      console.log(guestCart);
    }
  }
  
  document.addEventListener("DOMContentLoaded", fetchProduct);
  