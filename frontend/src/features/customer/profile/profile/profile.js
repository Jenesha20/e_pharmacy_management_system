function loadComponent(id, filePath) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`Element with id="${id}" not found. Skipping load for ${filePath}`);
      return Promise.resolve();
    }
  
    return fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
        return response.text();
      })
      .then(data => {
        el.innerHTML = data;
        const scripts = el.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          if (script.src) newScript.src = script.src;
          else newScript.textContent = script.textContent;
          document.head.appendChild(newScript);
        });
      })
      .catch(err => console.error("Error loading component:", err));
  }
  
  // Load header and footer
  loadComponent("header", "/frontend/src/core/components/navbar.html").then(() => {
    setTimeout(() => {
      if (window.initAuth) window.initAuth();
      else if (window.refreshAuth) window.refreshAuth();
    }, 100);
  });
  loadComponent("footer", "/frontend/src/core/components/footer.html");
  
  document.addEventListener('DOMContentLoaded', function() {
    const customer = JSON.parse(localStorage.getItem("currentUser"));
    const customerId = customer.id;
  
    // ----------------- TAB NAVIGATION -----------------
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
  
    navItems.forEach(item => {
        item.addEventListener('click', function() {
          if (this.id === 'logout-btn') {
            if (confirm('Are you sure you want to logout?')) {
              alert('Logout successful!');
            }
            return;
          }
      
          const tabId = this.getAttribute('data-tab');
          if (!tabId) return; // safety check
      
          // Update active tab
          navItems.forEach(nav => {
            nav.classList.remove('active', 'bg-primary-500', 'text-white');
            nav.classList.add('hover:bg-primary-50');
          });
          this.classList.add('active', 'bg-primary-500', 'text-white');
          this.classList.remove('hover:bg-primary-50');
      
          // Show active content
          tabContents.forEach(content => content.classList.add('hidden'));
          const tabContent = document.getElementById(`${tabId}-tab`);
          if (tabContent) tabContent.classList.remove('hidden');
        });
      });
      
  
    // ----------------- PERSONAL INFO -----------------
    const API_CUSTOMER = `http://localhost:3000/customers/${customerId}`;
    const API_URL = `http://localhost:3000/customers/${customerId}`;
    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const dobInput = document.getElementById("dob");
    const genderSelect = document.getElementById("gender");
    const personalForm = document.getElementById('personal-info-form');
  
    // Fetch and populate
    fetch(API_CUSTOMER)
      .then(res => res.json())
      .then(data => {
        firstNameInput.value = data.first_name || "";
        lastNameInput.value = data.last_name || "";
        emailInput.value = data.email || "";
        phoneInput.value = data.phone_number || "";
        dobInput.value = data.date_of_birth || "";
        genderSelect.value = data.gender || "";
      })
      .catch(err => console.error("Error fetching customer data:", err));
      fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        document.getElementById("profile-pic").src = `https://ui-avatars.com/api/?name=${data.first_name}+${data.last_name}&background=3B82F6&color=fff&size=120`;
        document.getElementById("profile-name").textContent = `${data.first_name} ${data.last_name}`;
        document.getElementById("profile-email").textContent = data.email;
        document.getElementById("profile-phone").textContent = data.phone_number || '';
      })
      .catch(err => console.error("Error fetching profile info:", err));
    // Update personal info
    if (personalForm) {
      personalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const updatedData = {
          first_name: firstNameInput.value,
          last_name: lastNameInput.value,
          phone_number: phoneInput.value,
          date_of_birth: dobInput.value,
          gender: genderSelect.value
        };
        fetch(API_CUSTOMER, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData)
        })
        .then(res => {
          if (!res.ok) throw new Error("Failed to update");
          return res.json();
        })
        .then(() => alert("Profile updated successfully!"))
        .catch(err => {
          console.error(err);
          alert("Error updating profile.");
        });
      });
    }
  
    // ----------------- PASSWORD -----------------
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (newPassword !== confirmPassword) return alert('Passwords do not match!');
        alert('Password changed successfully!');
        passwordForm.reset();
      });
    }
  
    // ----------------- ADDRESS BOOK -----------------
    const API_ADDRESS = 'http://localhost:3000/customer_addresses';
    const addressList = document.getElementById('address-list');
    const addressModal = document.getElementById('address-modal');
    const addAddressBtn = document.getElementById('add-address-btn');
    const addressForm = document.getElementById('address-form');
  
    function fetchAddresses() {
      fetch(`${API_ADDRESS}?customer_id=${customerId}`)
        .then(res => res.json())
        .then(data => renderAddresses(data))
        .catch(err => console.error("Error fetching addresses:", err));
    }
  
    function renderAddresses(addresses) {
      if (!addressList) return;
      addressList.innerHTML = '';
      addresses.forEach(addr => {
        const defaultTag = addr.is_default ? `<span class="bg-success text-white text-xs font-medium ml-3 px-2 py-1 rounded">Default</span>` : '';
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-6 mb-4';
        div.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <div><span class="font-semibold text-gray-900">${addr.label}</span> ${defaultTag}</div>
            <div class="flex space-x-3">
              <button class="text-primary-500 hover:text-primary-700 edit-address" data-id="${addr.id}"><i class="fas fa-edit mr-1"></i> Edit</button>
              <button class="text-red-500 hover:text-red-700 delete-address" data-id="${addr.id}"><i class="fas fa-trash mr-1"></i> Delete</button>
            </div>
          </div>
          <div class="text-gray-500">
            <p>${addr.street}</p>
            <p>${addr.city}, ${addr.state} ${addr.zip}</p>
            <p>${addr.country}</p>
          </div>
        `;
        addressList.appendChild(div);
      });
      attachAddressEvents();
    }
  
    function attachAddressEvents() {
      document.querySelectorAll('.edit-address').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.dataset.id;
          fetch(`${API_ADDRESS}/${id}`)
            .then(res => res.json())
            .then(addr => {
              addressForm.querySelector('#address-label').value = addr.label;
              addressForm.querySelector('#address-street').value = addr.street;
              addressForm.querySelector('#address-city').value = addr.city;
              addressForm.querySelector('#address-state').value = addr.state;
              addressForm.querySelector('#address-zip').value = addr.zip;
              addressForm.querySelector('#address-country').value = addr.country;
              addressModal.dataset.editId = id;
              addressModal.style.display = 'flex';
            });
        });
      });
  
      document.querySelectorAll('.delete-address').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.dataset.id;
          if (!confirm('Are you sure you want to delete this address?')) return;
          fetch(`${API_ADDRESS}/${id}`, { method: 'DELETE' })
            .then(res => {
              if (!res.ok) throw new Error('Failed to delete');
              fetchAddresses();
            })
            .catch(err => console.error(err));
        });
      });
    }
  
    if (addAddressBtn) {
      addAddressBtn.addEventListener('click', function() {
        addressForm.reset();
        delete addressModal.dataset.editId;
        addressModal.style.display = 'flex';
      });
    }
  
    if (addressForm) {
      addressForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const addrData = {
          customer_id: customerId,
          label: addressForm.querySelector('#address-label').value,
          street: addressForm.querySelector('#address-street').value,
          city: addressForm.querySelector('#address-city').value,
          state: addressForm.querySelector('#address-state').value,
          zip: addressForm.querySelector('#address-zip').value,
          country: addressForm.querySelector('#address-country').value,
          is_default: false
        };
        const editId = addressModal.dataset.editId;
        const method = editId ? 'PATCH' : 'POST';
        const url = editId ? `${API_ADDRESS}/${editId}` : API_ADDRESS;
  
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addrData)
        })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save address');
          return res.json();
        })
        .then(() => {
          alert(editId ? 'Address updated successfully' : 'Address added successfully');
          addressModal.style.display = 'none';
          addressForm.reset();
          fetchAddresses();
        })
        .catch(err => {
          console.error(err);
          alert('Error saving address');
        });
      });
    }
  
    // Close modal when clicking outside or cancel
    const cancelAddressBtn = document.getElementById('cancel-address');
    const closeModalBtn = document.querySelector('.close-modal');
  
    if (cancelAddressBtn) cancelAddressBtn.addEventListener('click', () => addressModal.style.display = 'none');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => addressModal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === addressModal) addressModal.style.display = 'none'; });
  
    // Initial fetch
    fetchAddresses();
  });
  