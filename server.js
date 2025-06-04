const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const loadImages = () => JSON.parse(fs.readFileSync('./images.json'));

// Voting endpoint
app.post('/vote/:id', (req, res) => {
  const images = loadImages();
  const image = images.find(img => img.id === req.params.id);
  if (image) {
    image.votes += 1;
    fs.writeFileSync('./images.json', JSON.stringify(images, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Upload endpoint
app.post('/upload', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  const images = loadImages();
  const newId = `img${images.length + 1}`;
  images.push({ id: newId, url, votes: 0 });
  fs.writeFileSync('./images.json', JSON.stringify(images, null, 2));
  res.json({ success: true });
});

// Get images with tier
app.get('/images', (req, res) => {
  const images = loadImages();
  const sorted = [...images].sort((a, b) => b.votes - a.votes);
  const total = sorted.length;
  const withTiers = sorted.map((img, i) => {
    const rank = (i + 1) / total;
    let tier = 'E';
    if (rank <= 0.05) tier = 'S';
    else if (rank <= 0.15) tier = 'A';
    else if (rank <= 0.30) tier = 'B';
    else if (rank <= 0.50) tier = 'C';
    else if (rank <= 0.75) tier = 'D';
    return { ...img, tier };
  });
  res.json(withTiers);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
