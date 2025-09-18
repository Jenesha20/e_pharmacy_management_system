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

  

   // Sample stock & sales data with dates
   const reportData = {
    "Cold": {
      stock: [
        { y: 120, label: "Paracetamol", color: "#ef4444" },
        { y: 90, label: "Cough Syrup", color: "#facc15" },
        { y: 60, label: "Vitamin C", color: "#22c55e" }
      ],
      sales: [
        { x: new Date("2025-09-10"), y: 45 },
        { x: new Date("2025-09-11"), y: 60 },
        { x: new Date("2025-09-12"), y: 35 }
      ]
    },
    "ENT": {
      stock: [
        { y: 80, label: "Nasal Spray", color: "#3b82f6" },
        { y: 40, label: "Ear Drops", color: "#f59e0b" }
      ],
      sales: [
        { x: new Date("2025-09-10"), y: 25 },
        { x: new Date("2025-09-11"), y: 40 },
        { x: new Date("2025-09-12"), y: 55 }
      ]
    },
    "Pain relief": {
      stock: [
        { y: 100, label: "Ibuprofen", color: "#a855f7" },
        { y: 70, label: "Pain Balm", color: "#f97316" }
      ],
      sales: [
        { x: new Date("2025-09-10"), y: 50 },
        { x: new Date("2025-09-11"), y: 72 },
        { x: new Date("2025-09-12"), y: 65 }
      ]
    },
    "All": {
      stock: [
        { y: 120, label: "Paracetamol", color: "#ef4444" },
        { y: 90, label: "Cough Syrup", color: "#facc15" },
        { y: 60, label: "Vitamin C", color: "#22c55e" },
        { y: 80, label: "Nasal Spray", color: "#3b82f6" },
        { y: 40, label: "Ear Drops", color: "#f59e0b" },
        { y: 100, label: "Ibuprofen", color: "#a855f7" },
        { y: 70, label: "Pain Balm", color: "#f97316" }
      ],
      sales: [
        { x: new Date("2025-09-10"), y: 71 },
        { x: new Date("2025-09-11"), y: 55 },
        { x: new Date("2025-09-12"), y: 50 }
      ]
    }
  };

  let stockChart, salesChart;

  function renderCharts(category = "All", start = null, end = null) {
    const data = reportData[category];

    // filter sales data by time range
    let filteredSales = data.sales;
    if (start && end) {
      filteredSales = data.sales.filter(d => d.x >= start && d.x <= end);
    }

    // Stock Report (doughnut)
    stockChart = new CanvasJS.Chart("reportChart", {
      animationEnabled: true,
      exportEnabled: true, // download options
      data: [{
        type: "doughnut",
        innerRadius: 60,
        dataPoints: data.stock
      }]
    });
    stockChart.render();

    // Sales Report (column with date)
    salesChart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      theme: "light1",
      axisX: { valueFormatString: "DD MMM" },
      axisY: { includeZero: true },
      data: [{
        type: "column",
        indexLabelFontSize: 12,
        dataPoints: filteredSales
      }]
    });
    salesChart.render();
  }

  window.onload = function () {
    renderCharts("All");

    document.getElementById("filterBtn").addEventListener("click", function () {
      const category = document.getElementById("categoryFilter").value || "All";
      const startDate = document.getElementById("startDate").value ? new Date(document.getElementById("startDate").value) : null;
      const endDate = document.getElementById("endDate").value ? new Date(document.getElementById("endDate").value) : null;
      renderCharts(category, startDate, endDate);
    });

    document.getElementById("resetBtn").addEventListener("click", function () {
      document.getElementById("categoryFilter").value = "";
      document.getElementById("startDate").value = "";
      document.getElementById("endDate").value = "";
      renderCharts("All");
    });

    document.getElementById("printBtn").addEventListener("click", function () {
      window.print();
    });
  }