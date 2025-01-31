// Clé API
const API_URL = `https://film-finder-03jj.onrender.com/api/movies?q=`;
const MOVIE_DETAILS_URL = "https://film-finder-03jj.onrender.com/api/movie/";

// Selection des élémetns du DOM
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const movieList = document.getElementById("movieList");

//Fonction qui recupere les films depuis l'API
async function fetchMovies(query) {
  try {
    const response = await fetch(`${API_URL}${query}`);

    // ✅ Vérifie si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    return [];
  }
}

// Fonction pour afficher les films dans le DOM
function displayMovies(movies) {
  movieList.innerHTML = "";
  if (movies.length === 0) {
    movieList.innerHTML = "<p>  Aucun film trouvé </p>";
    return;
  }

  movies.forEach((movie) => {
    const movieItem = document.createElement("div");
    movieItem.classList.add("movie");
    movieItem.dataset.id = movie.id; // Stock l'ID du film dans un attribut.

    // Construire l'URL de l'affiche
    // Vérification et construction de l'URL de l'affiche
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://dummyimage.com/500x750/cccccc/000000.png&text=Aucune+Affiche"; // Placeholder fiable

    movieItem.innerHTML = `
       <img src="${posterUrl}" alt="${movie.title
      } Affiche" class="movie-poster">
        <h3>${movie.title}</h3>
        <p> Sorti en  : ${movie.release_date || "Date inconnue"}</p>
        <img >
        <p>${movie.overview || "Pas de description disponible"} </p>
        `;

    movieList.appendChild(movieItem);

    movieItem.addEventListener("click", () => {
      fetchMovieDetails(movie.id);
    });


  });
}

//Recuper les details d'un film
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(`${MOVIE_DETAILS_URL}${movieId}`);
    const data = await response.json();
    displayMovieDetails(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
  }
}

//Affiche les details d'un film
function displayMovieDetails(movie) {
  const modal = document.getElementById("movieDetailsModal");
  const modalContent = document.querySelector(".modal-content");

  modal.classList.add("show"); // Affichage fluide
  modalContent.classList.add("show"); // Animation de zoom

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.classList.contains("close")) {
      modal.classList.remove("show");
      modalContent.classList.remove("show");
      setTimeout(() => {
        modal.style.display = "none"; // Cache après animation
      }, 300);
    }
  });

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://dummyimage.com/500x750/cccccc/000000.png&text=Aucune+Affiche";


  const genres = movie.genres ? movie.genres.map((genre) => genre.name).join(", ") : "Non spécifié";
  const cast = movie.credits && movie.credits.cast ? movie.credits.cast.slice(0, 5).map((actor) => actor.name).join(", ") : "Non disponible";

  // Insérer les infos dans la modale
  modalContent.innerHTML = `
<img src="${posterUrl}" alt="${movie.title} Affiche" class="movie-poster">
<h2>${movie.title}</h2>
<p><strong>Genres :</strong> ${genres}</p>
<p><strong>Date de sortie :</strong> ${movie.release_date || "Non disponible"}</p>
<p><strong>Note :</strong> ${movie.vote_average} / 10</p>
<p><strong>Durée :</strong> ${movie.runtime} minutes</p>
<p><strong>Acteurs :</strong> ${cast}</p>
<p>${movie.overview || "Pas de synopsis disponible."}</p>
`;

  // Afficher la modale
  modal.style.display = "flex";

}

// Fermer la modale en cliquant sur le bouton "close"
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("movieDetailsModal").style.display = "none";
});

// Fermer la modale en cliquant en dehors du contenu
window.addEventListener("click", (event) => {
  const modal = document.getElementById("movieDetailsModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

//Recherche un film quand on clique sur le bouton
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Veuillez entrer un titre de film.");
    return;
  }

  const movies = await fetchMovies(query);
  displayMovies(movies);
});

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const response = await fetch("https://film-finder-03jj.onrender.com/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Inscription réussie ! Connectez-vous maintenant.");
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("https://film-finder-03jj.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token); // 🔥 Stocke le token JWT
      alert("Connexion réussie !");
      checkAuth(); // Met à jour l'affichage
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
  }
});

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("token"); // Supprime le token JWT
  alert("Déconnexion réussie !");
  checkAuth(); // 🔥 Met à jour l'affichage
});

function checkAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("logoutButton").style.display = "block";
  } else {
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("logoutButton").style.display = "none";
  }
}