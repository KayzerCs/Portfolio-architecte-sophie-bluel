const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const formContainer = loginForm.parentNode;
const errorMessageDiv = document.createElement("div");
const baseURL = "http://localhost:5678/api/";

document.addEventListener("DOMContentLoaded", function () {
  errorMessageDiv.classList.add("error-message");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const loginData = {
      email: email,
      password: password,
    };

    fetch(baseURL + "users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((body) => {
            throw new Error(
              body.message || "Erreur dans l’identifiant ou le mot de passe"
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        sessionStorage.setItem("authToken", data.token); // Stockage du token dans sessionStorage
        window.location.href = "index.html"; // Redirection vers la page d'accueil
      })
      .catch((error) => {
        errorMessageDiv.textContent = error.message;
        formContainer.insertBefore(errorMessageDiv, loginForm);
        emailInput.value = "";
        passwordInput.value = "";
        setTimeout(() => errorMessageDiv.remove(), 2000);
      });
  });
});
