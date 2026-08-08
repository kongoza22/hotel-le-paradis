require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Enregistrement des routes pointant vers le dossier "routes"
app.use('/auth', require('./routes/authRoutes'));
app.use('/rooms', require('./routes/roomRoutes'));
app.use('/staff', require('./routes/staffRoutes'));

app.listen(PORT, () => {
  console.log(`Serveur Enterprise PMS démarré sur le port ${PORT}`);
});