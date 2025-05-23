import { registerUser } from "./auth";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm") as HTMLFormElement;

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = (document.getElementById("username") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    try {
      const response = await registerUser(username, email, password);
      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred.");
    }
  });
});
