const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const formContainer = loginForm.parentNode;
const errorMessageDiv = document.createElement("div");
const baseURL = "http://localhost:5678/api/";

// Attend que le DOM soit entièrement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
  // Ajoute la classe "error-message" à l'élément errorMessageDiv
  errorMessageDiv.classList.add("error-message");

  // Ajoute un écouteur d'événement 'submit' au formulaire de connexion (loginForm)
  loginForm.addEventListener("submit", function (e) {
    // Empêche le comportement par défaut du formulaire (rechargement de la page)
    e.preventDefault();

    // Récupère les valeurs des champs d'entrée pour l'email et le mot de passe
    const email = emailInput.value;
    const password = passwordInput.value;

    // Crée un objet loginData contenant l'email et le mot de passe
    const loginData = {
      email: email,
      password: password,
    };

    // Effectue une requête POST avec les données de connexion
    fetch(baseURL + "users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Définit le type de contenu de la requête comme JSON
      },
      body: JSON.stringify(loginData), // Convertit l'objet loginData en format JSON pour l'envoi
    })
      .then((response) => {
        // Si la réponse n'est pas OK.
        if (!response.ok) {
          // Lance une erreur avec le message de la réponse ou un message par défaut
          return response.json().then((body) => {
            throw new Error(
              body.message || "Erreur dans l’identifiant ou le mot de passe"
            );
          });
        }
        // Si la réponse est OK, retourne les données de la réponse au format JSON
        return response.json();
      })

      // data = reponse JSON
      .then((data) => {
        // Stocke le token d'authentification dans le sessionStorage
        sessionStorage.setItem("authToken", data.token);
        // Redirige l'utilisateur vers la page d'accueil (index.html)
        window.location.href = "index.html";
      })

      .catch((error) => {
        // En cas d'erreur lors du traitement de la promesse
        // Affiche le message d'erreur dans l'élément errorMessageDiv
        errorMessageDiv.textContent = error.message;
        // Insère l'élément errorMessageDiv avant le formulaire de connexion
        formContainer.insertBefore(errorMessageDiv, loginForm);
        // Efface les valeurs des champs email et mot de passe
        emailInput.value = "";
        passwordInput.value = "";
        // Supprime l'élément errorMessageDiv après 3,5 secondes
        setTimeout(() => errorMessageDiv.remove(), 3500);
      });
  });
});
