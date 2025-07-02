const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.set('strictQuery', false);

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

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
    const posts = await Post.find().sort({ datePublication: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors du chargement des posts' });
  }
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
  } catch {
    res.status(500).json({ error: 'Erreur modification' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
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
