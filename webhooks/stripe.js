const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/event.model");
const Reservation = require("../models/reservation.model");
const User = require("../models/user.model");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("🔵 Réception d'un webhook Stripe...");
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Erreur Webhook Signature :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Webhook Stripe reçu avec succès :", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("🎟️ Données de la session :", session);

    const eventId = session.metadata?.eventId;
    const userId = session.metadata?.userId;
    const quantity = parseInt(session.metadata?.quantity, 10);

    console.log(`🟢 Event ID: ${eventId}, User ID: ${userId}, Quantity: ${quantity}`);

    if (!eventId || !userId || !quantity) {
      console.error("❌ Données manquantes dans la session !");
      return res.status(400).json({ error: "Données de session Stripe manquantes" });
    }

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        console.error("❌ Événement introuvable !");
        return res.status(404).json({ error: "Événement introuvable" });
      }

      const user = await User.findById(userId);
      if (!user) {
        console.error("❌ Utilisateur introuvable !");
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      const reservation = new Reservation({
        user: userId,
        event: eventId,
        ticketsBought: quantity,
        totalPrice: event.price * quantity,
      });

      await reservation.save();
      console.log("✅ Réservation créée avec succès !");

      event.availableTickets -= quantity;
      await event.save();
    } catch (err) {
      console.error("❌ Erreur lors de la création de la réservation :", err);
    }
  }

  res.status(200).json({ received: true });
};