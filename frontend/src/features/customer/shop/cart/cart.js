// // Load header/footer
// function loadComponent(id, filePath) {
//   fetch(filePath)
//     .then(res => res.text())
//     .then(data => document.getElementById(id).innerHTML = data)
//     .catch(err => console.error("Error loading component:", err));
// }

// loadComponent("header", "/frontend/src/core/components/navbar.html");
// loadComponent("footer", "/frontend/src/core/components/footer.html");

// let prescriptions = []; // {id, fileName, data}
// let cartItems = []; // fetched cart items
// let productsRequiringPrescription = 0;
// let isLoggedIn = false;

// // Function declarations (moved to the top)
// function renderPrescriptionList() {
//   const container = document.getElementById("prescriptionList");
//   if (!container) return;
  
//   container.innerHTML = "";
//   prescriptions.forEach((p, i) => {
//     container.innerHTML += `
//       <div class="relative border border-gray-300 rounded-md p-2 flex flex-col items-center cursor-pointer">
//         <img src="${p.data}" class="w-24 h-24 object-cover rounded-md" onclick="viewPrescription('${p.data}')"/>
//         <button onclick="deletePrescription(${p.id})" class="absolute top-0 right-0 text-red-500 font-bold p-1 rounded-full bg-white hover:bg-red-100">×</button>
//         <span class="text-sm mt-1">P${i+1}</span>
//       </div>
//     `;
//   });
// }

// function viewPrescription(data) {
//   const modal = document.createElement("div");
//   modal.id = "prescriptionModal";
//   modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
//   modal.innerHTML = `
//     <div class="bg-white p-4 rounded-lg relative max-w-lg w-full">
//       <button onclick="closePrescriptionModal()" class="absolute top-2 right-2 text-gray-700 font-bold text-xl">×</button>
//       <img src="${data}" class="w-full h-auto rounded-md"/>
//     </div>
//   `;
//   document.body.appendChild(modal);
// }

// function closePrescriptionModal() {
//   const modal = document.getElementById("prescriptionModal");
//   if (modal) modal.remove();
// }

// function updateUploadState() {
//   const browseBtn = document.getElementById("browseBtn");
//   if (!browseBtn) return;
//   if (prescriptions.length >= productsRequiringPrescription) {
//     browseBtn.disabled = true;
//     browseBtn.classList.add("opacity-50", "cursor-not-allowed");
//   } else {
//     browseBtn.disabled = false;
//     browseBtn.classList.remove("opacity-50", "cursor-not-allowed");
//   }
// }

// // Check if user is logged in
// function checkLoginStatus() {
//   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//   isLoggedIn = !!currentUser;
// }

// // Load guest data from local storage
// function loadGuestData() {
//   // Load prescriptions from local storage
//   const storedPrescriptions = localStorage.getItem('guestPrescriptions');
//   if (storedPrescriptions) {
//     prescriptions = JSON.parse(storedPrescriptions);
//     renderPrescriptionList();
//   }
  
//   // Load cart items from local storage
//   const storedCart = localStorage.getItem('guestCart');
//   if (storedCart) {
//     const guestCart = JSON.parse(storedCart);
    
//     // Fetch product details for guest cart items
//     fetchProductDetailsForGuestCart(guestCart);
//   }
// }

// // Fetch product details for guest cart items
// async function fetchProductDetailsForGuestCart(guestCart) {
//   try {
//     const medRes = await fetch("http://localhost:3000/medicine");
//     if (!medRes.ok) throw new Error("Failed to fetch medicines");
//     const medicines = await medRes.json();

//     // Map guest cart items to include product details
//     cartItems = guestCart.map(cartItem => {
//       const product = medicines.find(m => String(m.id) === String(cartItem.product_id));
//       return { 
//         id: cartItem.product_id, // Use product_id as id for consistency
//         product_id: cartItem.product_id,
//         quantity: cartItem.quantity,
//         ...product 
//       };
//     });

//     productsRequiringPrescription = cartItems.filter(i => i.tag).length;
//     console.log("Guest cart items:", cartItems);
//     renderCart(cartItems);
//     renderOrderSummary(cartItems);
//     updateUploadState();
//   } catch (err) {
//     console.error(err);
//   }
// }

// // Save guest data to local storage
// function saveGuestData() {
//   if (!isLoggedIn) {
//     localStorage.setItem('guestPrescriptions', JSON.stringify(prescriptions));
    
//     // Save only the essential cart data for guest users
//     const guestCart = cartItems.map(item => ({
//       product_id: item.id,
//       quantity: item.quantity,
//       added_at: item.added_at || new Date().toISOString()
//     }));
//     localStorage.setItem('guestCart', JSON.stringify(guestCart));
//   }
// }

// // Fetch prescriptions
// async function fetchPrescriptions() {
//   if (isLoggedIn) {
//     try {
//       const res = await fetch("http://localhost:3000/prescriptions");
//       if (!res.ok) throw new Error("Failed to fetch prescriptions");
//       prescriptions = await res.json();
//       renderPrescriptionList();
//       updateUploadState();
//     } catch (err) {
//       console.error(err);
//     }
//   } else {
//     // For guest users, data is already loaded from local storage
//     renderPrescriptionList();
//     updateUploadState();
//   }
// }

// // Fetch cart
// // Fetch cart
// async function fetchCart() {
//   if (isLoggedIn) {
//     try {
//       const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//       const userId = currentUser.id;
      
//       const cartRes = await fetch(`http://localhost:3000/cart?user_id=${userId}`);
//       if (!cartRes.ok) throw new Error("Failed to fetch cart");
//       const cartData = await cartRes.json();

//       const medRes = await fetch("http://localhost:3000/medicine");
//       if (!medRes.ok) throw new Error("Failed to fetch medicines");
//       const medicines = await medRes.json();

//       cartItems = cartData.map(cartItem => {
//         const product = medicines.find(m => String(m.id) === String(cartItem.product_id));
//         return { 
//           ...cartItem, 
//           ...product,
//           cartItemId: cartItem.id, // Preserve the cart item ID
//           id: cartItem.product_id // Use product_id as id for consistency
//         };
//       });

//       productsRequiringPrescription = cartItems.filter(i => i.tag).length;
//       renderCart(cartItems);
//       renderOrderSummary(cartItems);
//       updateUploadState();
//     } catch (err) {
//       console.error(err);
//     }
//   } else {
//     // For guest users, data is already loaded from local storage
//     productsRequiringPrescription = cartItems.filter(i => i.tag).length;
//     renderCart(cartItems);
//     renderOrderSummary(cartItems);
//     updateUploadState();
//   }
// }

// // Render cart
// function renderCart(cartItems) {
//   const container = document.getElementById("cartItems");
//   if (!container) return;
  
//   container.innerHTML = "";

//   if (cartItems.length === 0) {
//     container.innerHTML = `
//       <div class="bg-white p-8 rounded-lg shadow-sm text-center">
//         <p class="text-gray-500 text-lg">Your cart is empty</p>
//         <a href="/frontend/src/shop/browse/browse.html" class="text-[#A1E970] hover:underline mt-4 inline-block">
//           Continue Shopping
//         </a>
//       </div>
//     `;
//     return;
//   }

//   cartItems.forEach(item => {
//     let prescriptionDropdown = "";

//     if (item.tag) {
//       const dropdownItems = prescriptions.map((p, i) => `
//         <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer" 
//              onclick="selectPrescription(${item.id}, 'P${i+1}', ${p.id})">
//           P${i+1}
//         </div>
//       `).join("");

//       const selectedLabel = item.prescriptionId ?
//         'P' + (prescriptions.findIndex(p => p.id === item.prescriptionId) + 1) :
//         'Select';

//       prescriptionDropdown = `
//         <p class="text-sm text-gray-600">Prescription required</p>
//         <div class="relative">
//           <button class="flex items-center justify-between w-24 px-3 py-2 text-sm text-gray-700 
//                          bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//                   onclick="toggleDropdown(event, ${item.id})">
//             <span id="selected-${item.id}">${selectedLabel}</span>
//             <span class="material-icons text-sm">expand_more</span>
//           </button>
//           <div id="dropdown-${item.id}" class="hidden absolute mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//             ${dropdownItems}
//           </div>
//         </div>
//       `;
//     } else {
//       prescriptionDropdown = `<p class="text-sm text-green-600">No prescription</p>`;
//     }

//     container.innerHTML += `
//       <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-3">
//         <div class="flex items-center space-x-4">
//           <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 rounded-md object-cover"/>
//           <div>
//             <p class="font-semibold text-gray-800">${item.name}</p>
//             <p class="text-sm text-gray-500">${item.composition}</p>
//             <p class="font-semibold text-gray-800 mt-1">$${item.price}</p>
//           </div>
//         </div>

//         <div class="flex flex-col items-center">
//           ${prescriptionDropdown}
//         </div>

//         <div class="flex items-center space-x-3">
//           <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})"
//             class="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
//             <span class="material-icons text-lg">remove</span>
//           </button>
//           <span class="w-8 text-center font-medium">${item.quantity}</span>
//           <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})"
//             class="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
//             <span class="material-icons text-lg">add</span>
//           </button>
//           <button onclick="removeCartItem(${item.id})" class="p-1 text-red-500 hover:text-red-700">
//             <span class="material-icons">delete</span>
//           </button>
//         </div>
//       </div>
//     `;
//   });
// }

// // Delete prescription
// async function deletePrescription(id) {
//   if (isLoggedIn) {
//     try {
//       await fetch(`http://localhost:3000/prescriptions/${id}`, { method: "DELETE" });
//       prescriptions = prescriptions.filter(p => p.id !== id);

//       // Reset prescriptionId in cart items
//       cartItems.forEach(item => {
//         if (item.prescriptionId === id) item.prescriptionId = null;
//       });

//       renderPrescriptionList();
//       renderCart(cartItems);
//       updateUploadState();
//     } catch (err) {
//       console.error(err);
//     }
//   } else {
//     // For guest users, delete from local storage
//     prescriptions = prescriptions.filter(p => p.id !== id);
    
//     // Reset prescriptionId in cart items
//     cartItems.forEach(item => {
//       if (item.prescriptionId === id) item.prescriptionId = null;
//     });
    
//     renderPrescriptionList();
//     renderCart(cartItems);
//     updateUploadState();
//     saveGuestData();
//   }
// }

// // Handle prescription upload
// function handlePrescriptionUpload(event) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const validTypes = ["image/png", "image/jpeg", "image/jpg"];
//   if (!validTypes.includes(file.type)) {
//     alert("Only PNG, JPG, JPEG allowed");
//     return;
//   }

//   const reader = new FileReader();
//   reader.onload = async function() {
//     const base64 = reader.result;
//     const prescription = { id: Date.now(), fileName: file.name, data: base64 };

//     if (isLoggedIn) {
//       try {
//         const res = await fetch("http://localhost:3000/prescriptions", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(prescription)
//         });
//         if (!res.ok) throw new Error("Failed to save prescription");

//         prescriptions.push(prescription);
//         renderPrescriptionList();
//         updateUploadState();
//         renderCart(cartItems);
//         alert("Prescription uploaded!");
//       } catch (err) {
//         console.error(err);
//       }
//     } else {
//       // For guest users, save to local storage
//       prescriptions.push(prescription);
//       renderPrescriptionList();
//       updateUploadState();
//       renderCart(cartItems);
//       saveGuestData();
//       alert("Prescription uploaded!");
//     }
//   };
//   reader.readAsDataURL(file);
// }

// // Remove product from cart
// async function removeCartItem(productId) {
//   if (isLoggedIn) {
//     try {
//       // Find the cart item to get its cartItemId
//       const itemToRemove = cartItems.find(item => item.id === productId);
      
//       if (itemToRemove && itemToRemove.cartItemId) {
//         await fetch(`http://localhost:3000/cart/${itemToRemove.cartItemId}`, { method: "DELETE" });
        
//         // Update local cartItems array
//         cartItems = cartItems.filter(i => i.id != productId);
//         productsRequiringPrescription = cartItems.filter(i => i.tag).length;
//         renderCart(cartItems);
//         renderOrderSummary(cartItems);
//         updateUploadState();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   } else {
//     // For guest users, remove from local storage
  
//     cartItems = cartItems.filter(i => i.id != productId);
//     console.log(productId);
//     productsRequiringPrescription = cartItems.filter(i => i.tag).length;
//     console.log("Updated guest cart items:", cartItems);

//     renderCart(cartItems);
//     renderOrderSummary(cartItems);
//     updateUploadState();
//     saveGuestData();
//   }
// }

// // Update quantity
// async function updateQuantity(productId, newQuantity) {
//   if (newQuantity < 1) return;
  
//   if (isLoggedIn) {
//     try {
//       // Find the cart item to get its cartItemId
//       const itemToUpdate = cartItems.find(item => item.id === productId);
      
//       if (itemToUpdate && itemToUpdate.cartItemId) {
//         await fetch(`http://localhost:3000/cart/${itemToUpdate.cartItemId}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ quantity: newQuantity })
//         });
        
//         // Update local cartItems array
//         cartItems = cartItems.map(item => 
//           item.id === productId ? {...item, quantity: newQuantity} : item
//         );
//         renderCart(cartItems);
//         renderOrderSummary(cartItems);
//         saveGuestData();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   } else {
//     // For guest users, update in local storage
//     cartItems = cartItems.map(item => 
//       item.id === productId ? {...item, quantity: newQuantity} : item
//     );
//     renderCart(cartItems);
//     renderOrderSummary(cartItems);
//     saveGuestData();
//   }
// }

// // Select prescription
// function selectPrescription(productId, label, prescriptionId) {
//   document.getElementById(`selected-${productId}`).innerText = label;
//   document.getElementById(`dropdown-${productId}`).classList.add("hidden");

//   cartItems = cartItems.map(item => item.id === productId ? {...item, prescriptionId} : item);

//   if (isLoggedIn) {
//     // Find the cart item to get its cartItemId
//     const itemToUpdate = cartItems.find(item => item.id === productId);
    
//     if (itemToUpdate && itemToUpdate.cartItemId) {
//       fetch(`http://localhost:3000/cart/${itemToUpdate.cartItemId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prescriptionId })
//       }).catch(err => console.error(err));
//     }
//   } else {
//     // For guest users, save to local storage
//     saveGuestData();
//   }
// }

// // Order summary
// function renderOrderSummary(cartItems) {
//   const container = document.getElementById("orderSummary");
//   if (!container) return;
  
//   let subtotal = 0;
//   cartItems.forEach(item => subtotal += item.price * item.quantity);
//   const shipping = 5, discount = 2, total = subtotal + shipping - discount;

//   container.innerHTML = `
//     <div class="space-y-4">
//       <div class="flex justify-between text-gray-600"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
//       <div class="flex justify-between text-gray-600"><span>Shipping</span><span>$${shipping.toFixed(2)}</span></div>
//       <div class="flex justify-between text-green-600"><span>Discount</span><span>-$${discount.toFixed(2)}</span></div>
//       <div class="border-t border-gray-200 my-4"></div>
//       <div class="flex justify-between font-bold text-gray-900 text-lg"><span>Total</span><span>$${total.toFixed(2)}</span></div>
//     </div>
//   `;
// }

// // Toggle dropdown
// function toggleDropdown(event, id) {
//   event.stopPropagation();
//   document.querySelectorAll("[id^='dropdown-']").forEach(d => {
//     if (d.id !== `dropdown-${id}`) d.classList.add("hidden");
//   });
//   const dropdown = document.getElementById(`dropdown-${id}`);
//   dropdown.classList.toggle("hidden");
// }

// // Close dropdowns when clicking outside
// document.body.addEventListener("click", () => {
//   document.querySelectorAll("[id^='dropdown-']").forEach(d => d.classList.add("hidden"));
// });

// // Function to transfer guest data to user account after login/registration
// async function transferGuestDataToUser(userId) {
//   // Get guest data from local storage
//   const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//   const guestPrescriptions = JSON.parse(localStorage.getItem('guestPrescriptions') || '[]');
  
//   if (guestCart.length > 0 || guestPrescriptions.length > 0) {
//     try {
//       // Transfer prescriptions first
//       for (const prescription of guestPrescriptions) {
//         await fetch("http://localhost:3000/prescriptions", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({...prescription, userId})
//         });
//       }
      
//       // Transfer cart items
//       for (const item of guestCart) {
//         await fetch("http://localhost:3000/cart", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({...item, user_id: userId})
//         });
//       }
      
//       // Clear guest data from local storage
//       localStorage.removeItem('guestCart');
//       localStorage.removeItem('guestPrescriptions');
      
//       console.log("Guest data successfully transferred to user account");
//     } catch (err) {
//       console.error("Error transferring guest data:", err);
//     }
//   }
// }

// // Initialize the page
// document.addEventListener("DOMContentLoaded", () => {
//   // Check if user is logged in
//   checkLoginStatus();
  
//   if (isLoggedIn) {
//     fetchPrescriptions();
//     fetchCart();
//   } else {
//     loadGuestData();
//   }
// });


// Load header/footer
// Load header/footer
// function loadComponent(id, filePath) {
//   fetch(filePath)
//     .then(res => res.text())
//     .then(data => document.getElementById(id).innerHTML = data)
//     .catch(err => console.error("Error loading component:", err));
// }

// loadComponent("header", "/frontend/src/core/components/navbar.html");
// loadComponent("footer", "/frontend/src/core/components/footer.html");

// // cart.js
// let cartItems = [];
// let prescriptions = [];

// // Function to fetch cart items from the server
// async function fetchCart() {
//     try {
//         // Try to get the current user ID from localStorage
//         const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
//         if (!currentUser || !currentUser.id) {
//             console.log('No user logged in');
//             renderCart([]);
//             return;
//         }

//         // Fetch cart items for the current user
//         const response = await fetch(`http://localhost:3000/cart?user_id=${currentUser.id}`);
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch cart items');
//         }
        
//         const cartData = await response.json();
        
//         // Extract product IDs from cart items
//         const productIds = cartData.map(item => item.product_id);
        
//         if (productIds.length === 0) {
//             renderCart([]);
//             return;
//         }
        
//         // Fetch product details for all items in the cart
//         const productsResponse = await fetch(`http://localhost:3000/products?id=${productIds.join('&id=')}`);
        
//         if (!productsResponse.ok) {
//             throw new Error('Failed to fetch medicines');
//         }
        
//         const products = await productsResponse.json();
        
//         // Combine cart items with product details
//         const itemsWithDetails = cartData.map(cartItem => {
//             const product = products.find(p => p.id === cartItem.product_id);
//             return {
//                 ...cartItem,
//                 product: product || null
//             };
//         });
        
//         cartItems = itemsWithDetails;
//         renderCart(cartItems);
//     } catch (error) {
//         console.error('Error fetching cart:', error);
//         // Fallback to localStorage if API fails
//         const savedCart = localStorage.getItem('userCart');
//         if (savedCart) {
//             cartItems = JSON.parse(savedCart);
//             renderCart(cartItems);
//         } else {
//             renderCart([]);
//         }
//     }
// }

// // Function to render cart items
// function renderCart(items) {
//     const cartContainer = document.getElementById('cartItems');
//     const orderSummary = document.getElementById('orderSummary');
    
//     if (!cartContainer || !orderSummary) return;
    
//     if (items.length === 0) {
//         cartContainer.innerHTML = `
//             <div class="p-8 text-center">
//                 <div class="empty-cart-icon mx-auto mb-4">
//                     <i class="fas fa-shopping-cart"></i>
//                 </div>
//                 <h3 class="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
//                 <p class="text-gray-500 mb-4">Add some items to get started</p>
//                 <a href="../browse/browse.html" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
//                     <i class="fas fa-store mr-2"></i> Browse Products
//                 </a>
//             </div>
//         `;
//         orderSummary.innerHTML = `
//             <div class="flex justify-between mb-2">
//                 <span>Subtotal</span>
//                 <span>$0.00</span>
//             </div>
//             <div class="flex justify-between mb-2">
//                 <span>Shipping</span>
//                 <span>$0.00</span>
//             </div>
//             <div class="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-100">
//                 <span>Total</span>
//                 <span>$0.00</span>
//             </div>
//         `;
//         return;
//     }
    
//     let cartHTML = '';
//     let subtotal = 0;
    
//     items.forEach(item => {
//         if (!item.product) return;
        
//         const itemTotal = item.product.price * item.quantity;
//         subtotal += itemTotal;
        
//         cartHTML += `
//             <div class="cart-item p-6 border-b border-gray-100 flex flex-col sm:flex-row">
//                 <div class="item-details flex flex-grow">
//                     <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
//                         <img src="${item.product.image_url || '../images/placeholder-medicine.jpg'}" 
//                              alt="${item.product.name}" 
//                              class="h-full w-full object-cover object-center">
//                     </div>
//                     <div class="flex flex-col">
//                         <h3 class="text-sm font-medium text-gray-900">${item.product.name}</h3>
//                         <p class="mt-1 text-sm text-gray-500">${item.product.manufacturer || 'Generic Manufacturer'}</p>
//                         <p class="mt-1 text-sm text-gray-500">${item.product.composition || ''}</p>
//                         ${item.product.requires_prescription ? 
//                             '<span class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Prescription Required</span>' : ''}
//                     </div>
//                 </div>
//                 <div class="item-controls flex sm:flex-col sm:justify-between sm:items-end mt-4 sm:mt-0">
//                     <div class="flex items-center border border-gray-300 rounded-md">
//                         <button class="quantity-btn px-3 py-1 text-gray-600" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
//                         <span class="px-3 py-1">${item.quantity}</span>
//                         <button class="quantity-btn px-3 py-1 text-gray-600" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
//                     </div>
//                     <div class="ml-4 sm:ml-0 sm:mt-2 flex items-center">
//                         <p class="text-sm font-medium text-gray-900">$${itemTotal.toFixed(2)}</p>
//                         <button class="ml-4 text-red-600 hover:text-red-800" onclick="removeFromCart('${item.id}')">
//                             <i class="fas fa-trash"></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     });
    
//     cartContainer.innerHTML = cartHTML;
    
//     const shipping = subtotal > 30 ? 0 : 5.99;
//     const total = subtotal + shipping;
    
//     orderSummary.innerHTML = `
//         <div class="flex justify-between mb-2">
//             <span>Subtotal (${items.length} items)</span>
//             <span>$${subtotal.toFixed(2)}</span>
//         </div>
//         <div class="flex justify-between mb-2">
//             <span>Shipping</span>
//             <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
//         </div>
//         ${subtotal < 30 ? `
//             <div class="text-sm text-green-600 mb-2">
//                 Add $${(30 - subtotal).toFixed(2)} more for free shipping!
//             </div>
//         ` : ''}
//         <div class="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-100">
//             <span>Total</span>
//             <span>$${total.toFixed(2)}</span>
//         </div>
//     `;
// }

// // Function to update item quantity
// async function updateQuantity(itemId, newQuantity) {
//     if (newQuantity < 1) {
//         removeFromCart(itemId);
//         return;
//     }
    
//     try {
//         const response = await fetch(`http://localhost:3000/cart/${itemId}`, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ quantity: newQuantity })
//         });
        
//         if (response.ok) {
//             const item = cartItems.find(i => i.id === itemId);
//             if (item) {
//                 item.quantity = newQuantity;
//                 renderCart(cartItems);
                
//                 // Update localStorage as fallback
//                 const savedCart = localStorage.getItem('userCart');
//                 if (savedCart) {
//                     const userCart = JSON.parse(savedCart);
//                     const updatedItem = userCart.find(i => i.id === itemId);
//                     if (updatedItem) {
//                         updatedItem.quantity = newQuantity;
//                         localStorage.setItem('userCart', JSON.stringify(userCart));
//                     }
//                 }
//             }
//         } else {
//             throw new Error('Failed to update quantity');
//         }
//     } catch (error) {
//         console.error('Error updating quantity:', error);
//         // Fallback to localStorage
//         const savedCart = localStorage.getItem('userCart');
//         if (savedCart) {
//             const userCart = JSON.parse(savedCart);
//             const item = userCart.find(i => i.id === itemId);
//             if (item) {
//                 item.quantity = newQuantity;
//                 localStorage.setItem('userCart', JSON.stringify(userCart));
                
//                 // Update UI
//                 const cartItem = cartItems.find(i => i.id === itemId);
//                 if (cartItem) {
//                     cartItem.quantity = newQuantity;
//                     renderCart(cartItems);
//                 }
//             }
//         }
//     }
// }

// // Function to remove item from cart
// async function removeFromCart(itemId) {
//     try {
//         const response = await fetch(`http://localhost:3000/cart/${itemId}`, {
//             method: 'DELETE'
//         });
        
//         if (response.ok) {
//             cartItems = cartItems.filter(item => item.id !== itemId);
//             renderCart(cartItems);
            
//             // Update localStorage as fallback
//             const savedCart = localStorage.getItem('userCart');
//             if (savedCart) {
//                 const userCart = JSON.parse(savedCart);
//                 const updatedCart = userCart.filter(item => item.id !== itemId);
//                 localStorage.setItem('userCart', JSON.stringify(updatedCart));
//             }
//         } else {
//             throw new Error('Failed to remove item');
//         }
//     } catch (error) {
//         console.error('Error removing item:', error);
//         // Fallback to localStorage
//         const savedCart = localStorage.getItem('userCart');
//         if (savedCart) {
//             const userCart = JSON.parse(savedCart);
//             const updatedCart = userCart.filter(item => item.id !== itemId);
//             localStorage.setItem('userCart', JSON.stringify(updatedCart));
            
//             // Update UI
//             cartItems = cartItems.filter(item => item.id !== itemId);
//             renderCart(cartItems);
//         }
//     }
// }

// // Function to handle prescription upload
// function handlePrescriptionUpload(event) {
//     const file = event.target.files[0];
//     if (!file) return;
    
//     const reader = new FileReader();
//     reader.onload = function(e) {
//         const prescriptionData = {
//             id: Date.now().toString(),
//             name: file.name,
//             data: e.target.result,
//             uploadedAt: new Date().toISOString()
//         };
        
//         prescriptions.push(prescriptionData);
//         renderPrescriptionList();
        
//         // Save to localStorage
//         localStorage.setItem('userPrescriptions', JSON.stringify(prescriptions));
//     };
//     reader.readAsDataURL(file);
// }

// // Function to render prescription list
// function renderPrescriptionList() {
//     const prescriptionList = document.getElementById('prescriptionList');
//     if (!prescriptionList) return;
    
//     prescriptionList.innerHTML = '';
    
//     prescriptions.forEach(prescription => {
//         const div = document.createElement('div');
//         div.className = 'prescription-thumb relative group cursor-pointer';
//         div.innerHTML = `
//             <img src="${prescription.data}" 
//                  alt="${prescription.name}" 
//                  class="w-24 h-24 object-cover rounded-lg border border-gray-200"
//                  onclick="viewPrescription('${prescription.data}')">
//             <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
//                 <button class="text-white p-1" onclick="event.stopPropagation(); removePrescription('${prescription.id}')">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//             <p class="text-xs text-gray-500 mt-1 truncate">${prescription.name}</p>
//         `;
//         prescriptionList.appendChild(div);
//     });
// }

// // Function to view prescription in modal
// function viewPrescription(data) {
//     document.getElementById('modalImage').src = data;
//     document.getElementById('prescriptionModal').classList.remove('hidden');
// }

// // Function to close prescription modal
// function closePrescriptionModal() {
//     document.getElementById('prescriptionModal').classList.add('hidden');
// }

// // Function to remove prescription
// function removePrescription(id) {
//     prescriptions = prescriptions.filter(p => p.id !== id);
//     renderPrescriptionList();
    
//     // Update localStorage
//     localStorage.setItem('userPrescriptions', JSON.stringify(prescriptions));
// }

// // Initialize cart on page load
// document.addEventListener('DOMContentLoaded', function() {
//     // Load prescriptions from localStorage
//     const savedPrescriptions = localStorage.getItem('userPrescriptions');
//     if (savedPrescriptions) {
//         prescriptions = JSON.parse(savedPrescriptions);
//         renderPrescriptionList();
//     }
    
//     // Fetch cart items
//     fetchCart();
    
//     // Close modal when clicking outside
//     document.getElementById('prescriptionModal').addEventListener('click', function(e) {
//         if (e.target === this) {
//             closePrescriptionModal();
//         }
//     });
// });




// Load header/footer

    // Load header/footer with improved error handling
    function loadComponent(id, filePath) {
      fetch(filePath)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${filePath}`);
          return res.text();
        })
        .then(data => {
          const element = document.getElementById(id);
          if (element) {
            element.innerHTML = data;
            // Reattach event listeners after loading
            setTimeout(attachEventListeners, 100);
          }
        })
        .catch(err => console.error("Error loading component:", err));
    }
    
    // Load components
    document.addEventListener('DOMContentLoaded', function() {
      loadComponent("header", "/frontend/src/core/components/navbar.html");
      loadComponent("footer", "/frontend/src/core/components/footer.html");
      initPage();
    });
    
    let prescriptions = []; // {id, image_url, status, verification_notes}
    let cartItems = []; // fetched cart items
    let productsRequiringPrescription = 0;
    let isLoggedIn = false;
    let currentUserId = null;
  
    // Attach event listeners to prevent undefined reference errors
    function attachEventListeners() {
      // Close modal when clicking outside
      const modal = document.getElementById("prescriptionModal");
      if (modal) {
        modal.addEventListener('click', function(e) {
          if (e.target == modal) closePrescriptionModal();
        });
      }
      
      // Close modal with escape key
      document.addEventListener('keydown', function(e) {
        if (e.key == 'Escape') closePrescriptionModal();
      });
    }
  
    // Show notification
    function showNotification(message, type = 'success', duration = 3000) {
      const notification = document.createElement('div');
      notification.className = `notification-banner notification-${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, duration);
    }
    
    // Function declarations
    function renderPrescriptionList() {
      const container = document.getElementById("prescriptionList");
      const noPrescriptionsText = document.getElementById("noPrescriptionsText");
      
      if (!container) return;
      
      container.innerHTML = "";
      
      if (prescriptions.length == 0) {
        if (noPrescriptionsText) noPrescriptionsText.classList.remove("hidden");
        return;
      }
      
      if (noPrescriptionsText) noPrescriptionsText.classList.add("hidden");
      
      prescriptions.forEach((p, i) => {
        const statusClass = p.status == 'approved' ? 'status-approved' : 
                           p.status == 'rejected' ? 'status-rejected' : 
                           p.status == 'pending' ? 'status-pending' : '';
        
        const statusText = p.status == 'approved' ? 'Approved' : 
                          p.status == 'rejected' ? 'Rejected' : 
                          p.status == 'pending' ? 'Pending' : 'Not Verified';
        
        container.innerHTML += `
          <div class="relative border border-gray-300 rounded-md p-2 flex flex-col items-center cursor-pointer">
            <img src="${p.image_url}" class="w-24 h-24 object-cover rounded-md" onclick="viewPrescription('${p.image_url}')"/>
            <button onclick="deletePrescription(${p.id})" class="absolute top-0 right-0 text-red-500 font-bold p-1 rounded-full bg-white hover:bg-red-100">×</button>
            <span class="text-sm mt-1">P${i+1}</span>
            <span class="verification-status ${statusClass} mt-1">${statusText}</span>
            ${p.status == 'rejected' && p.verification_notes ? `
              <div class="text-xs text-red-600 mt-1 text-center max-w-24 break-words">
                ${p.verification_notes}
              </div>
            ` : ''}
          </div>
        `;
      });
    }
    
    function viewPrescription(image_url) {
      const modal = document.getElementById("prescriptionModal");
      const modalImage = document.getElementById("modalImage");
      
      if (!modal || !modalImage) return;
      
      modalImage.src = image_url;
      modal.classList.remove("hidden");
    }
    
    function closePrescriptionModal() {
      const modal = document.getElementById("prescriptionModal");
      if (modal) modal.classList.add("hidden");
    }
    
    function updateUploadState() {
      const browseBtn = document.getElementById("browseBtn");
      if (!browseBtn) return;
      // Allow unlimited prescription uploads for reuse
      browseBtn.disabled = false;
      browseBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
    
    function updateVerifyButton() {
      const verifyBtn = document.getElementById("verifyBtn");
      if (!verifyBtn) return;
      
      const hasUnverifiedPrescriptions = cartItems.some(item => 
        item.requires_prescription && item.prescriptionId && 
        !prescriptions.find(p => p.id == item.prescriptionId)?.status
      );
      
      verifyBtn.disabled = !hasUnverifiedPrescriptions;
      verifyBtn.classList.toggle("opacity-50", !hasUnverifiedPrescriptions);
      verifyBtn.classList.toggle("cursor-not-allowed", !hasUnverifiedPrescriptions);
    }
    
    function updateCheckoutButton() {
      const checkoutBtn = document.getElementById("checkoutBtn");
      if (!checkoutBtn) return;
      
      const prescriptionItemsNeedingVerification = cartItems.filter(item => 
        item.requires_prescription && item.prescriptionId
      );
      
      const allPrescriptionItemsApproved = prescriptionItemsNeedingVerification.every(item => {
        const prescription = prescriptions.find(p => p.id == item.prescriptionId);
        return prescription && prescription.status == 'approved';
      });
      
      const canProceed = prescriptionItemsNeedingVerification.length == 0 || allPrescriptionItemsApproved;
      
      checkoutBtn.disabled = !canProceed || cartItems.length == 0;
      checkoutBtn.classList.toggle("opacity-50", !canProceed || cartItems.length == 0);
    }
    
    // Verify prescriptions function
    async function verifyPrescriptions() {
      const unverifiedPrescriptions = prescriptions.filter(p => !p.status);
      
      if (unverifiedPrescriptions.length == 0) {
        showNotification("No prescriptions need verification", "error");
        return;
      }
      
      try {
        // Update prescriptions on server
        for (const prescription of unverifiedPrescriptions) {
          const updatedPrescription = {
            ...prescription,
            status: "pending",
            customer_id: isLoggedIn ? currentUserId : "guest"
          };
          
          if (isLoggedIn) {
            // Update prescription on server for logged-in users
            await fetch(`http://localhost:3000/prescriptions/${prescription.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedPrescription)
            });
          } else {
            // For guest users, just update local data
            prescription.status = "pending";
            prescription.customer_id = "guest";
          }
          
          // Send notification to admin
          const adminNotification = {
            title: "Prescription Verification Request",
            message: `New prescription verification request from customer ${isLoggedIn ? currentUserId : "guest"}`,
            type: "verification_request",
            related_entity_type: "prescription",
            related_entity_id: prescription.id,
            is_read: false,
            recipient_user_id: null,
            created_at: new Date().toISOString()
          };
          
          // Save notification to server
          await fetch("http://localhost:3000/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adminNotification)
          });
        }
        
        // Update UI
        renderPrescriptionList();
        updateVerifyButton();
        updateCheckoutButton();
        saveGuestData();
        
        showNotification(`${unverifiedPrescriptions.length} prescription(s) sent for verification`);
        
      } catch (error) {
        console.error("Error verifying prescriptions:", error);
        showNotification("Failed to send prescriptions for verification", "error");
      }
    }
    
    // Check if user is logged in
    function checkLoginStatus() {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
        isLoggedIn = !!currentUser;
        if (isLoggedIn) {
          currentUserId = currentUser.id;
        }
      } catch (e) {
        console.error("Error checking login status:", e);
        isLoggedIn = false;
      }
    }
    
    // Load guest data from local storage
    function loadGuestData() {
      try {
        // Load prescriptions from local storage
        const storedPrescriptions = localStorage.getItem('guestPrescriptions');
        if (storedPrescriptions) {
          prescriptions = JSON.parse(storedPrescriptions);
          renderPrescriptionList();
        }
        
        // Load cart items from local storage
        const storedCart = localStorage.getItem('guestCart');
        if (storedCart) {
          const guestCart = JSON.parse(storedCart);
          fetchProductDetailsForGuestCart(guestCart);
        } else {
          cartItems = [];
          renderCart(cartItems);
          renderOrderSummary(cartItems);
        }
      } catch (e) {
        console.error("Error loading guest data:", e);
        prescriptions = [];
        cartItems = [];
        renderPrescriptionList();
        renderCart(cartItems);
        renderOrderSummary(cartItems);
      }
    }
    
    // Fetch product details for guest cart items
    async function fetchProductDetailsForGuestCart(guestCart) {
      try {
        const productsRes = await fetch("http://localhost:3000/products");
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const products = await productsRes.json();
    
        // Group cart items by product_id and sum quantities
        const groupedCart = {};
        guestCart.forEach(cartItem => {
          const key = cartItem.product_id;
          if (groupedCart[key]) {
            groupedCart[key].quantity += cartItem.quantity;
          } else {
            groupedCart[key] = { ...cartItem };
          }
        });
    
        cartItems = Object.values(groupedCart).map(cartItem => {
          const product = products.find(p => String(p.id) == String(cartItem.product_id));
          if (product) {
            return { 
              id: cartItem.product_id,
              product_id: cartItem.product_id,
              quantity: cartItem.quantity,
              prescriptionId: cartItem.prescriptionId,
              ...product 
            };
          }
          return null;
        }).filter(item => item != null);
    
        productsRequiringPrescription = cartItems.filter(i => i.requires_prescription).length;
        renderCart(cartItems);
        renderOrderSummary(cartItems);
        updateUploadState();
        updateVerifyButton();
        updateCheckoutButton();
      } catch (err) {
        console.error("Error fetching product details:", err);
        cartItems = guestCart.map(cartItem => ({
          id: cartItem.product_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          prescriptionId: cartItem.prescriptionId,
          name: "Product " + cartItem.product_id,
          price: 0,
          composition: "",
          image_url: "",
          requires_prescription: false
        }));
        renderCart(cartItems);
        renderOrderSummary(cartItems);
      }
    }
    
    // Save guest data to local storage
    function saveGuestData() {
      if (!isLoggedIn) {
        try {
          localStorage.setItem('guestPrescriptions', JSON.stringify(prescriptions));
          
          const guestCart = cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            prescriptionId: item.prescriptionId,
            added_at: item.added_at || new Date().toISOString()
          }));
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
        } catch (e) {
          console.error("Error saving guest data:", e);
        }
      }
    }
    
    // Fetch prescriptions
    async function fetchPrescriptions() {
      if (isLoggedIn) {
        try {
          const res = await fetch(`http://localhost:3000/prescriptions?customer_id=${currentUserId}`);
          if (!res.ok) throw new Error("Failed to fetch prescriptions");
          prescriptions = await res.json();
          renderPrescriptionList();
          updateUploadState();
          updateVerifyButton();
        } catch (err) {
          console.error(err);
        }
      } else {
        renderPrescriptionList();
        updateUploadState();
        updateVerifyButton();
      }
    }
    
    // Fetch cart
    async function fetchCart() {
      if (isLoggedIn) {
        try {
          const cartRes = await fetch(`http://localhost:3000/cart?customer_id=${currentUserId}`);
          if (!cartRes.ok) throw new Error("Failed to fetch cart");
          const cartData = await cartRes.json();
  
          const productsRes = await fetch("http://localhost:3000/products");
          if (!productsRes.ok) throw new Error("Failed to fetch products");
          const products = await productsRes.json();
  
          // Group cart items by product_id and sum quantities
          const groupedCart = {};
          cartData.forEach(cartItem => {
            const key = cartItem.product_id;
            if (groupedCart[key]) {
              groupedCart[key].quantity += cartItem.quantity;
              // Keep the latest prescription assignment
              if (cartItem.prescriptionId) {
                groupedCart[key].prescriptionId = cartItem.prescriptionId;
              }
            } else {
              groupedCart[key] = { ...cartItem };
            }
          });
  
          cartItems = Object.values(groupedCart).map(cartItem => {
            const product = products.find(p => String(p.id) == String(cartItem.product_id));
            return { 
              ...cartItem, 
              ...product,
              cartItemId: cartItem.id,
              id: cartItem.product_id
            };
          });
  
          productsRequiringPrescription = cartItems.filter(i => i.requires_prescription).length;
          renderCart(cartItems);
          renderOrderSummary(cartItems);
          updateUploadState();
          updateVerifyButton();
          updateCheckoutButton();
        } catch (err) {
          console.error("Error fetching cart:", err);
          renderCart([]);
          renderOrderSummary([]);
        }
      } else {
        productsRequiringPrescription = cartItems.filter(i => i.requires_prescription).length;
        renderCart(cartItems);
        renderOrderSummary(cartItems);
        updateUploadState();
        updateVerifyButton();
        updateCheckoutButton();
      }
    }
    
    // Render cart
    function renderCart(cartItems) {
      const container = document.getElementById("cartItems");
      const itemCount = document.getElementById("itemCount");
      if (!container) return;
      
      container.innerHTML = "";
      if (itemCount) itemCount.textContent = `${cartItems.length} items`;
    
      if (cartItems.length == 0) {
        container.innerHTML = `
          <div class="bg-white p-8 rounded-lg shadow-sm text-center">
            <p class="text-gray-500 text-lg">Your cart is empty</p>
            <a href="/frontend/src/shop/browse/browse.html" class="text-[#A1E970] hover:underline mt-4 inline-block">
              Continue Shopping
            </a>
          </div>
        `;
        return;
      }
    
      cartItems.forEach(item => {
        let prescriptionDropdown = "";
  
        if (item.requires_prescription) {
          const dropdownItems = prescriptions.map((p, i) => `
            <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer" 
                 onclick="selectPrescription(${item.id}, 'P${i+1}', ${p.id})">
              P${i+1} ${p.status ? `(${p.status})` : ''}
            </div>
          `).join("");
  
          const selectedPrescription = prescriptions.find(p => p.id == item.prescriptionId);
          const selectedLabel = selectedPrescription ?
            'P' + (prescriptions.findIndex(p => p.id == item.prescriptionId) + 1) :
            'Select';
  
          const verificationStatus = selectedPrescription?.status;
          const statusDisplay = verificationStatus ? 
            `<span class="verification-status status-${verificationStatus} ml-2">${verificationStatus}</span>` : '';
  
          prescriptionDropdown = `
            <p class="text-sm text-gray-600">Prescription required</p>
            <div class="relative flex items-center">
              <button class="flex items-center justify-between w-24 px-3 py-2 text-sm text-gray-700 
                             bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                      onclick="toggleDropdown(event, ${item.id})">
                <span id="selected-${item.id}">${selectedLabel}</span>
                <span class="material-icons text-sm">expand_more</span>
              </button>
              ${statusDisplay}
              <div id="dropdown-${item.id}" class="hidden absolute mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                ${dropdownItems}
              </div>
            </div>
            ${selectedPrescription?.status == 'rejected' && selectedPrescription?.verification_notes ? `
              <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p class="text-xs text-red-600 font-semibold">Admin Comments:</p>
                <p class="text-xs text-red-600">${selectedPrescription.verification_notes}</p>
                <button onclick="removeRejectedItem(${item.id})" class="mt-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                  Remove Item
                </button>
              </div>
            ` : ''}
          `;
        }
  
        container.innerHTML += `
          <div class="cart-item p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center">
            <div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden mr-4">
              <img src="${item.image_url || 'https://via.placeholder.com/80'}" alt="${item.name}" class="w-full h-full object-cover">
            </div>
            
            <div class="flex-grow item-details">
              <h3 class="font-medium text-gray-900">${item.name}</h3>
              <p class="text-sm text-gray-500">${item.composition || 'Medicine'}</p>
              <p class="text-lg font-semibold text-green-600 mt-1">$${item.price.toFixed(2)}</p>
            </div>
            
            <div class="flex flex-col sm:items-end item-controls mt-4 sm:mt-0">
              <div class="flex items-center mb-2">
                <button class="quantity-btn w-6 h-6 rounded-full flex items-center justify-center border border-gray-300" 
                        onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="mx-2 text-gray-700">${item.quantity}</span>
                <button class="quantity-btn w-6 h-6 rounded-full flex items-center justify-center border border-gray-300" 
                        onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
              </div>
              
              <div class="prescription-section mt-2">
                ${prescriptionDropdown}
              </div>
              
              <button onclick="removeItem(${item.id})" class="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center">
                <i class="fas fa-trash-alt mr-1"></i> Remove
              </button>
            </div>
          </div>
        `;
      });
    }
    
    // Render order summary
    function renderOrderSummary(cartItems) {
      const container = document.getElementById("orderSummary");
      if (!container) return;
      
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 30 || subtotal == 0 ? 0 : 5;
      const total = subtotal + shipping;
      
      container.innerHTML = `
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Shipping</span>
          <span class="font-medium">${shipping == 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="flex justify-between mt-4 pt-2 border-t border-gray-100">
          <span class="text-lg font-bold">Total</span>
          <span class="text-lg font-bold">$${total.toFixed(2)}</span>
        </div>
      `;
    }
    
    // Handle prescription upload
    // Handle prescription upload
async function handlePrescriptionUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      // Create the prescription in the desired format
      const newPrescription = {
        prescription_id: Date.now(), // Use timestamp as prescription_id
        customer_id: isLoggedIn ? currentUserId : "guest",
        image_url: e.target.result,
        status: "pending", // Set to pending instead of null
        verified_by: null,
        verification_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (isLoggedIn) {
        // Save to server for logged-in users
        const response = await fetch("http://localhost:3000/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPrescription)
        });
        
        if (!response.ok) throw new Error("Failed to save prescription");
        
        const savedPrescription = await response.json();
        prescriptions.push(savedPrescription);
      } else {
        // For guest users, just add to local array
        newPrescription.id = Date.now().toString(); // Add id field for guest
        prescriptions.push(newPrescription);
      }
      
      renderPrescriptionList();
      updateUploadState();
      updateVerifyButton();
      saveGuestData();
      
      showNotification("Prescription uploaded successfully");
    } catch (error) {
      console.error("Error uploading prescription:", error);
      showNotification("Failed to upload prescription", "error");
    }
  };
  reader.readAsDataURL(file);
  
  // Reset the input
  event.target.value = '';
}
    
    // Delete prescription
    async function deletePrescription(prescriptionId) {
      try {
        if (isLoggedIn) {
          // Delete from server for logged-in users
          const response = await fetch(`http://localhost:3000/prescriptions/${prescriptionId}`, {
            method: "DELETE"
          });
          
          if (!response.ok) throw new Error("Failed to delete prescription");
        }
        
        // Remove from local array
        prescriptions = prescriptions.filter(p => p.id != prescriptionId);
        
        // Remove prescription from cart items
        cartItems.forEach(item => {
          if (item.prescriptionId == prescriptionId) {
            item.prescriptionId = null;
          }
        });
        
        renderPrescriptionList();
        renderCart(cartItems);
        updateVerifyButton();
        updateCheckoutButton();
        saveGuestData();
        
        showNotification("Prescription removed");
      } catch (error) {
        console.error("Error deleting prescription:", error);
        showNotification("Failed to delete prescription", "error");
      }
    }
    
    // Toggle dropdown
    function toggleDropdown(event, itemId) {
      event.stopPropagation();
      const dropdown = document.getElementById(`dropdown-${itemId}`);
      if (dropdown) dropdown.classList.toggle('hidden');
      
      // Close other dropdowns
      document.querySelectorAll('.dropdown').forEach(drop => {
        if (drop.id != `dropdown-${itemId}`) {
          drop.classList.add('hidden');
        }
      });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
      document.querySelectorAll('.dropdown').forEach(drop => {
        drop.classList.add('hidden');
      });
    });
    
    // Select prescription for an item
    async function selectPrescription(itemId, label, prescriptionId) {
      const item = cartItems.find(i => i.id == itemId);
      if (item) {
        item.prescriptionId = prescriptionId;
        
        if (isLoggedIn) {
          try {
            // Update cart item on server for logged-in users
            const cartRes = await fetch(`http://localhost:3000/cart?customer_id=${currentUserId}&product_id=${itemId}`);
            const cartData = await cartRes.json();
            
            if (cartData.length > 0) {
              const cartItem = cartData[0];
              await fetch(`http://localhost:3000/cart/${cartItem.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prescriptionId: prescriptionId })
              });
            }
          } catch (error) {
            console.error("Error updating cart item:", error);
          }
        }
        
        // Update selected label
        const selectedElement = document.getElementById(`selected-${itemId}`);
        if (selectedElement) {
          selectedElement.textContent = label;
        }
        
        // Close dropdown
        const dropdown = document.getElementById(`dropdown-${itemId}`);
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
        
        renderCart(cartItems);
        updateVerifyButton();
        updateCheckoutButton();
        saveGuestData();
        
        showNotification("Prescription assigned to product");
      }
    }
    
    // Update quantity
    async function updateQuantity(itemId, newQuantity) {
      if (newQuantity < 1) return;
      
      const item = cartItems.find(i => i.id == itemId);
      if (item) {
        item.quantity = newQuantity;
        
        if (isLoggedIn) {
          try {
            // Update cart item on server for logged-in users
            const cartRes = await fetch(`http://localhost:3000/cart?customer_id=${currentUserId}&product_id=${itemId}`);
            const cartData = await cartRes.json();
            
            if (cartData.length > 0) {
              const cartItem = cartData[0];
              await fetch(`http://localhost:3000/cart/${cartItem.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: newQuantity })
              });
            }
          } catch (error) {
            console.error("Error updating cart quantity:", error);
          }
        }
        
        renderCart(cartItems);
        renderOrderSummary(cartItems);
        saveGuestData();
      }
    }
    
    // Remove item from cart
    async function removeItem(itemId) {
      if (isLoggedIn) {
        try {
          // Remove from server for logged-in users
          const cartRes = await fetch(`http://localhost:3000/cart?customer_id=${currentUserId}&product_id=${itemId}`);
          const cartData = await cartRes.json();
          
          if (cartData.length > 0) {
            await fetch(`http://localhost:3000/cart/${cartData[0].id}`, {
              method: "DELETE"
            });
          }
        } catch (error) {
          console.error("Error removing item from cart:", error);
        }
      }
      
      // Remove from local array
      cartItems = cartItems.filter(i => i.id != itemId);
      renderCart(cartItems);
      renderOrderSummary(cartItems);
      updateCheckoutButton();
      saveGuestData();
      
      showNotification("Item removed from cart");
    }
    
    // Remove rejected item
    function removeRejectedItem(itemId) {
      removeItem(itemId);
    }
    
    // Proceed to checkout
    function proceedToCheckout() {
      // Check if all prescription items are approved
      const prescriptionItems = cartItems.filter(item => item.requires_prescription && item.prescriptionId);
      const allApproved = prescriptionItems.every(item => {
        const prescription = prescriptions.find(p => p.id == item.prescriptionId);
        return prescription && prescription.status == 'approved';
      });
      
      if (prescriptionItems.length > 0 && !allApproved) {
        showNotification("Please ensure all prescriptions are approved before checkout", "error");
        return;
      }
      
      if (cartItems.length == 0) {
        showNotification("Your cart is empty", "error");
        return;
      }
      
      // Save cart for checkout
      localStorage.setItem('checkoutCart', JSON.stringify(cartItems));
      
      // Redirect to checkout page
      window.location.href = "/frontend/src/checkout/checkout.html";
    }
    
    // Initialize the page
    function initPage() {
      checkLoginStatus();
      if (isLoggedIn) {
        fetchCart();
        fetchPrescriptions();
      } else {
        loadGuestData();
      }
      attachEventListeners();
    }
