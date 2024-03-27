export const baseURL = "http://localhost:5678/api/";
const filterContainer = document.getElementById("FiltersContainer");
const loginButton = document.getElementById("loginButton");
const editionContainer = document.getElementById("editionContainer");
const IconPortfolio = document.querySelector(".icon-portfolio");

//******* Gestion de l'affichage de l'interface utilisateur (UI) en fonction de l'état de connexion de l'utilisateur
function updateUIBasedOnLogin() {
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
}

//******* Écoute l'événement 'DOMContentLoaded' pour s'assurer que le DOM est complètement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
  // Appelle la fonction pour charger les projets depuis l'API
  fetchAndDisplayProjects();
  setupModal();
  updateUIBasedOnLogin();
});

//******* Fonction pour charger les projets et les catégories depuis l'API et les afficher
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

//******* Fonction principale pour afficher les projets dans les galeries.
function displayProjects(data) {
  // Sélection des conteneurs des galeries dans le DOM par leurs identifiants
  const galleryContainerOriginal = document.getElementById(
    "GalleryContainerOriginal"
  );
  const galleryContainerModal = document.getElementById(
    "GalleryContainerModal"
  );

  // Nettoyage des conteneurs pour s'assurer qu'ils sont vides avant d'ajouter les nouveaux éléments
  galleryContainerOriginal.innerHTML = "";
  galleryContainerModal.innerHTML = "";

  // Boucle sur chaque projet fourni dans les données
  data.forEach((project) => {
    // Création d'un élément pour la galerie originale et ajout au conteneur correspondant
    const figureElementOriginal = createGalleryItem(
      project,
      "gallery-item-original",
      false
    );
    galleryContainerOriginal.appendChild(figureElementOriginal);

    // Création d'un élément pour la galerie modale et ajout au conteneur correspondant
    const figureElementModal = createGalleryItem(
      project,
      "gallery-item-modal",
      true
    );
    galleryContainerModal.appendChild(figureElementModal);
  });
}

//******* Fonction pour créer un élément de galerie (figure) basé sur un projet.
function createGalleryItem(project, className, isModal) {
  // Création d'un élément 'figure' et configuration de ses propriétés
  const figureElement = document.createElement("figure");
  figureElement.className = className; // Classe CSS pour styliser l'élément
  figureElement.dataset.category = project.category.name.toLowerCase(); // Catégorie du projet pour éventuels filtres
  figureElement.id = project.id; // Identifiant unique du projet

  // Création et configuration de l'élément 'img' pour l'image du projet
  const imageElement = document.createElement("img");
  imageElement.src = project.imageUrl; // Source de l'image
  imageElement.alt = project.title; // Texte alternatif pour l'accessibilité
  imageElement.title = project.title; // Titre affiché au survol pour l'info-bulle

  // Ajout de l'image au 'figure'
  figureElement.appendChild(imageElement);

  if (isModal) {
    // Pour la galerie modale, ajout d'un bouton qui contiendra l'icône de corbeille pour la suppression
    const button = document.createElement("button");
    button.className = "delete-btn";
    button.setAttribute("type", "button"); // Bonne pratique pour les boutons dans les formulaires

    // Création de l'icône de corbeille et ajout au bouton
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can"; // Classe FontAwesome pour l'icône
    deleteIcon.onclick = function () {
      // Fonction appelée lors du clic sur l'icône, pour la suppression du projet
      console.log(`Supprimer le projet: ${project.id}`);
    };

    // Ajout de l'icône au bouton, puis du bouton à l'élément 'figure'
    button.appendChild(deleteIcon);
    figureElement.appendChild(button);
  } else {
    // Pour la galerie originale, ajout d'une légende avec le titre du projet
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.textContent = project.title;
    figureElement.appendChild(figcaptionElement);
  }

  // Retourne l'élément 'figure' complété pour être ajouté au DOM
  return figureElement;
}

//******* Affiche les boutons de filtrage des projets selon les catégories fournies.
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

//******* Crée un bouton de filtre.
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

//******* Filtre les projets affichés en fonction de l'identifiant de catégorie sélectionné.
function filterProjects(filterId) {
  // Sélectionne tous les éléments figure dans le conteneur de la galerie.
  const allProjects = document.querySelectorAll(
    "#GalleryContainerOriginal figure"
  );

  // Itère sur chaque projet pour déterminer s'il doit être affiché ou masqué.
  allProjects.forEach((project) => {
    // Affiche le projet si son identifiant de catégorie correspond au filtre sélectionné,
    // ou si le filtre sélectionné est "all" pour tout afficher. Sinon, masque le projet.
    project.style.display =
      filterId === "all" || project.dataset.category === filterId ? "" : "none";
  });
}

//******* Configurer et gérer le comportement d'une fenêtre modale dans votre interface utilisateur
function setupModal() {
  // Sélectionne tous les éléments avec la classe .icon et attache un gestionnaire d'événements de clic
  // pour ouvrir la modale identifiée par l'ID "myModal".
  const icons = document.querySelectorAll(".icon");
  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const modal = document.getElementById("myModal");
      modal.style.display = "block";
    });
  });

  // Sélectionne le bouton de fermeture original dans la modale et attache un gestionnaire d'événements de clic
  // pour fermer la modale en modifiant son style pour qu'elle ne soit pas affichée.
  const closeModalOriginal = document.querySelector(".modal .close-original");
  closeModalOriginal.addEventListener("click", () => {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
  });

  // Sélectionne un second bouton de fermeture dans la modale et réalise la même action que le premier
  // bouton de fermeture pour cacher la modale lors du clic.
  const closeModalSeconde = document.querySelector(".modal .close-seconde");
  closeModalSeconde.addEventListener("click", () => {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
  });

  // Ajoute un gestionnaire d'événements au niveau de la fenêtre pour fermer la modale si l'utilisateur
  // clique à l'extérieur de celle-ci (c'est-à-dire sur le fond).
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("myModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  // Sélectionne un bouton pour revenir au contenu original de la modale depuis un second contenu.
  // Si ce bouton existe, attache un gestionnaire d'événements de clic pour changer l'affichage
  // entre le contenu original et le second contenu de la modale.
  const backSecond = document.querySelector(".back-seconde");
  if (backSecond) {
    backSecond.addEventListener("click", () => {
      const originalContent = document.querySelector(".modal-original");
      const secondContent = document.querySelector(".modal-seconde");

      // Assure que les deux contenus existent avant de tenter de modifier leur affichage.
      if (originalContent && secondContent) {
        secondContent.style.display = "none"; // Cache le second contenu
        originalContent.style.display = "block"; // Montre le contenu original
      }
    });
  }
}

// Fonction pour supprimer un projet de l'API et du DOM
function deleteProject(projectId) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`, // Incluez le token dans la requête
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("La suppression du projet a échoué.");
      }
      return response.json();
    })
    .then(() => {
      console.log("Projet supprimé avec succès de L API");
      // Suppression du projet du DOM après confirmation de la suppression de l'API
      removeProjectFromDOM(projectId);
    })
    .catch((error) =>
      console.error("Erreur lors de la suppression du projet:", error)
    );
}

function removeProjectFromDOM(projectId) {
  // Suppression du projet des deux conteneurs
  document
    .querySelectorAll(`.project[data-id="${projectId}"]`)
    .forEach((project) => {
      project.remove();
    });
}

// Utilisation de la délégation d'événements pour gérer les clics sur les boutons de suppression
// dans les deux conteneurs de projets
document
  .querySelectorAll("#GalleryContainerModal, #GalleryContainerOriginal")
  .forEach((container) => {
    container.addEventListener("click", function (event) {
      const deleteBtn = event.target.closest(".delete-btn");
      if (deleteBtn) {
        const projectElement = deleteBtn.closest(".gallery-item-modal");
        // Ajoutez une vérification pour vous assurer que projectElement n'est pas null
        if (projectElement && projectElement.id) {
          const projectId = projectElement.id;
          deleteProject(projectId);
        } else {
          console.error(
            "Impossible de trouver l'élément .project ou l'élément .project n'a pas d'ID"
          );
        }
      }
    });
  });
