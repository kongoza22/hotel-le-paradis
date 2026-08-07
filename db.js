const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const logger = require('./utils/logger');

const db = new sqlite3.Database('./hotel_paradis.db', (err) => {
  if (err) {
    logger.error(`Erreur d'ouverture de la base de données: ${err.message}`);
  } else {
    logger.info('Connecté à la base de données SQLite (hotel_paradis.db).');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT UNIQUE, 
    password TEXT, 
    role TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    room_number TEXT UNIQUE, 
    room_type TEXT, 
    status TEXT DEFAULT 'available'
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    guest_name TEXT, 
    guest_phone TEXT, 
    room_id INTEGER, 
    total_amount REAL, 
    deposit_amount REAL, 
    payment_method TEXT, 
    check_in TEXT, 
    check_out TEXT, 
    status TEXT DEFAULT 'active'
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    room_id INTEGER, 
    service_type TEXT, 
    amount REAL, 
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    item_name TEXT, 
    category TEXT, 
    quantity INTEGER, 
    min_threshold INTEGER
  )`);

  db.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
    if (row && row.count === 0) {
      const hashedAdmin = await bcrypt.hash('admin123', 8);
      const hashedRec = await bcrypt.hash('reception123', 8);
      
      db.run(`INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [hashedAdmin]);
      db.run(`INSERT INTO users (username, password, role) VALUES ('reception', ?, 'receptionist')`, [hashedRec]);
      
      const defaultRooms = [
        ['101', 'Standard'], ['102', 'Standard'], ['103', 'Standard'],
        ['201', 'Deluxe'], ['202', 'Deluxe'], ['301', 'Suite']
      ];
      defaultRooms.forEach(r => {
        db.run(`INSERT INTO rooms (room_number, room_type, status) VALUES (?, ?, 'available')`, r);
      });

      const defaultStocks = [
        ['Eau minérale 1.5L', 'Boissons', 45, 10],
        ['Coca-Cola 33cl', 'Boissons', 25, 10],
        ['Savon de bain', 'Hygiène', 50, 15]
      ];
      defaultStocks.forEach(s => {
        db.run(`INSERT INTO stocks (item_name, category, quantity, min_threshold) VALUES (?, ?, ?, ?)`, s);
      });
      
      logger.info('Données initiales par défaut insérées avec succès.');
    }
  });
});

module.exports = db;