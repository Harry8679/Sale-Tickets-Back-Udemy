const express = require('express');
const { createReservation } = require('../controllers/reservation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/', authMiddleware, createReservation);

module.exports = router;