const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ status: 'ERROR', message: 'Identifiant et mot de passe requis' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'ERROR', message: 'Identifiants invalides' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'HOTEL_SECRET_2026', 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      status: 'SUCCESS', 
      token, 
      user: { username: user.username, role: user.role } 
    });
  });
};

exports.getUsers = (req, res) => {
  db.all("SELECT id, username, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
    res.json({ status: 'SUCCESS', users: rows });
  });
};