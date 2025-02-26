const express = require('express');
const { createEvent, getEvents } = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/', authMiddleware, createEvent);
router.get('/', getEvents);

module.exports = router;