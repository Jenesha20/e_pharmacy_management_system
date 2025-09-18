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
  
  loadComponent("sidebar", "../../../core/components/sidebar.html");


// inventory_addition.js

document.addEventListener("DOMContentLoaded", () => {

    // Populate Category Dropdown
    const categories = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment"];
    const categorySelect = document.getElementById("medicine-category");
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.toLowerCase();
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  
    // Populate Prescription Tag Dropdown
    const prescriptionTags = ["OTC", "Rx", "Controlled"];
    const tagSelect = document.getElementById("prescription-tag");
    prescriptionTags.forEach(tag => {
      const option = document.createElement("option");
      option.value = tag.toLowerCase();
      option.textContent = tag;
      tagSelect.appendChild(option);
    });
  
    // Expiry Date Validation
    const expiryInput = document.getElementById("expiry-date");
    expiryInput.addEventListener("input", () => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      expiryInput.style.borderColor = regex.test(expiryInput.value) ? "" : "red";
    });
  
    // Photo Upload Preview
    const photoInput = document.getElementById("medicine-photos");
    const previewContainer = document.getElementById("photo-preview");
  
    photoInput.addEventListener("change", () => {
      previewContainer.innerHTML = "";
      const files = Array.from(photoInput.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.classList.add("w-20", "h-20", "object-cover", "rounded-md", "border");
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  
    // Form Submission
    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const formData = {
        name: document.getElementById("medicine-name").value.trim(),
        id: document.getElementById("medicine-id").value.trim(),
        category: categorySelect.value,
        quantity: document.getElementById("quantity").value.trim(),
        expiry: expiryInput.value.trim(),
        prescription: tagSelect.value,
        howToUse: document.getElementById("how-to-use").value.trim(),
        sideEffects: document.getElementById("side-effects").value.trim(),
        photos: Array.from(photoInput.files) // Array of File objects
      };
  
      // Simple Validation
      for (let key in formData) {
        if (key !== "photos" && !formData[key]) {
          alert(`Please fill in the ${key} field.`);
          return;
        }
      }
  
      console.log("Medicine Details Submitted:", formData);
      form.reset();
      previewContainer.innerHTML = "";
      alert("Medicine details saved successfully!");
    });
  
  });
  