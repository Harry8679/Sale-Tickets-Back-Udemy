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

// ✅ Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("🟢 MongoDB connecté");
  })
  .catch((err) => console.error("🔴 Erreur MongoDB:", err));

// ✅ Middleware pour les Webhooks Stripe (⚠️ Ne pas utiliser express.json ici)
app.use("/api/webhook/stripe", express.raw({ type: "application/json" }));

// ✅ Autres middlewares
app.use(cors());
app.use(express.json()); // Parser JSON uniquement pour les autres routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Routes API
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/webhook/stripe", webhookRoutes);

// ✅ Route test pour voir si le serveur tourne bien
app.get("/", (req, res) => {
  res.send("🚀 API EventBooking est en ligne !");
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 5700;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));