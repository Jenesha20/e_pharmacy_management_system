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


// Initialize sidebar
loadComponent("sidebar", "../../../core/components/sidebar.html");

// Render CanvasJS Chart
window.onload = function () {
  var chart = new CanvasJS.Chart("reportChart", {
    animationEnabled: true,
    data: [{
      type: "doughnut",
      innerRadius: 60,
      dataPoints: [
        { y: 120, label: "Total Purchase", color: "#ef4444" },
        { y: 90,  label: "Cash Received", color: "#facc15" },
        { y: 150, label: "Bank Receive", color: "#3b82f6" },
        { y: 60,  label: "Total Service", color: "#22c55e" }
      ]
    }]
  });
  chart.render();
}
