require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Importation des routes
const userRoutes = require("./routes/user.route");
const eventRoutes = require("./routes/event.route");
const reservationRoutes = require("./routes/reservation.route");
const checkoutRoutes = require("./routes/checkout.route");
const webhookRoutes = require("./routes/webhook.route");

const app = express();

// 🔥 Middleware spécifique pour les Webhooks Stripe (⚠️ Ne pas utiliser `express.json()` ici)
app.use("/api/webhook/stripe", express.raw({ type: "application/json" }));

// Autres middlewares
app.use(express.json());
app.use(cors());

// Routes principales
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/webhook/stripe", webhookRoutes);

const PORT = process.env.PORT || 5700;
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("🟢 MongoDB connecté");
    app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
  })
  .catch((err) => console.error("🔴 Erreur MongoDB:", err));
