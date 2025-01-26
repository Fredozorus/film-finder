
// Clé API
import {API_KEY} from './config.js';
const API_URL=`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`

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
function displayMovies(movies){
    movieList.innerHTML="";
    if (movies.length === 0) {
        movieList.innerHTML = "<p>  Aucun film trouvé </p>";
        return;
    }

    movies.forEach(movie => {
        const movieItem = document.createElement("div") ;
        movieItem.classList.add("movie");
        
        // Construire l'URL de l'affiche
     // Vérification et construction de l'URL de l'affiche
     const posterUrl = movie.poster_path
     ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
     : "https://dummyimage.com/500x750/cccccc/000000.png&text=Aucune+Affiche"; // Placeholder fiable

        movieItem.innerHTML= `
       <img src="${posterUrl}" alt="${movie.title} Affiche" class="movie-poster">
        <h3>${movie.title}</h3>
        <p> Sorti en  : ${movie.release_date || "Date inconnue"}</p>
        <img >
        <p>${movie.overview || "Pas de description disponible"} </p>
        `;

        movieList.appendChild(movieItem);
    });
}

searchButton.addEventListener("click", async() =>{
    const query =  searchInput.value.trim();
    if (!query) {
        alert("Veuillez entrer un titre de film.")
        return;
    }

    const movies = await fetchMovies(query);
    displayMovies(movies);
});