// Clé API
import { API_KEY } from "./config.js";
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;

// Selection des élémetns du DOM
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const movieList = document.getElementById("movieList");

//Fonction qui recupere les films depuis l'API
async function fetchMovies(query) {
  try {
    const response = await fetch(`${API_URL}${query}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des données : ", error);
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

async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`);
    const data = await response.json();
    displayMovieDetails(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
  }
}

function displayMovieDetails(movie) {
  const modal = document.getElementById("movieDetailsModal");
  const modalContent = document.getElementById("movieDetails")

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

searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Veuillez entrer un titre de film.");
    return;
  }

  const movies = await fetchMovies(query);
  displayMovies(movies);
});

