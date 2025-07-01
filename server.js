const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
mongoose.set('strictQuery', false);
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);

const PostSchema = new mongoose.Schema({
  numero: String,
  emission: String,
  gain: String,
  dateExpiration: Date,
  commentaire: String,
  datePublication: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', PostSchema);

app.get('/api/posts', async (req, res) => {
  try {
    console.log("Route GET /api/posts appelée");  // <-- log ajouté
    const posts = await Post.find().sort({ datePublication: -1 });
    console.log("Posts récupérés :", posts);       // <-- log ajouté
    res.json(posts);
  } catch (err) {
    console.error("Erreur lors du chargement des posts :", err);
    res.status(500).json({ error: 'Erreur serveur lors du chargement des posts' });
  }
});

app.get('/', (req, res) => {
  res.send('API Téléphone Backend est en ligne');
});


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
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/admin/edit/:id', async (req, res) => {
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
  } catch {
    res.status(500).json({ error: 'Erreur modification' });
  }
});

app.delete('/admin/delete/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Supprimé' });
  } catch {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
