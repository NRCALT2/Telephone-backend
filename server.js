const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.set('strictQuery', false);

const app = express();

// Middleware CORS : autorise toutes origines (à limiter en production)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB avec logs
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// Schéma Mongoose
const PostSchema = new mongoose.Schema({
  numero: String,
  emission: String,
  gain: String,
  dateExpiration: Date,
  commentaire: String,
  datePublication: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', PostSchema);

// Route racine simple pour test serveur
app.get('/', (req, res) => {
  res.send('API Téléphone Backend est en ligne');
});

// GET tous les posts
app.get('/api/posts', async (req, res) => {
  try {
    console.log('GET /api/posts appelée');
    const posts = await Post.find().sort({ datePublication: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Erreur lors du chargement des posts :', err);
    res.status(500).json({ error: 'Erreur serveur lors du chargement des posts' });
  }
});

// POST nouveau post
app.post('/api/posts', async (req, res) => {
  try {
    const { numero, emission, gain, dateExpiration, commentaire } = req.body;
    const post = new Post({
      numero,
      emission,
      gain,
      dateExpiration: new Date(dateExpiration),
      commentaire,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Erreur POST /api/posts :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT modifier un post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { numero, emission, gain, dateExpiration, commentaire } = req.body;
    await Post.findByIdAndUpdate(req.params.id, {
      numero,
      emission,
      gain,
      dateExpiration: new Date(dateExpiration),
      commentaire,
    });
    res.status(200).json({ message: 'Modifié' });
  } catch (err) {
    console.error('Erreur PUT /api/posts/:id :', err);
    res.status(500).json({ error: 'Erreur modification' });
  }
});

// DELETE supprimer un post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Supprimé' });
  } catch (err) {
    console.error('Erreur DELETE /api/posts/:id :', err);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
