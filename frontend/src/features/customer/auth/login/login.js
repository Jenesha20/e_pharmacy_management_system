document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/user");
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        alert("Login successful!");
        // Save current user in localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));

        // OPTIONAL: Merge guest cart into DB
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        if (guestCart.length > 0) {
          await fetch("http://localhost:3000/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, items: guestCart })
          });
          localStorage.removeItem("guestCart");
        }

        // Redirect to landing page
        window.location.href = "../../customer/home/landing/landing.html";
      } else {
        alert("Invalid email or password.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  });
});
