const db = require('../db');
const bcrypt = require('bcryptjs');

exports.createStaff = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'ERROR', message: 'Nom d\'utilisateur et mot de passe requis' });
  }
  try {
    const hashed = await bcrypt.hash(password, 8);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashed, role || 'receptionist'], (err) => {
      if (err) return res.status(500).json({ status: 'ERROR', message: 'Erreur: Nom d\'utilisateur déjà existant' });
      res.json({ status: 'SUCCESS' });
    });
  } catch (e) {
    res.status(500).json({ status: 'ERROR', message: e.message });
  }
};