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
  loadComponent("sidebar", "../../../core/components/sidebar.html");