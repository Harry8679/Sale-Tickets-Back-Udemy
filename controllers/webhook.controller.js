const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/event.model");
const Reservation = require("../models/reservation.model");
const User = require("../models/user.model"); // Assurez-vous d'avoir ce modèle

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Erreur lors de la vérification du webhook :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const eventId = session.metadata.eventId;
    const userId = session.metadata.userId;
    const quantity = parseInt(session.metadata.quantity, 10);

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Événement introuvable" });
      }

      // Vérifiez si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      // Créez la réservation
      const reservation = new Reservation({
        user: userId,
        event: eventId,
        ticketsBought: quantity,
        totalPrice: event.price * quantity,
      });

      await reservation.save();

      // Mettez à jour les billets disponibles
      event.availableTickets -= quantity;
      await event.save();

      console.log("✅ Réservation créée avec succès !");
    } catch (err) {
      console.error("❌ Erreur lors de la création de la réservation :", err);
    }
  }

  res.status(200).json({ received: true });
};