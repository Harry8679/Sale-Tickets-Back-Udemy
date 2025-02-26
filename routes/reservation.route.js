const express = require('express');
const router = express.Router();
const {
  createReservation,
  getUserReservations,
} = require('../controllers/reservationController');
const protect = require('../middlewares/auth.middleware');

router.post('/', protect, createReservation);
router.get('/', protect, getUserReservations);

module.exports = router;