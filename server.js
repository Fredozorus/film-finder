import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
const PORT = 5000; //Port du serveur

app.use(cors()); // Autorise les requetes du front
dotenv.config();
app.use(express.json()); // Permet le parsing JSON

const API_KEY = process.env.API_KEY // Utilisation de la cle API TMDB


//Route pour récupérer des films depuis TMDB
app.get('/api/movies', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Paramètre 'q' (query) manquant" });
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        const text = await response.text(); // Lire la réponse en texte brut

        // ✅ Vérifie si la réponse est vide ou mal formée
        if (!text) {
            return res.status(500).json({ error: "Réponse vide de l'API TMDB" });
        }

        const data = JSON.parse(text); // Convertit en JSON après vérification

        if (!data.results) {
            return res.status(500).json({ error: "Réponse invalide de l'API TMDB" });
        }

        res.json(data.results);
    } catch (error) {
        console.error("Erreur API TMDB :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour récupérer les détails d’un film
app.get('/api/movie/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Erreur API TMDB :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`);
});