export const baseURL = "http://localhost:5678/api/";
const filterContainer = document.getElementById("FiltersContainer");
const loginButton = document.getElementById("loginButton");
const editionContainer = document.getElementById("editionContainer");
const IconPortfolio = document.querySelector(".icon-portfolio");
const selectImage = document.querySelector(".upload-img");
const inputFile = document.querySelector("#file");
const imgArea = document.querySelector(".img-area");

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

  // Sélectionne le bouton "Ajouter une photo" par son id et attache un gestionnaire d'événements de clic.
  const addPhotoBtn = document.querySelector(".add-img");
  addPhotoBtn.addEventListener("click", () => {
    // Sélectionne la première modal par son identifiant et la cache.
    const firstModal = document.querySelector(".modal-original"); // Assurez-vous que c'est le bon ID
    firstModal.style.display = "none";

    // Sélectionne la seconde modal par son identifiant et l'affiche.
    const secondModal = document.querySelector(".modal-seconde"); // Assurez-vous que c'est le bon ID
    secondModal.style.display = "block";
  });

  // Sélectionne un second bouton de fermeture dans la modale et réalise la même action que le premier
  // bouton de fermeture pour cacher la modale lors du clic.
  const closeModalSeconde = document.querySelector(".modal .close-seconde");
  closeModalSeconde.addEventListener("click", () => {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
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

  // Lance une requête à l'API pour récupérer les catégories.
  fetch(baseURL + `categories`)
    // Lorsque la requête est effectuée, `.then()` reçoit la réponse.
    .then((response) => {
      // Vérifie si le statut de la réponse n'indique pas un succès (par exemple, erreur 404 ou 500).
      if (!response.ok) {
        // Lance une erreur si la réponse est erronée, ce qui stoppe l'exécution normale et passe au `.catch()`.
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Si la réponse est OK, convertit le corps de la réponse en JSON.
      return response.json();
    })
    // Une fois la réponse convertie en JSON, cette partie du code est exécutée.
    .then((data) => {
      // Sélectionne l'élément HTML 'select' par son ID 'categorie'.
      const select = document.querySelector("#categorie");
      // Vide l'élément 'select' pour s'assurer qu'il n'y a pas d'options précédentes.
      select.innerHTML = "";

      // Itère sur chaque catégorie reçue dans les données JSON.
      data.forEach((categorie) => {
        // Crée un nouvel élément 'option'.
        let option = document.createElement("option");
        // Attribue l'ID de la catégorie comme valeur de l'option pour l'utiliser plus tard.
        option.value = categorie.id;
        // Met le nom de la catégorie comme texte visible dans l'option.
        option.textContent = categorie.name;
        // Ajoute l'option créée au 'select'.
        select.appendChild(option);
      });
    })
    // En cas d'erreur à n'importe quelle étape ci-dessus, le code dans `.catch()` est exécuté.
    .catch((error) => {
      // Affiche l'erreur dans la console du navigateur.
      console.error("Could not load categories:", error);
    });

  // Écouteur d'événement sur selectImage pour déclencher la sélection de fichier
  selectImage.addEventListener("click", function () {
    inputFile.click();
  });

  // Fonction pour gérer le chargement et l'affichage de l'image sélectionnée
  // Fonction pour gérer le chargement et l'affichage de l'image sélectionnée
  function handleFileChange() {
    // Récupère le premier fichier sélectionné par l'utilisateur
    const image = inputFile.files[0];

    // Vérifie si un fichier a été sélectionné
    if (image) {
      // Crée un nouvel objet FileReader pour lire le contenu du fichier
      const reader = new FileReader();

      // Définit ce qui doit se passer une fois que le fichier est lu
      reader.onload = () => {
        // Recherche une image existante dans imgArea et la supprime si elle existe
        // Cela assure que seulement une image est affichée à la fois
        const existingImg = imgArea.querySelector("img");
        if (existingImg) {
          imgArea.removeChild(existingImg);
        }

        // Crée une nouvelle balise <img> et définit son URL source avec le résultat de FileReader
        const imgUrl = reader.result;
        const img = document.createElement("img");
        img.src = imgUrl;

        // Ajoute une classe à l'image pour identification facile et application de styles CSS
        img.classList.add("changeable-image");

        // Ajoute l'image nouvellement créée au conteneur imgArea pour l'afficher sur la page
        imgArea.appendChild(img);
      };

      // Commence la lecture du fichier sélectionné et convertit le fichier en Data URL
      // Une Data URL est une chaîne de caractères qui représente le fichier, permettant son affichage comme source d'image
      reader.readAsDataURL(image);
    }
  }

  // Ajoute un écouteur d'événement sur inputFile pour détecter quand un utilisateur sélectionne un fichier
  inputFile.addEventListener("change", handleFileChange);

  // Ajoute un écouteur d'événements sur imgArea pour gérer les clics sur les images à l'intérieur
  // Cela permet de redéclencher la sélection de fichier quand l'utilisateur clique sur l'image affichée
  imgArea.addEventListener("click", function (event) {
    // Vérifie si l'élément cliqué a la classe "changeable-image"
    if (event.target.classList.contains("changeable-image")) {
      // Si oui, cela signifie que l'utilisateur a cliqué sur l'image
      // Déclenche alors un clic sur inputFile pour ouvrir la boîte de dialogue de sélection de fichier
      inputFile.click();
    }
  });
}

//******* Définition de la fonction deleteProject, qui prend en argument l'ID du projet à supprimer.
function deleteProject(projectId) {
  // Récupère le token d'authentification stocké dans le localStorage du navigateur.
  const token = localStorage.getItem("token");

  // Effectue une requête HTTP DELETE vers l'API pour supprimer le projet spécifié par projectId.
  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE", // Spécifie la méthode HTTP DELETE pour la requête.
    headers: {
      // Inclut le token d'authentification dans les en-têtes de la requête,
      // formaté comme un Bearer token.
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      // Première fonction de rappel .then : vérifie la réponse de l'API.
      if (!response.ok) {
        // Si la réponse n'est pas OK (par exemple, status 200), lance une exception.
        throw new Error("La suppression du projet a échoué.");
      }
      // Si la réponse est OK, parse le corps de la réponse comme JSON.
      // Cela est souvent une formalité avec des APIs REST, même si le contenu n'est pas toujours utile après une suppression.
      return response.json();
    })
    .then(() => {
      // Deuxième fonction de rappel .then : exécutée après la résolution de response.json().
      console.log("Projet supprimé avec succès de l'API");
      // Appelle la fonction removeProjectFromDOM avec l'ID du projet,
      // pour le supprimer également de l'interface utilisateur.
      removeProjectFromDOM(projectId);
    })
    .catch((error) => {
      // Fonction de rappel .catch pour attraper les erreurs survenues dans la chaîne de promesses.
      // Ceci inclut les erreurs lancées manuellement dans le premier .then ainsi que les erreurs de réseau.
      console.error("Erreur lors de la suppression du projet:", error);
    });
}

//******* Fonction pour supprimer un projet du DOM en utilisant son ID de projet.
function removeProjectFromDOM(projectId) {
  // Sélectionne tous les éléments dans le DOM qui ont une classe `.project` et un attribut `data-id` correspondant à l'ID du projet passé en argument.
  document
    .querySelectorAll(`.project[data-id="${projectId}"]`)
    .forEach((project) => {
      // Pour chaque élément de projet trouvé, utilise la méthode `.remove()`
      // pour le supprimer du DOM. Cela retire effectivement l'élément de la page,
      // rendant la suppression du projet visuellement immédiate pour l'utilisateur.
      project.remove();
    });
}

//******* Attache un écouteur d'événements de clic aux conteneurs spécifiés. Cela permet de capturer
//******* les clics sur les boutons de suppression sans avoir besoin d'attacher des écouteurs d'événements individuellement à chaque bouton.
document
  .querySelectorAll("#GalleryContainerModal, #GalleryContainerOriginal")
  .forEach((container) => {
    container.addEventListener("click", function (event) {
      // Utilise event.target pour trouver le bouton de suppression le plus proche du clic.
      // Si un tel bouton est trouvé, cela signifie que l'utilisateur a cliqué sur un bouton de suppression.
      const deleteBtn = event.target.closest(".delete-btn");
      if (deleteBtn) {
        // Vérifie si le clic était sur un bouton de suppression.
        // Trouve l'élément du projet le plus proche à partir du bouton de suppression.
        // Cela permet de s'assurer que l'action de suppression est liée à l'élément correct.
        const projectElement = deleteBtn.closest(".gallery-item-modal");
        if (projectElement && projectElement.id) {
          // Vérifie si l'élément du projet et son ID existent.
          // Appelle la fonction deleteProject avec l'ID de l'élément du projet pour effectuer la suppression.
          deleteProject(projectElement.id);
        } else {
          // Affiche un message d'erreur si l'élément du projet ciblé n'a pas d'ID valide.
          console.error(
            "Impossible de trouver l'élément projet avec un ID valide."
          );
        }
      }
    });
  });
