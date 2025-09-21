// function loadComponent(id, filePath) {
//     fetch(filePath)
//       .then(response => response.text())
//       .then(data => {
//         document.getElementById(id).innerHTML = data;
//       })
//       .catch(err => console.error("Error loading component:", err));
//   }
//   loadComponent("header", "/frontend/src/core/components/navbar.html");
//   loadComponent("footer", "/frontend/src/core/components/footer.html");

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
      // Execute any scripts in the loaded content
      const scripts = el.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
    })
    .catch(err => console.error("Error loading component:", err));
}

loadComponent("header", "/frontend/src/core/components/navbar.html").then(() => {
  // Initialize authentication after navbar is loaded
  setTimeout(() => {
    if (window.initAuth) {
      window.initAuth();
    } else if (window.refreshAuth) {
      window.refreshAuth();
    }
  }, 100);
});
loadComponent("footer", "/frontend/src/core/components/footer.html");