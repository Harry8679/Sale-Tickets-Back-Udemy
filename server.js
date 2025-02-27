require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/user.route');
const eventRoutes = require('./routes/event.route');
const reservationRoutes = require('./routes/reservation.route');
const checkoutRoutes = require("./routes/checkout.route");

const app = express();

// 🛡️ Middlewares
app.use(express.json());
app.use(cors());

// 📌 Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reservations', reservationRoutes);

const PORT = process.env.PORT || 5700;
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('🟢 MongoDB connecté');
    app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
  })
  .catch(err => console.error('🔴 Erreur MongoDB:', err));