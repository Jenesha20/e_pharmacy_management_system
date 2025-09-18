function loadComponent(id, filePath) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id="${id}" not found. Skipping load for ${filePath}`);
    return;
  }

  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
      return response.text();
    })
    .then(data => {
      el.innerHTML = data;
    })
    .catch(err => console.error("Error loading component:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  // load header & footer after DOM is ready
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");

  // Carousel logic
  const carousel = document.getElementById("carousel");
  if (!carousel) {
    console.error("Carousel element not found!");
    return;
  }

  // Only select slide divs (exclude overlay + controls)
  const slides = carousel.querySelectorAll(":scope > div:not(.bg-black)");
  let index = 0;

  function showSlide(newIndex) {
    slides[index].classList.remove("opacity-100");
    slides[index].classList.add("opacity-0");

    slides[newIndex].classList.remove("opacity-0");
    slides[newIndex].classList.add("opacity-100");

    index = newIndex;
  }

  document.getElementById("prev").addEventListener("click", () => {
    const newIndex = (index - 1 + slides.length) % slides.length;
    showSlide(newIndex);
  });

  document.getElementById("next").addEventListener("click", () => {
    const newIndex = (index + 1) % slides.length;
    showSlide(newIndex);
  });

  // Auto-slide every 5s
  setInterval(() => {
    const newIndex = (index + 1) % slides.length;
    showSlide(newIndex);
  }, 5000);
});
