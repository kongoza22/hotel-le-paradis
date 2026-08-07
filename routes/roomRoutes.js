const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

// Route publique pour le site web
router.get('/public', roomController.getPublicRooms);

// Routes protégées par authentification
router.get('/', auth, roomController.getAllRooms);
router.patch('/:id/status', auth, roomController.updateRoomStatus);
router.patch('/:id/checkout', auth, roomController.checkoutRoom);
router.post('/reservations', auth, roomController.createReservation);
router.get('/reservations/search', auth, roomController.searchReservations);
router.post('/services', auth, roomController.addService);
router.get('/stocks', auth, roomController.getStocks);
router.get('/reports/stats', auth, roomController.getStats);

module.exports = router;