const baseURL = "http://localhost:5678/api/";
const filterContainer = document.getElementById("FiltersContainer");
const loginButton = document.getElementById("loginButton");
const editionContainer = document.getElementById("editionContainer");
const IconPortfolio = document.querySelector(".icon-portfolio");
const selectImage = document.querySelector(".upload-img");
const inputFile = document.querySelector("#file");
const imgArea = document.querySelector(".img-area");
let availableCategories = [];

// Ces lignes de code sont exécutées lorsque le contenu de la page est entièrement chargé.
document.addEventListener("DOMContentLoaded", function () {
  fetchAndDisplayProjects();
  setupModal();
  updateUIBasedOnLogin();
  setupProjectSubmission();
});

//***** CE QUI CONCERNE LA CONNEXION

// Récupère le token d'authentification de la session en cours
let authToken = sessionStorage.getItem("authToken");
// Vérifie si l'utilisateur est actuellement connecté en vérifiant si le token d'authentification est présent
let isLoggedIn = authToken !== null;
// Vérifie si le token d'authentification est valide en utilisant une fonction isTokenValid()
const tokenIsValid = isTokenValid(authToken);
console.log(tokenIsValid);

// Gestion de l'affichage de l'interface utilisateur (UI) en fonction de l'état de connexion de l'utilisateur
function updateUIBasedOnLogin() {
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

  // Événement au clic sur le bouton de connexion (loginButton).
  loginButton.addEventListener("click", () => {
    // Vérifie si l'utilisateur est actuellement connecté en examinant la variable isLoggedIn.
    if (isLoggedIn) {
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("authToken"); // Utilise sessionStorage pour le token également
      isLoggedIn = false;
      window.location.reload();
    }
    // Si l'utilisateur n'est pas connecté (isLoggedIn est faux), redirige vers la page de connexion.
    else {
      window.location.href = "login.html";
    }
  });
}

// Vérifie si le token es Valide
function isTokenValid() {
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) {
    // Token absent
    return false;
  }

  try {
    // Décoder le token pour obtenir les informations, sans vérifier la signature
    const decodedToken = JSON.parse(atob(authToken.split(".")[1])); // Supposons que le token est encodé en base64
    if (!decodedToken.exp) {
      // Pas de date d'expiration, le token est invalide
      return false;
    }

    // Convertir la date d'expiration du token en millisecondes
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    if (expirationTime < currentTime) {
      // Token expiré
      return false;
    }

    // Le token est présent et non expiré
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    return false;
  }
}

//******* CHARGE LES PROJET ET CATÉGORIES DEPUIS L'API

function fetchAndDisplayProjects() {
  fetch(baseURL + "categories")
    .then((response) => response.json())
    .then((categoriesData) => {
      availableCategories = categoriesData;
      displayFilterButtons(categoriesData);
    });

  fetch(baseURL + "works")
    .then((response) => response.json())
    .then((data) => {
      const projectsWithCompleteCategories = data.map(completeProjectCategory);
      displayProjects(projectsWithCompleteCategories);
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des données:", error)
    );
}

//******* CATÉGORIES

// Cette fonction complète les informations sur la catégorie d'un projet
function completeProjectCategory(project) {
  // Recherche de la catégorie correspondante dans le tableau des catégories disponibles
  const category = availableCategories.find(
    (c) => c.id === parseInt(project.categoryId)
  );
  // Vérifie si une catégorie correspondante a été trouvée
  if (category) {
    // Met à jour les informations de catégorie du projet
    project.category = { id: category.id, name: category.name };
  }
  // Si aucune catégorie correspondante n'a été trouvée
  else {
    // Marque le projet comme "Non classifié"
    project.category = { id: null, name: "Non classifié" };
  }
  // Renvoie le projet complété avec les informations de catégorie
  return project;
}

// Affiche les boutons de filtrage des projets selon les catégories fournies.
function displayFilterButtons(categories) {
  // Efface le contenu précédent du conteneur de filtres
  filterContainer.innerHTML = "";

  // Ajoute un bouton "Tous" au conteneur de filtres
  filterContainer.appendChild(createFilterButton("all", "Tous"));

  // Pour chaque catégorie, crée et ajoute un bouton de filtre au conteneur de filtres
  categories.forEach((category) => {
    filterContainer.appendChild(
      // Crée un bouton de filtre avec le texte en minuscules correspondant au nom de la catégorie,
      // tout en utilisant le nom de la catégorie original comme texte visible sur le bouton.
      createFilterButton(category.name.toLowerCase(), category.name)
    );
  });
}

// Crée un bouton de filtre.
function createFilterButton(filterId, filterName) {
  const button = document.createElement("button");
  // indiquez au navigateur d'afficher le contenu de filterName à l'intérieur du bouton.
  button.textContent = filterName;
  button.className = "filter-button";
  // Stocke l'ID du filtre dans l'attribut de données 'filter' du bouton.
  button.dataset.filter = filterId;

  // Événement au clic qui filtrera les projets quand ce bouton est cliqué.
  button.addEventListener("click", () => filterProjects(filterId));
  // Renvoie l'élément bouton créé pour une utilisation ultérieure.
  return button;
}

// Filtre les projets affichés en fonction de la catégorie sélectionné.
function filterProjects(filterId) {
  const allProjects = document.querySelectorAll(
    "#GalleryContainerOriginal figure"
  );

  // Parcourt chaque projet dans la liste "allProjects"
  allProjects.forEach((project) => {
    // Détermine si le projet doit être affiché en fonction du filtre sélectionner.
    project.style.display =
      // Affiche le projet si le filtre est "all" ou si sa catégorie correspond au filtre, sinon le masque.
      filterId === "all" || project.dataset.category === filterId ? "" : "none";
  });
}

//******* PROJET

// Fonction principale pour afficher les projets dans les galeries.
function displayProjects(data) {
  // Containers Galleries
  const galleryContainerOriginal = document.getElementById(
    "GalleryContainerOriginal"
  );
  const galleryContainerModal = document.getElementById(
    "GalleryContainerModal"
  );

  // Vide les containers
  galleryContainerOriginal.innerHTML = "";
  galleryContainerModal.innerHTML = "";

  // Pour chaque élément dans le tableau 'data', réalise les opérations suivantes :
  data.forEach((project) => {
    // Crée un nouvel élément 'figure' pour représenter le projet dans la galerie d'origine.
    const figureElementOriginal = createGalleryItem(
      // Il s'agit de l'objet représentant le projet ou l'image à afficher.
      project,
      //  représente la classe CSS à appliquer à l'élément figure.
      "gallery-item-original",
      false
    );

    // Ajoute l'élément 'figure' créé à la galerie d'origine dans le document HTML.
    galleryContainerOriginal.appendChild(figureElementOriginal);

    // Crée un nouvel élément 'figure' pour représenter le projet dans la galerie modale.
    const figureElementModal = createGalleryItem(
      project,
      "gallery-item-modal",
      true
    );

    // Ajoute l'élément 'figure' créé à la galerie modale dans le document HTML.
    galleryContainerModal.appendChild(figureElementModal);
  });
}

// Fonction pour créer un élément de galerie (figure).
function createGalleryItem(project, className, isModal) {
  // Création d'un élément 'figure' et configuration de ses propriétés
  const figureElement = document.createElement("figure");
  figureElement.className = `${className} project`;
  figureElement.dataset.category = project.category.name.toLowerCase();
  figureElement.setAttribute("data-id", project.id);

  // Création et configuration de l'élément 'img' pour l'image du projet
  const imageElement = document.createElement("img");
  imageElement.src = project.imageUrl;
  imageElement.alt = project.title;
  imageElement.title = project.title;

  // Ajout de l'image au 'figure'
  figureElement.appendChild(imageElement);

  if (isModal) {
    // Pour la galerie modale, ajout d'un bouton qui contiendra l'icône de corbeille pour la suppression
    const button = document.createElement("button");
    button.className = "delete-btn";
    button.setAttribute("type", "button");

    // Création de l'icône de corbeille et ajout au bouton
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can";

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

//******* Configure et gère le comportement de la fenêtre modale dans votre interface utilisateur.
function setupModal() {
  // Événements au clic  sur icons pour affichier la modal.
  const icons = document.querySelectorAll(".icon");
  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const modal = document.getElementById("myModal");
      modal.style.display = "block";
    });
  });

  // Événements au clic  sur closeModalOriginal pour fermer la modal.
  const closeModalOriginal = document.querySelector(".modal .close-original");
  closeModalOriginal.addEventListener("click", () => {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
  });

  // Événements au clic sur addPhotoBtn pour afficher la (Modal Part 2).
  const addPhotoBtn = document.querySelector(".add-img");
  addPhotoBtn.addEventListener("click", () => {
    const firstModal = document.querySelector(".modal-original");
    firstModal.style.display = "none";
    const secondModal = document.querySelector(".modal-seconde");
    secondModal.style.display = "block";
  });

  // Événements au clic  sur closeModalSeconde pour fermer la modal.
  const closeModalSeconde = document.querySelector(".modal .close-seconde");
  closeModalSeconde.addEventListener("click", () => {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
  });

  // Événements au clic  sur backSecond pour back de (Modal Part 2) à (Modal Part 1)
  const backSecond = document.querySelector(".back-seconde");
  if (backSecond) {
    backSecond.addEventListener("click", () => {
      const originalContent = document.querySelector(".modal-original");
      const secondContent = document.querySelector(".modal-seconde");

      if (originalContent && secondContent) {
        secondContent.style.display = "none";
        originalContent.style.display = "block";
      }
    });
  }

  // Lance une requête à l'API pour récupérer les catégories.
  fetch(baseURL + `categories`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Si la réponse est un succès, convertit la réponse en JSON
      return response.json();
    })
    // Traite les données JSON une fois qu'elles sont reçues et converties
    .then((data) => {
      const select = document.querySelector("#categorie");
      select.innerHTML = "";

      // Crée une option par défaut qui sera affichée en premier dans le select
      let defaultOption = document.createElement("option");
      defaultOption.textContent = "";
      defaultOption.value = "";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      // Itère sur chaque catégorie reçue dans les données JSON
      data.forEach((categorie) => {
        let option = document.createElement("option");
        option.value = categorie.id;
        option.textContent = categorie.name;
        select.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Impossible de charger les catégories :", error);
    });

  // Événement au clic sur selectImage pour déclencher la sélection de fichier
  selectImage.addEventListener("click", function () {
    inputFile.click();
  });

  // Fonction pour gérer le chargement et l'affichage de l'image sélectionnée
  function handleFileChange() {
    const image = inputFile.files[0];
    if (image) {
      const reader = new FileReader();

      // Définit ce qui doit se passer une fois que le fichier est lu
      reader.onload = () => {
        // Cela assure que seulement une image est affichée à la fois
        const existingImg = imgArea.querySelector("img");
        if (existingImg) {
          imgArea.removeChild(existingImg);
        }

        const imgUrl = reader.result;
        const img = document.createElement("img");
        img.src = imgUrl;
        img.classList.add("changeable-image");
        imgArea.appendChild(img);
      };

      // Lit le fichier et déclenche l'événement `onload` une fois la lecture terminée.
      reader.readAsDataURL(image);
    }
  }

  // Écouteur d'événement sur inputFile pour détecter quand un utilisateur sélectionne un fichier.
  inputFile.addEventListener("change", handleFileChange);

  // Événement au clic sur imgArea pour re sélectionner un fichier.
  imgArea.addEventListener("click", function (event) {
    if (event.target.classList.contains("changeable-image")) {
      inputFile.click();
    }
  });
}

//******* Initialise l'écouteur d'événements sur le bouton de soumission pour gérer la soumission de projets.
function setupProjectSubmission() {
  document
    .querySelector(".valide")
    .addEventListener("click", handleProjectSubmission);
}

//******* Gère la soumission d'un nouveau projet en validant et préparant les données du formulaire.
function handleProjectSubmission() {
  const fileInput = document.querySelector('input[type="file"]');
  const file = fileInput ? fileInput.files[0] : null;
  const title = document.querySelector("#titre").value;
  const category = document.querySelector("#categorie").value;

  if (!validateFormData(file, title, category)) {
    return;
  }
  const formData = buildFormData(file, title, category);
  submitFormData(formData);
}

//******* Soumet les données de projet à l'API via POST, traite la réponse pour mise à jour de l'UI, et gère les erreurs potentielles.
function submitFormData(formData) {
  if (!isTokenValid()) {
    console.error(
      "Token invalide ou manquant. Impossible de soumettre les données."
    );
    return;
  }

  fetch(baseURL + "works", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.id && data.imageUrl && data.title && data.categoryId) {
        const completedProject = completeProjectCategory(data);
        addToGalleries(completedProject);
      } else {
        console.error("Données du projet incomplètes", data);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout du projet:", error);
    });
}

//******* Valide le fichier, le titre, et la catégorie du formulaire avant envoi : vérifie la présence et la taille adéquate de l'image.
function validateFormData(file, title, categoryId) {
  // Sélectionnez l'élément qui affichera le message d'erreur
  const errorMessageElement = document.getElementById("error-message-modal");

  if (!file || !title.trim() || !categoryId) {
    errorMessageElement.textContent =
      "Tous les champs sont requis (image, titre, catégorie).";
    errorMessageElement.style.display = "block"; //
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 3500);
    return false;
  }

  const MAX_SIZE_ALLOWED = 4 * 1024 * 1024; // 4MB
  if (file.size > MAX_SIZE_ALLOWED) {
    errorMessageElement.textContent =
      "La taille de l'image dépasse la limite autorisée de 4MB.";
    errorMessageElement.style.display = "block";
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 3500);
    return false;
  }
  return true;
}

//******* Construit un objet FormData pour l'envoi de fichiers et de données de projet via une requête HTTP.
function buildFormData(file, title, category) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", category);
  return formData;
}

//******* Ajoute un élément de projet aux galeries originale et modale, puis réinitialise la modale de soumission.
function addToGalleries(project) {
  const figureElementOriginal = createGalleryItem(
    project,
    "gallery-item-original",
    false
  );
  document
    .getElementById("GalleryContainerOriginal")
    .appendChild(figureElementOriginal);

  const figureElementModal = createGalleryItem(
    project,
    "gallery-item-modal",
    true
  );
  document
    .getElementById("GalleryContainerModal")
    .appendChild(figureElementModal);

  closeModalAndResetForm();
}

//******* Fonction pour fermer la modale et réinitialiser le formulaire une fois l'action faite
function closeModalAndResetForm() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";

  const form = document.getElementById("addProjectForm");
  form.reset();

  const categorySelect = document.getElementById("categorie");
  categorySelect.value = "";

  const imgPreview = document.querySelector(".changeable-image");
  imgPreview.remove();
}

//******* Fonction pour supprimer un projet via l'API et mettre à jour l'interface utilisateur, avec gestion des erreurs et authentification.
function deleteProject(projectId) {
  if (!isTokenValid()) {
    console.error(
      "Token invalide ou manquant. Impossible de supprimer l'élément."
    );
    return;
  }

  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        response
          .json()
          .then((errorDetails) => {
            console.error("Détails de l'erreur :", errorDetails);
          })
          .catch((jsonError) => {
            console.error(
              "Erreur lors de la lecture des détails de l'erreur:",
              jsonError
            );
          });
        throw new Error(
          `La suppression du projet a échoué avec le statut : ${response.status}`
        );
      }
      removeProjectFromDOM(projectId);
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression du projet:", error);
    });
}

//******* Fonction pour supprimer un projet du DOM en utilisant son ID de projet.
function removeProjectFromDOM(projectId) {
  document
    .querySelectorAll(`.project[data-id="${projectId}"]`)
    .forEach((project) => {
      project.remove();
    });
}

//******* Écoute les clics sur deux conteneurs de galerie et, lorsqu'un bouton de suppression est cliqué, il déclenche la suppression du projet associé en utilisant l'ID stocké dans son attribut data-id
document
  .querySelectorAll("#GalleryContainerModal, #GalleryContainerOriginal")
  .forEach((container) => {
    container.addEventListener("click", function (event) {
      const deleteBtn = event.target.closest(".delete-btn");
      if (deleteBtn) {
        const projectElement = deleteBtn.closest(".project");
        if (projectElement) {
          const projectId = projectElement.getAttribute("data-id");
          if (projectId) {
            deleteProject(projectId);
          } else {
            console.error(
              "Impossible de trouver l'élément projet avec un ID valide."
            );
          }
        }
      }
    });
  });
