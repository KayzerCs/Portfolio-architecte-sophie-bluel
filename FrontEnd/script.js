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

//** CE QUI CONCERNE LA CONNEXION

// La méthode 'sessionStorage.getItem("authToken")' est utilisée pour récupérer la valeur du token d'authentification de la session en cours.
// La valeur est stockée dans la variable 'authToken' pour une utilisation ultérieure.
let authToken = sessionStorage.getItem("authToken");

// Déclaration d'une variable 'isLoggedIn' pour stocker un indicateur d'état de connexion.
// L'expression 'authToken !== null' est évaluée pour vérifier si la variable 'authToken' contient une valeur non nulle.
// Si 'authToken' est différent de null, cela signifie qu'un token d'authentification est présent et que l'utilisateur est considéré comme connecté.
let isLoggedIn = authToken !== null;

// Déclaration d'une constante 'tokenIsValid' pour stocker le résultat de l'appel à la fonction 'isTokenValid' avec 'authToken' comme argument.
// La fonction 'isTokenValid' est appelée pour vérifier la validité du jeton d'authentification 'authToken'.
const tokenIsValid = isTokenValid(authToken);

// Gestion de l'affichage de l'interface utilisateur (UI) en fonction de l'état de connexion de l'utilisateur
function updateUIBasedOnLogin() {
  // L'expression ternaire 'isLoggedIn ? "logout" : "login"' est utilisée pour déterminer le texte à afficher sur le bouton.
  // Si 'isLoggedIn' est true, le texte sera "logout", indiquant à l'utilisateur qu'il peut se déconnecter.
  loginButton.textContent = isLoggedIn ? "logout" : "login";

  // Condition : Vérifie si l'utilisateur est connecté.
  if (isLoggedIn) {
    filterContainer.style.display = "none";
    editionContainer.style.display = "";
    IconPortfolio.style.display = "";
  } else {
    filterContainer.style.display = "";
    editionContainer.style.display = "none";
    IconPortfolio.style.display = "none";
  }

  // Événement au clic sur le bouton de connexion (loginButton).
  loginButton.addEventListener("click", () => {
    if (isLoggedIn) {
      sessionStorage.removeItem("isLoggedIn"); // Supprime la clé "isLoggedIn" du stockage de session.
      sessionStorage.removeItem("authToken"); // Supprime la clé "authToken" du stockage de session.

      // Met à jour la variable 'isLoggedIn' à false pour indiquer que l'utilisateur est déconnecté.
      isLoggedIn = false;

      // Recharge la page actuelle pour refléter les changements,pour masquer les fonctionnalités réservées aux utilisateurs connectés.
      // L'objet global 'window' représente la fenêtre du navigateur.
      // La propriété 'location' de 'window' permet de manipuler l'URL de la page.
      // La méthode 'reload()' de 'window.location' permet de recharger la page actuelle.
      window.location.reload();
    } else {
      // Redirige l'utilisateur vers une autre page en modifiant l'URL dans la barre d'adresse du navigateur.
      // En affectant une nouvelle URL à la propriété 'href' de 'location', le navigateur est automatiquement redirigé vers la nouvelle page.
      window.location.href = "login.html";
    }
  });
}

// Définition de la fonction isTokenValid, qui vérifie si un Token d'authentification est valide.
function isTokenValid() {
  // Récupération du jeton d'authentification depuis le stockage de session.
  // La méthode 'getItem' récupère la valeur associée à la clé spécifiée dans le stockage de session.
  // Dans ce cas, elle récupère la valeur associée à la clé "authToken".
  const authToken = sessionStorage.getItem("authToken");

  // Vérification si le jeton d'authentification n'est pas défini ou null.
  if (!authToken) {
    // Si le jeton d'authentification est inexistant, la fonction retourne false, indiquant qu'il n'est pas valide.
    return false;
  }

  // Tentative de décodage du jeton d'authentification pour vérifier son expiration.
  try {
    // Décodage et extraction des informations du jeton d'authentification.
    // - La méthode 'atob' décode une chaîne de caractères encodée en base64.
    // La méthode 'split' est utilisée pour diviser la chaîne de caractères du jeton d'authentification en parties distinctes à chaque fois que le caractère '.' est rencontré.
    // - La méthode 'JSON.parse' est ensuite utilisée pour convertir la partie décodée du jeton, qui est en format JSON, en un objet JavaScript.
    // - La constante 'decodedToken' contient les informations extraites et décodées du jeton d'authentification.
    const decodedToken = JSON.parse(atob(authToken.split(".")[1]));

    // Vérifie si le jeton d'authentification décodé contient une propriété 'exp' (expiration).
    // La propriété 'exp' est généralement utilisée pour spécifier la date d'expiration du token.
    if (!decodedToken.exp) {
      // Si la propriété 'exp' est absente ou évaluée à faux, cela signifie que le jeton ne spécifie pas de date d'expiration.
      // Dans ce cas, le jeton est considéré comme invalide et la fonction retourne false.
      return false;
    }

    // Convertit le temps d'expiration du jeton en millisecondes.
    // Certains systèmes stockent le temps d'expiration des token en tant que nombre de secondes depuis une certaine date.
    // En multipliant par 1000, cela converti cette valeur en millisecondes, ce qui est le format de temps couramment utilisé en Js.
    const expirationTime = decodedToken.exp * 1000;

    // Récupère le temps actuel en millisecondes.
    // La méthode 'Date.now()' retourne un nombre représentant le nombre de millisecondes écoulées depuis le 1er janvier 1970 00:00:00 UTC.
    // Cela fournit une référence de temps actuelle précise pour comparer avec le temps d'expiration du token.
    const currentTime = Date.now();

    // Comparaison du temps d'expiration avec le temps actuel pour vérifier si le token a expiré.
    if (expirationTime < currentTime) {
      // Si le temps d'expiration est inférieur au temps actuel, la fonction retourne false, indiquant que le jeton a expiré.
      return false;
    }

    // Si le jeton n'est pas expiré, la fonction retourne true, indiquant que le jeton est valide.
    return true;
  } catch (error) {
    // En cas d'erreur lors de la tentative de décodage du jeton, un message d'erreur est affiché dans la console.
    console.error("Erreur lors de la vérification du token :", error);
    // La fonction retourne false, indiquant que le jeton n'est pas valide en raison de l'erreur de décodage.
    return false;
  }
}

//** CHARGE LES PROJET ET CATÉGORIES DEPUIS L'API

function fetchAndDisplayProjects() {
  fetch(baseURL + "categories")
    .then((response) => response.json())

    // Une fois les données des catégories obtenues avec succès, exécuter la fonction.
    .then((categoriesData) => {
      // les données récupérées depuis fetch sont stockées dans CategoriesDispo pour être utilisées par la suite.
      CategoriesDispo = categoriesData;
      // Appeler une fonction pour afficher les boutons de filtre en utilisant les données des catégories récupérées.
      displayFilterButtons(categoriesData);
    });

  fetch(baseURL + "works")
    .then((response) => response.json())

    // data représente les données JSON obtenues à partir de la réponse de l'API.
    .then((data) => {
      // La méthode 'map' parcourt chaque élément de 'data' et applique la fonction 'completeProjectCategory' à chacun.
      // La fonction 'completeProjectCategory' est une fonction de transformation qui reçoit un élément de 'data' en entrée et retourne un nouvel élément avec les catégories complétées.
      // 'projetsAvecCategoriesComplètes' est un nouveau tableau obtenu en appliquant la fonction 'completeProjectCategory' à chaque élément individuel de 'data'.
      const projetsAvecCategoriesComplètes = data.map(completeProjectCategory);

      // Affiche les projets avec les catégories complétées dans l'interface utilisateur.
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
      // false est utilisé pour spécifier si l'image est cliquable ou non.
      false
    );

    // appendChild
    // Ajoute l'élément 'figureElementOriginal' à la fin de la liste des enfants de 'galleryContainerOriginal'.
    // Cela permet d'afficher 'figureElementOriginal' à l'intérieur de 'galleryContainerOriginal' dans l'interface utilisateur.
    galleryContainerOriginal.appendChild(figureElementOriginal);

    // Crée un nouvel élément 'figure' pour représenter le projet dans la galerie modale.
    const figureElementModal = createGalleryItem(
      project,
      "gallery-item-modal",
      true
    );

    galleryContainerModal.appendChild(figureElementModal);
  });
}

// Fonction pour créer un élément (figure) dans sa globalité.
function createGalleryItem(project, className, isModal) {
  const figureElement = document.createElement("figure");
  figureElement.className = `${className} project`;

  // Utilise l'attribut de données personnalisé 'category' de l'élément 'figureElement'.
  // Les attributs de données personnalisés sont accessibles via l'objet 'dataset' d'un élément HTML.
  // Cela permet de stocker et d'accéder à des informations supplémentaires directement dans le HTML.
  figureElement.dataset.category = project.category.name.toLowerCase();

  // On lui donne un ID
  figureElement.setAttribute("data-id", project.id);

  // Création et configuration de l'élément 'img' pour l'image du projet.
  const imageElement = document.createElement("img");

  // Définit le texte alternatif de l'image pour l'accessibilité avec le titre du projet.
  // Le texte alternatif est affiché lorsque l'image ne peut pas être chargée ou lorsque l'utilisateur utilise un lecteur d'écran.
  imageElement.alt = project.title;
  imageElement.src = project.imageUrl;
  imageElement.title = project.title;

  // Ajout de l'image au 'figure'.
  figureElement.appendChild(imageElement);

  if (isModal) {
    // Pour la galerie modale, ajout d'un bouton qui contiendra l'icône de corbeille pour la suppression.
    const button = document.createElement("button");
    button.className = "delete-btn";
    button.setAttribute("type", "button");

    // Création de l'icône de corbeille et ajout au bouton.
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can";

    // Ajout de l'icône au bouton, puis du bouton à l'élément 'figure'.
    button.appendChild(deleteIcon);
    figureElement.appendChild(button);
  } else {
    // Pour la galerie originale, ajout d'une légende avec le titre du projet
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.textContent = project.title;
    figureElement.appendChild(figcaptionElement);
  }

  // Retourne l'élément 'figure' complété pour être ajouté au DOM.
  return figureElement;
}

//** CATÉGORIES

// Cette fonction prend un projet en paramètre et complète sa catégorie en fonction de l'ID de catégorie spécifié dans le projet.
// Elle recherche une catégorie correspondante dans le tableau CategoriesDispo en comparant les IDs, puis attribue la catégorie correspondante au projet.
function completeProjectCategory(project) {
  // Recherche une catégorie dans le tableau CategoriesDispo en utilisant la méthode find().
  // La méthode find() parcour sur chaque élément du tableau jusqu'à ce qu'elle trouve un élément répondant à la condition spécifiée.
  // Ici, la condition vérifie si l'ID de la catégorie actuelle (c.id) correspond à l'ID de la catégorie du projet (project.categoryId).
  // Avant la comparaison, project.categoryId est converti en entier avec parseInt() car il pourrait être stocké sous forme de chaîne de caractères.
  // Le résultat de la recherche est stocké dans la variable category.
  const category = CategoriesDispo.find(
    (c) => c.id === parseInt(project.categoryId)
  );

  // Vérifie si une catégorie correspondante a été trouvée pour le projet dans l'API.
  if (category) {
    // Si une catégorie correspondante est trouvée, les propriétés id et name de cette catégorie sont assimilées à project.category.
    project.category = { id: category.id, name: category.name };
  } else {
    // Si aucune catégorie correspondante n'est trouvée dans l'API, attribue une catégorie par défaut au projet.
    project.category = { id: null, name: "Non classifié" };
  }

  // Retourne le projet complété.
  return project;
}

// Crée un bouton de filtre.
function createFilterButton(filterId, filterName) {
  const button = document.createElement("button");

  button.textContent = filterName; // indiquez au navigateur d'afficher le contenu de filterName à l'intérieur du bouton.
  button.dataset.filter = filterId; // Stocke l'ID du filtre dans l'attribut de données 'filter' du bouton.
  button.className = "filter-button";

  // Événement au clic qui filtrera les projets quand ce bouton est cliqué.
  button.addEventListener("click", () => filterProjects(filterId));

  // Renvoie l'élément bouton créé pour une utilisation ultérieure.
  return button;
}

// Affiche les boutons de filtrage des projets selon les catégories fournies.
function displayFilterButtons(categories) {
  // Efface le contenu précédent du conteneur de filtres.
  filterContainer.innerHTML = "";

  // Ajoute un bouton "Tous" au conteneur de filtres
  filterContainer.appendChild(createFilterButton("all", "Tous"));

  // Pour chaque catégorie, crée et ajoute un bouton de filtre au conteneur de filtres.
  // Le forEach est utilisé pour parcourir sur chaque élément du tableau categories.
  // La fonction de rappel prend un paramètre "category" qui représente chaque catégorie dans le tableau.
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

//** MODAL

// Configure et gère le comportement de la fenêtre modale dans votre interface utilisateur.
function setupModal() {
  const icons = document.querySelectorAll(".icon");

  // La méthode forEach est utilisé pour ajouter un gestionnaire d'événements à chaque icône du tableau "icons".
  // Lorsqu'une icône (Mode édition / modifier) est cliquée, une fonction est déclenchée pour afficher la modal.
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
    // La propriété files est utilisée pour accéder à la liste des fichiers sélectionnés dans le champ de type fichier.
    // L'indice [0] est utilisé pour accéder au premier fichier dans la liste des fichiers sélectionnés.
    const image = inputFile.files[0];

    // Vérifie si un fichier a été sélectionné.
    if (image) {
      // Crée un nouvel objet FileReader.
      // FileReader est une interface JavaScript qui permet à une application web de lire le contenu d'un fichier.
      const reader = new FileReader();

      // L'événement 'load' est déclenché lorsque le chargement d'un fichier est terminé.
      // Lorsque le FileReader a fini de lire le contenu du fichier sélectionné, il déclenche cet événement.
      // À ce moment-là, la fonction de rappel associée à 'onload' est exécutée.
      reader.onload = () => {
        // Récupère l'élément img existant dans la zone imgArea, s'il existe déjà.
        const existingImg = imgArea.querySelector("img");
        // Vérifie s'il existe déjà une image dans la zone imgArea.
        // Si une image existe, elle est supprimée de la zone imgArea pour la remplacer par la nouvelle image chargée.
        if (existingImg) {
          imgArea.removeChild(existingImg);
        }

        // Récupère l'URL du fichier chargé à partir de la propriété result du FileReader.
        const imgUrl = reader.result;

        const img = document.createElement("img");

        // Attribu l'URL de l'image récupérée par le FileReader à la propriété src de l'élément img.
        img.src = imgUrl;
        img.classList.add("changeable-image");

        // Ajoute l'élément img à la zone imgArea pour afficher l'image chargée.
        imgArea.appendChild(img);
      };

      // Lit le contenu du fichier et déclenche l'événement `onload` une fois la lecture terminée.
      reader.readAsDataURL(image);
    }
  }

  // Écouteur d'événement sur inputFile pour détecter quand un utilisateur sélectionne un fichier.
  inputFile.addEventListener("change", handleFileChange);

  // Ajoute un gestionnaire d'événements "click" à la zone imgArea.
  // Lorsque la zone imgArea est cliquée, cette fonction de rappel est déclenchée.
  imgArea.addEventListener("click", function (event) {
    // Vérifie si l'élément sur lequel l'événement "click" a été déclenché contient la classe CSS "changeable-image".
    // Cela signifie que l'utilisateur a cliqué sur une image qui peut être modifiée.
    if (event.target.classList.contains("changeable-image")) {
      // Si l'image cliquée est modifiable, déclenche un clic programmé sur le champ de type fichier inputFile.
      // Cela ouvre la boîte de dialogue de sélection de fichier, permettant à l'utilisateur de sélectionner une nouvelle image.
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
  // Fait disparaitre la modal.
  const modal = document.getElementById("myModal");
  modal.style.display = "none";

  // Reset le formulaire.
  const form = document.getElementById("addProjectForm");
  form.reset();

  // Vide le selecteur de catégories.
  const categorySelect = document.getElementById("categorie");
  categorySelect.value = "";

  // Supprime l'image prévisualiser.
  const imgPreview = document.querySelector(".changeable-image");
  imgPreview.remove();
}

//** AJOUT PROJET

//Valide le fichier, le titre, et la catégorie du formulaire avant envoi. Vérifie aussi la présence et la taille adéquate de l'image.
function validateFormData(file, title, categoryId) {
  // Sélectionnez l'élément qui affichera le message d'erreur.
  const errorMessageElement = document.getElementById("error-message-modal");

  // Vérifie si l'un des champs requis (fichier, titre non vide, categoryId) est manquant ou vide.
  // trim() = Supprime les espaces blancs au début et à la fin d'une chaîne de caractères.
  if (!file || !title.trim() || !categoryId) {
    errorMessageElement.textContent =
      "Tous les champs sont requis (image, titre, catégorie).";
    errorMessageElement.style.display = "block";
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 3500);
    // Retourne false pour indiquer que la validation a échoué.
    return false;
  }

  // Pour obtenir 4 Mo en octets, on multiplie 4 par 1024 pour obtenir le nombre de Ko, puis par 1024 à nouveau pour obtenir le nombre total d'octets.
  const MAX_SIZE_ALLOWED = 4 * 1024 * 1024; // 4MB
  // Si la taille du fichier dépasse la limite autorisée, affiche un message d'erreur.
  if (file.size > MAX_SIZE_ALLOWED) {
    errorMessageElement.textContent =
      "La taille de l'image dépasse la limite autorisée de 4MB.";
    errorMessageElement.style.display = "block";
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 3500);
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
  const title = document.querySelector("#titre").value; // Récupère la valeur du champ de saisie du titre du projet.
  const category = document.querySelector("#categorie").value; // Récupère la valeur du champ de sélection de la catégorie du projet.

  // Récupère le premier fichier sélectionné par l'utilisateur à partir de l'élément fileInput, s'il existe, sinon attribue null à la variable file.
  const file = fileInput ? fileInput.files[0] : null;

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
  // Vérifie si le token d'authentification est valide.
  if (!isTokenValid()) {
    // Affiche une erreur dans la console si le jeton est invalide ou manquant.
    console.error(
      "Token invalide ou manquant. Impossible de soumettre les données."
    );
    return; // Arrête le traitement si le token est invalide ou manquant.
  }

  // Envoie une requête POST au serveur avec les données du formulaire.
  fetch(baseURL + "works", {
    method: "POST",
    body: formData, // Corps de la requête contenant les données du formulaire.
    headers: {
      // Le mot-clé "Bearer" dans l'en-tête "Authorization" indique à l'API que le token inclus dans cet en-tête est utilisé pour l'authentification.
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
    // data = aux données du projet envoyées via le formulaire dans la requête POST.
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
    // false = projet non cliquable.
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

//** SUPPRIME PROJET

// Cette fonction supprime un projet du serveur en utilisant une requête HTTP DELETE.
function deleteProject(projectId) {
  // Vérifie si le token d'authentification est invalide ou manquant.
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
      // Le mot-clé "Bearer" dans l'en-tête "Authorization" indique à l'API que le token inclus dans cet en-tête est utilisé pour l'authentification.
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
    // Sélectionne tous les éléments de projet avec l'attribut 'data-id' correspondant à l'ID du projet à supprimer.
    .querySelectorAll(`.project[data-id="${projectId}"]`)
    // Pour chaque élément correspondant trouvé...
    .forEach((project) => {
      // Supprime l'élément du DOM.
      project.remove();
    });
}

// Sélectionne tous les éléments ayant les IDs "GalleryContainerModal" et "GalleryContainerOriginal"
document
  .querySelectorAll("#GalleryContainerModal, #GalleryContainerOriginal")
  // Pour chaque élément sélectionné, ajoute un écouteur d'événement 'click'
  .forEach((container) => {
    container.addEventListener("click", function (event) {
      // Recherche l'élément le plus proche correspondant à la classe CSS ".delete-btn" à partir de l'élément cible de l'événement.
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
