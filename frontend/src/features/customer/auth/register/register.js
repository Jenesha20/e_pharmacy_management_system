document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreed = document.getElementById("agree").checked;

    // Validation
    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!agreed) {
      alert("You must agree to our Policy and T&C.");
      return;
    }

    const userData = { email, password };

    try {
      const response = await fetch("http://localhost:3000/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error("Failed to register user");

      const newUser = await response.json();

      alert("Registration successful!");

      // Save new user as current user (auto-login after registration)
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      // Redirect to landing page
      window.location.href = "../../customer/home/landing/landing.html";
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  });
});
