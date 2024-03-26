export const baseURL = "http://localhost:5678/api/";
const filterContainer = document.getElementById("FiltersContainer");
const loginButton = document.getElementById("loginButton");
const editionContainer = document.getElementById("editionContainer");
const IconPortfolio = document.querySelector(".icon-portfolio");

// // Récupère l'état de connexion depuis LocalStorage
let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

// Met à jour l'affichage Connexion/Déconnexion
loginButton.textContent = isLoggedIn ? "logout" : "login";

// Quand Connecté
if (isLoggedIn) {
  filterContainer.style.display = "none";
  editionContainer.style.display = "";
  IconPortfolio.style.display = "";
}
// Quand Déconnecté
else {
  filterContainer.style.display = "";
  editionContainer.style.display = "none";
  IconPortfolio.style.display = "none";
}

// Écoute l'événement 'DOMContentLoaded' pour s'assurer que le DOM est complètement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
  // Appelle la fonction pour charger les projets depuis l'API
  fetchAndDisplayProjects();
});

// Ajoute un écouteur d'événement de clic sur le bouton de connexion (loginButton).
loginButton.addEventListener("click", () => {
  // Vérifie si l'utilisateur est actuellement connecté en examinant la variable isLoggedIn.
  if (isLoggedIn) {
    // Si l'utilisateur est connecté (isLoggedIn est vrai), exécute les actions suivantes pour se déconnecter :

    // Supprime l'indicateur de connexion du stockage local, ce qui efface l'état de connexion persistant.
    localStorage.removeItem("isLoggedIn");
    // Supprime également le token d'authentification du stockage local.
    localStorage.removeItem("token");

    // Met à jour la variable d'état de connexion pour refléter que l'utilisateur n'est plus connecté.
    isLoggedIn = false;
    // Rafraîchit la page pour réinitialiser l'état de l'interface utilisateur en fonction du nouvel état de connexion.
    window.location.reload();
  } else {
    // Si l'utilisateur n'est pas connecté (isLoggedIn est faux), redirige vers la page de connexion.
    window.location.href = "login.html";
  }
});

// Fonction pour charger les projets et les catégories depuis l'API et les afficher
function fetchAndDisplayProjects() {
  fetch(baseURL + "works")
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((data) => {
      displayProjects(data); // Affiche les projets avec les données récupérées
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
    });

  fetch(baseURL + "categories")
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((categories) => {
      displayFilterButtons(categories); // Affiche les projets avec les données récupérées
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des catégories:", error)
    );
}

// Affiche les projets sous forme de galerie 
function displayProjects(data) {
  // Sélectionne le conteneur de la galerie dans le DOM
  const galleryContainer = document.getElementById("GalleryContainer");
  // Vide le conteneur de la galerie pour les nouveaux projets
  galleryContainer.innerHTML = "";

  // Parcourt chaque projet dans les données récupérées
  data.forEach((project) => {
    // Crée et configure un élément 'figure' pour chaque projet
    const figureElement = document.createElement("figure");
    figureElement.className = "gallery-item";
    figureElement.dataset.category = project.category.name.toLowerCase();
    figureElement.id = project.id;

    // Crée et configure un élément 'img' pour l'image du proje
    const imageElement = document.createElement("img");
    imageElement.src = project.imageUrl;
    imageElement.alt = project.title;
    imageElement.title = project.title; // Le titre s'affiche au survol de l'image

    // Crée et configure un élément 'figcaption' pour le titre du projet
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.textContent = project.title;

    // Ajoute 'img' et 'figcaption' à 'figure'
    figureElement.appendChild(imageElement);
    figureElement.appendChild(figcaptionElement);

    // Ajoute le 'figure' complété au conteneur de la galerie dans le DOM
    galleryContainer.appendChild(figureElement);
  });
}

// Affiche les boutons de filtrage des projets selon les catégories fournies.
function displayFilterButtons(categories) {
  filterContainer.innerHTML = "";

  // Crée et ajoute un bouton pour réinitialiser le filtre et afficher tous les projets.
  filterContainer.appendChild(createFilterButton("all", "Tous"));

  // Pour chaque catégorie, crée un bouton de filtre et l'ajoute au conteneur de filtres.
  categories.forEach((category) => {
    filterContainer.appendChild(
      createFilterButton(category.name.toLowerCase(), category.name)
    );
  });
}

// Crée un bouton de filtre.
function createFilterButton(filterId, filterName) {
  // Crée l'élément bouton et définit son texte et sa classe.
  const button = document.createElement("button");
  button.textContent = filterName;
  button.className = "filter-button";

  // Stocke l'identifiant du filtre dans un attribut data- pour une utilisation ultérieure.
  button.dataset.filter = filterId;

  // Ajoute un gestionnaire d'événement de clic qui filtrera les projets quand ce bouton est cliqué.
  button.addEventListener("click", () => filterProjects(filterId));
  return button;
}

// Filtre les projets affichés en fonction de l'identifiant de catégorie sélectionné.
function filterProjects(filterId) {
  // Sélectionne tous les éléments figure dans le conteneur de la galerie.
  const allProjects = document.querySelectorAll("#GalleryContainer figure");

  // Itère sur chaque projet pour déterminer s'il doit être affiché ou masqué.
  allProjects.forEach((project) => {
    // Affiche le projet si son identifiant de catégorie correspond au filtre sélectionné,
    // ou si le filtre sélectionné est "all" pour tout afficher. Sinon, masque le projet.
    project.style.display =
      filterId === "all" || project.dataset.category === filterId ? "" : "none";
  });
}
