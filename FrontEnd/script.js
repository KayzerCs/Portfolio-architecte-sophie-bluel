const baseURL = "http://localhost:5678/api/";

// Écoute l'événement 'DOMContentLoaded' pour s'assurer que le DOM est complètement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
  // Appelle la fonction pour charger les projets depuis l'API
  fetchAndDisplayProjects();
});

// Fonction pour charger les projets depuis l'API et les afficher
function fetchAndDisplayProjects() {
  fetch(baseURL + "works")
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((data) => {
      displayProjects(data); // Affiche les projets avec les données récupérées
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
    });
}

function displayProjects(data) {
  // Sélectionne le conteneur de la galerie dans le DOM
  const galleryContainer = document.querySelector(".gallery-container");
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
