require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));

app.listen(PORT, () => {
  logger.info(`Serveur Enterprise PMS démarré sur le port ${PORT}`);
});