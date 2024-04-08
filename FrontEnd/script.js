const baseURL = "http://localhost:5678/api/";
const filterContainer = document.getElementById("FiltersContainer");
const loginButton = document.getElementById("loginButton");
const editionContainer = document.getElementById("editionContainer");
const IconPortfolio = document.querySelector(".icon-portfolio");
const selectImage = document.querySelector(".upload-img");
const inputFile = document.querySelector("#file");
const imgArea = document.querySelector(".img-area");
let availableCategories = [];

//******* Gestion de l'affichage de l'interface utilisateur (UI) en fonction de l'état de connexion de l'utilisateur
function updateUIBasedOnLogin() {
  // Récupère l'état de connexion depuis LocalStorage
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

  // Événement au clic sur le bouton de connexion (loginButton).
  loginButton.addEventListener("click", () => {
    // Vérifie si l'utilisateur est actuellement connecté en examinant la variable isLoggedIn.
    if (isLoggedIn) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      isLoggedIn = false;
      window.location.reload();
    }
    // Si l'utilisateur n'est pas connecté (isLoggedIn est faux), redirige vers la page de connexion.
    else {
      window.location.href = "login.html";
    }
  });
}

//******* Écoute l'événement 'DOMContentLoaded' pour s'assurer que le DOM est complètement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
  fetchAndDisplayProjects();
  setupModal();
  updateUIBasedOnLogin();
  setupProjectSubmission();
});

//******* Fonction pour charger les projets et les catégories depuis l'API et les afficher
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

// Enrichit un projet avec des détails de catégorie basés sur son categoryId, assignant une catégorie par défaut si non trouvée.
function completeProjectCategory(project) {
  // Recherche dans le tableau `availableCategories` une catégorie dont l'ID correspond à `project.categoryId`.
  const category = availableCategories.find(
    (c) => c.id === parseInt(project.categoryId)
  );
  // Si une catégorie correspondante est trouvée, met à jour `project` pour inclure les détails complets de cette catégorie.
  if (category) {
    project.category = { id: category.id, name: category.name };
  }
  // Si aucune catégorie correspondante n'est trouvée, attribue une catégorie par défaut à `project`.
  else {
    project.category = { id: null, name: "Non classifié" };
  }
  return project;
}

//******* Fonction principale pour afficher les projets dans les galeries.
function displayProjects(data) {
  const galleryContainerOriginal = document.getElementById(
    "GalleryContainerOriginal"
  );
  const galleryContainerModal = document.getElementById(
    "GalleryContainerModal"
  );

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

//******* Fonction pour créer un élément de galerie (figure).
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
    deleteIcon.onclick = function () {
      deleteProject(project.id);
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

  filterContainer.appendChild(createFilterButton("all", "Tous"));

  categories.forEach((category) => {
    filterContainer.appendChild(
      createFilterButton(category.name.toLowerCase(), category.name)
    );
  });
}

//******* Crée un bouton de filtre.
function createFilterButton(filterId, filterName) {
  const button = document.createElement("button");
  button.textContent = filterName;
  button.className = "filter-button";
  button.dataset.filter = filterId;

  // Événement au clic qui filtrera les projets quand ce bouton est cliqué.
  button.addEventListener("click", () => filterProjects(filterId));
  return button;
}

//******* Filtre les projets affichés en fonction de la catégorie sélectionné.
function filterProjects(filterId) {
  const allProjects = document.querySelectorAll(
    "#GalleryContainerOriginal figure"
  );

  // Itère sur chaque projet pour déterminer s'il doit être affiché ou masqué.
  allProjects.forEach((project) => {
    project.style.display =
      filterId === "all" || project.dataset.category === filterId ? "" : "none";
  });
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
  fetch(baseURL + "works", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
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
  const token = localStorage.getItem("token");

  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
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
