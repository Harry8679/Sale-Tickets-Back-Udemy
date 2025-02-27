const express = require("express");
const router = express.Router();
const { getUserReservations, createReservation } = require("../controllers/reservation.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/mine", authMiddleware, getUserReservations);
router.post("/", authMiddleware, createReservation);

module.exports = router;