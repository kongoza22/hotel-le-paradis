const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');

router.post('/', auth, staffController.createStaff);

module.exports = router;