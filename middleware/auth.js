const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ status: 'ERROR', message: 'Jeton d\'authentification manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'HOTEL_SECRET_2026', (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'ERROR', message: 'Jeton invalide ou expiré' });
    }
    req.user = decoded;
    next();
  });
};