const express = require('express');
const { createEvent, getEvents, getEventById } = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// router.post('/', authMiddleware, createEvent);
// router.get('/', getEvents);

router.get('/', getEvents); // Récupérer tous les événements
router.get('/:id', getEventById); // Récupérer un événement par ID
router.post('/', authMiddleware, createEvent); // Ajouter un nouvel événement

module.exports = router;