import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

const app = express();
const PORT = 5000; //Port du serveur

app.use(cors()); // Autorise les requetes du front
dotenv.config();
app.use(express.json()); // Permet le parsing JSON

const API_KEY = process.env.API_KEY // Utilisation de la cle API TMDB

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connecté à MongoDB Atlas"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB :", err));


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);





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

app.post(
    "/api/auth/signup",
    [
        body("name").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ error: "L'utilisateur existe déjà" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ name, email, password: hashedPassword });
            await user.save();

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.status(201).json({ token, userId: user.id });
        } catch (error) {
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
);

app.post(
    "/api/auth/login",
    [body("email").isEmail(), body("password").notEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Utilisateur non trouvé" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Mot de passe incorrect" });
            }

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ token, userId: user.id });
        } catch (error) {
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
);

const authMiddleware = (req, res, next) => {
    //  Récupérer le token dans le header Authorization
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Accès refusé, token manquant" });
    }

    try {
        // Vérifier et décoder le token JWT
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

        // Ajouter l'userId au `req.user` pour les prochaines requêtes
        req.user = decoded;

        // Continuer la requête
        next();
    } catch (error) {
        res.status(401).json({ error: "Token invalide" });
    }
};

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: "Bravo ! Tu es connecté", userId: req.user.userId });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`);
});