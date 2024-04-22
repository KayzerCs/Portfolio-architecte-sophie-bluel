const baseURL = "http://localhost:5678/api/";
const filterContainer = document.getElementById("FiltersContainer");
const loginButton = document.getElementById("loginButton");
const editionContainer = document.getElementById("editionContainer");
const IconPortfolio = document.querySelector(".icon-portfolio");
const selectImage = document.querySelector(".upload-img");
const inputFile = document.querySelector("#file");
const imgArea = document.querySelector(".img-area");
let CategoriesDispo = [];

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
  // Récupérer le token d'authentification depuis le stockage de session
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) {
    // Si le token est absent, le retourner comme invalide
    return false;
  }

  try {
    // Essayer de décoder le token pour obtenir les informations sans vérifier la signature.
    const decodedToken = JSON.parse(atob(authToken.split(".")[1]));
    if (!decodedToken.exp) {
      // Si le token ne contient pas de date d'expiration, le considérer comme invalide.
      return false;
    }

    // Convertir la date d'expiration du token en millisecondes.
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    if (expirationTime < currentTime) {
      // Si la date d'expiration est antérieure à l'heure actuelle, le token est expiré.
      return false;
    }

    // Si le token est présent et n'a pas expiré, le considérer comme valide.
    return true;
  } catch (error) {
    // En cas d'erreur lors de la vérification du token, afficher l'erreur dans la console et considérer le token comme invalide.
    console.error("Erreur lors de la vérification du token :", error);
    return false;
  }
}

//******* CHARGE LES PROJET ET CATÉGORIES DEPUIS L'API

function fetchAndDisplayProjects() {
  fetch(baseURL + "categories")
    .then((response) => response.json())
    // Une fois les données des catégories obtenues avec succès, exécuter cette fonction
    .then((categoriesData) => {
      // les données récupérées depuis fetch sont stockées dans CategoriesDispo pour être utilisées par la suite.
      CategoriesDispo = categoriesData;
      // Appeler une fonction pour afficher les boutons de filtre en utilisant les données des catégories récupérées
      displayFilterButtons(categoriesData);
    });

  fetch(baseURL + "works")
    .then((response) => response.json())
    .then((data) => {
      const projetsAvecCategoriesComplètes = data.map(completeProjectCategory);
      displayProjects(projetsAvecCategoriesComplètes);
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des données:", error)
    );
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
      // Il s'agit de l'objet représentant l'image à afficher.
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

// Fonction pour créer un élément (figure).
function createGalleryItem(project, className, isModal) {
  // Création d'un élément 'figure' et configuration de ses propriétés
  const figureElement = document.createElement("figure");
  figureElement.className = `${className} project`;
  // Cela permet d'associer une catégorie à cet élément
  figureElement.dataset.category = project.category.name.toLowerCase();
  // On lui donne un ID
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

//******* CATÉGORIES

// Associe un ID de catégorie à un nom de catégorie.
function completeProjectCategory(project) {
  // Recherche la catégorie correspondante dans la liste des catégories disponibles.
  const category = CategoriesDispo.find(
    // Compare les id de catégorie pour trouver une correspondance avec celui du projet.
    (c) => c.id === parseInt(project.categoryId)
  );

  // Vérifie si une catégorie correspondante a été trouvée.
  if (category) {
    // Si une catégorie correspondante est trouvée, met à jour les informations de catégorie du projet.
    project.category = { id: category.id, name: category.name };
  } else {
    // Si aucune catégorie correspondante n'est trouvée, marque le projet comme "Non classifié".
    project.category = { id: null, name: "Non classifié" };
  }

  // Renvoie le projet avec les informations de catégorie complétées.
  return project;
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

// Filtre les projets affichés en fonction de la catégorie sélectionné.
function filterProjects(filterId) {
  const allProjects = document.querySelectorAll(
    "#GalleryContainerOriginal figure"
  );

  // Parcourt chaque projet dans la liste "allProjects"
  allProjects.forEach((project) => {
    project.style.display =
      // Affiche le projet si le filtre est "all" ou si sa catégorie correspond au filtre, sinon le masque.
      filterId === "all" || project.dataset.category === filterId ? "" : "none";
  });
}

//***** MODAL

// Configure et gère le comportement de la fenêtre modale dans votre interface utilisateur.
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

      // Crée une option par défaut qui sera affichée en premier dans le select.
      let defaultOption = document.createElement("option");
      defaultOption.textContent = ""; // Définit le texte affiché pour l'option par défaut (vide dans ce cas).
      defaultOption.value = ""; // Définit la valeur associée à l'option par défaut (vide dans ce cas).
      defaultOption.disabled = true; // Option par défaut est désactivée et ne peut pas être sélectionnée.
      defaultOption.selected = true; // Option par défaut est sélectionnée par défaut.
      select.appendChild(defaultOption); // Ajoute l'option par défaut au sélecteur.

      // Affiche les catégories reçues dans les données JSON.
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

  // Gère le fichier selectionner dans Input File.
  function handleFileChange() {
    // Récupère le fichier sélectionné dans le champ d'entrée de type fichier.
    const image = inputFile.files[0];
    // Vérifie si un fichier a été sélectionné.
    if (image) {
      // Crée un objet FileReader pour lire le contenu du fichier.
      const reader = new FileReader();

      // Évenement "onload" = Définit une fonction à exécuter une fois que le chargement d'une ressource est terminé avec succès.
      reader.onload = () => {
        // Vérifie s'il existe déjà une image dans la zone d'affichage et la supprime le cas échéant.
        const existingImg = imgArea.querySelector("img");
        if (existingImg) {
          imgArea.removeChild(existingImg);
        }

        // Récupère l'URL du fichier lu.
        const imgUrl = reader.result;
        // Crée un élément 'img' avec l'URL du fichier lu.
        const img = document.createElement("img");
        img.src = imgUrl;
        img.classList.add("changeable-image"); // Ajoute une classe pour le style ou le comportement.
        // Ajoute l'élément 'img' à la zone d'affichage.
        imgArea.appendChild(img);
      };

      // Lit le contenu du fichier et déclenche l'événement `onload` une fois la lecture terminée.
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

// Met en place l'écouteur d'événements sur le bouton de validation pour gérer la soumission des projets
function setupProjectSubmission() {
  document
    .querySelector(".valide")
    .addEventListener("click", handleProjectSubmission);
}

//Fonction pour fermer la modale et réinitialiser le formulaire une fois l'action faite
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

//***** AJOUT PROJET

//Valide le fichier, le titre, et la catégorie du formulaire avant envoi : vérifie la présence et la taille adéquate de l'image.
function validateFormData(file, title, categoryId) {
  // Sélectionnez l'élément qui affichera le message d'erreur
  const errorMessageElement = document.getElementById("error-message-modal");

  // trim() = Supprime les espaces blancs au début et à la fin d'une chaîne de caractères.
  if (!file || !title.trim() || !categoryId) {
    errorMessageElement.textContent =
      "Tous les champs sont requis (image, titre, catégorie).";
    errorMessageElement.style.display = "block"; //
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 3500);
    return false;
  }

  // Pour obtenir 4 Mo en octets, on multiplie 4 par 1024 pour obtenir le nombre de Ko, puis par 1024 à nouveau pour obtenir le nombre total d'octets.
  const MAX_SIZE_ALLOWED = 4 * 1024 * 1024; // 4MB
  if (file.size > MAX_SIZE_ALLOWED) {
    errorMessageElement.textContent =
      "La taille de l'image dépasse la limite autorisée de 4MB.";
    errorMessageElement.style.display = "block";
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 3500);
    // Indique que la validation a échoué en retournant false.
    return false;
  }
  // Si la taille du fichier est inférieure ou égale à la limite autorisée, la validation réussit.
  return true;
}

// Construit un objet FormData pour l'envoi de fichiers et de données de projet via une requête HTTP.
function buildFormData(file, title, category) {
  // Crée un nouvel objet FormData, qui est utilisé pour envoyer des données de formulaire via une requête HTTP.
  const formData = new FormData();

  // Ajoute le fichier sélectionné à l'objet FormData, sous la clé "image".
  formData.append("image", file);
  // Ajoute le titre du projet à l'objet FormData, sous la clé "title".
  formData.append("title", title);
  // Ajoute la catégorie du projet à l'objet FormData, sous la clé "category".
  formData.append("category", category);

  // Retourne l'objet FormData construit avec les données du fichier, du titre et de la catégorie du projet.
  return formData;
}

// Gère la soumission d'un nouveau projet en validant et préparant les données du formulaire.
function handleProjectSubmission() {
  const fileInput = document.querySelector('input[type="file"]'); // Récupère l'élément input de type fichier du formulaire.
  const file = fileInput ? fileInput.files[0] : null; // Récupère le fichier sélectionné par l'utilisateur.
  const title = document.querySelector("#titre").value; // Récupère la valeur du champ de saisie du titre du projet.
  const category = document.querySelector("#categorie").value; // Récupère la valeur du champ de sélection de la catégorie du projet.

  // Vérifie si les données du formulaire sont valides.
  if (!validateFormData(file, title, category)) {
    // Si les données ne sont pas valides, arrête le traitement.
    return;
  }

  // Prépare les données du formulaire pour l'envoi.
  const formData = buildFormData(file, title, category);
  // Soumet les données du formulaire au serveur.
  submitFormData(formData);
}

// Soumet les données du formulaire au serveur.
function submitFormData(formData) {
  // Vérifie si le jeton d'authentification est valide.
  if (!isTokenValid()) {
    // Affiche une erreur dans la console si le jeton est invalide ou manquant.
    console.error(
      "Token invalide ou manquant. Impossible de soumettre les données."
    );
    return; // Arrête le traitement si le jeton est invalide ou manquant.
  }

  // Envoie une requête POST au serveur avec les données du formulaire.
  fetch(baseURL + "works", {
    method: "POST",
    body: formData, // Corps de la requête contenant les données du formulaire.
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  })
    // Gère la réponse de la requête HTTP.
    .then((response) => {
      // Vérifie si la réponse est correcte.
      if (!response.ok) {
        // Lance une erreur si la réponse est incorrecte.
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Transforme la réponse en format JSON.
      return response.json();
    })
    // Traite les données JSON renvoyées par le serveur.
    .then((data) => {
      // Vérifie si les données du projet sont complètes.
      if (data && data.id && data.imageUrl && data.title && data.categoryId) {
        // Complète les données du projet avec la catégorie manquante.
        const completedProject = completeProjectCategory(data);
        // Ajoute le projet complété aux galeries d'images.
        addToGalleries(completedProject);
      } else {
        // Affiche une erreur si les données du projet sont incomplètes.
        console.error("Données du projet incomplètes", data);
      }
    })
    // Gère les erreurs survenues lors de la requête ou du traitement des données.
    .catch((error) => {
      // Affiche une erreur dans la console en cas d'échec.
      console.error("Erreur lors de l'ajout du projet:", error);
    });
}

// Ajoute un élément de projet aux galeries originale et modale, puis réinitialise la modale de soumission.
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

//***** SUPPRIME PROJET

// Cette fonction supprime un projet du serveur en utilisant une requête HTTP DELETE.
function deleteProject(projectId) {
  if (!isTokenValid()) {
    console.error(
      "Token invalide ou manquant. Impossible de supprimer l'élément."
    );
    return; // Arrête l'exécution de la fonction.
  }

  // Effectue une requête DELETE pour supprimer le projet correspondant à l'ID spécifié.
  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        // Si la réponse n'est pas OK, gère l'erreur.
        response
          .json()
          .then((errorDetails) => {
            // Affiche les détails de l'erreur dans la console.
            console.error("Détails de l'erreur :", errorDetails);
          })
          .catch((jsonError) => {
            // En cas d'erreur lors de la lecture des détails de l'erreur, affiche l'erreur.
            console.error(
              "Erreur lors de la lecture des détails de l'erreur:",
              jsonError
            );
          });
        // Lance une erreur avec le statut de la réponse.
        throw new Error(
          `La suppression du projet a échoué avec le statut : ${response.status}`
        );
      }
      // Si la suppression réussit, appelle la fonction pour supprimer le projet de l'interface utilisateur.
      removeProjectFromDOM(projectId);
    })
    .catch((error) => {
      // Gère les erreurs lors de l'exécution de la requête.
      console.error("Erreur lors de la suppression du projet:", error);
    });
}

// Fonction pour supprimer un projet du DOM en utilisant son ID de projet.
function removeProjectFromDOM(projectId) {
  document
    .querySelectorAll(`.project[data-id="${projectId}"]`)
    .forEach((project) => {
      project.remove();
    });
}

// Sélectionne tous les éléments ayant les IDs "GalleryContainerModal" et "GalleryContainerOriginal"
document
  .querySelectorAll("#GalleryContainerModal, #GalleryContainerOriginal")
  // Pour chaque élément sélectionné, ajoute un écouteur d'événement 'click'
  .forEach((container) => {
    container.addEventListener("click", function (event) {
      // Vérifie si le bouton cliqué ou l'un de ses ancêtres a la classe "delete-btn"
      const deleteBtn = event.target.closest(".delete-btn");

      // Si un bouton de suppression est trouvé
      if (deleteBtn) {
        // Trouve l'élément parent de la classe "project"
        const projectElement = deleteBtn.closest(".project");

        // Si un élément "project" est trouvé
        if (projectElement) {
          // Récupère l'attribut "data-id" de l'élément "project" qui contient l'identifiant du projet
          const projectId = projectElement.getAttribute("data-id");

          // Si un identifiant de projet est trouvé
          if (projectId) {
            // Appelle la fonction pour supprimer le projet avec l'identifiant correspondant
            deleteProject(projectId);
          } else {
            // Affiche un message d'erreur si aucun identifiant de projet valide n'est trouvé
            console.error(
              "Impossible de trouver l'élément projet avec un ID valide."
            );
          }
        }
      }
    });
  });
