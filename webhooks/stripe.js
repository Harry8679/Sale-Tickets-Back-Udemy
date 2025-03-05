const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/event.model");
const Reservation = require("../models/reservation.model");
const User = require("../models/user.model");

exports.handleStripeWebhook = async (req, res) => {
  console.log("🚀 Webhook Stripe reçu !");
  console.log("🧐 Données brutes reçues du Webhook :", req.body.toString());

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // ✅ Vérification de l'intégrité du Webhook avec Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook Stripe validé avec succès :", event.type);
  } catch (err) {
    console.error("❌ Erreur de validation du Webhook Stripe :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Traitement du paiement réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("🎟️ Données de la session :", session);

    // ✅ Extraction des metadata Stripe
    const eventId = session.metadata?.eventId;
    const userId = session.metadata?.userId;
    const quantity = parseInt(session.metadata?.quantity, 10);

    console.log("🔍 Vérification des données avant création de la réservation :");
    console.log("Event ID:", eventId);
    console.log("User ID:", userId);
    console.log("Quantity:", quantity);

    // ✅ Vérification des données avant de créer la réservation
    if (!eventId || !userId || isNaN(quantity)) {
      console.error("❌ Erreur : Données invalides dans la session Stripe !");
      return res.status(400).json({ error: "Données invalides dans la session Stripe" });
    }

    try {
      console.log("🔄 Tentative d'enregistrement de la réservation...");

      // ✅ Recherche de l'événement et de l'utilisateur
      const event = await Event.findById(eventId);
      const user = await User.findById(userId);

      if (!event) {
        console.error("❌ Événement introuvable !");
        return res.status(404).json({ error: "Événement introuvable" });
      }

      if (!user) {
        console.error("❌ Utilisateur introuvable !");
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      console.log("✅ Utilisateur et événement trouvés ! Création de la réservation...");

      // ✅ Création de la réservation avec le bon format
      const reservation = new Reservation({
        user: userId,
        event: eventId,
        tickets: quantity, // Correction ici pour correspondre au modèle
        totalPrice: event.price * quantity,
        status: "confirmed", // Mettre la réservation comme confirmée après paiement
      });

      await reservation.save();
      console.log("✅ Réservation créée avec succès :", reservation);

      // ✅ Mise à jour du nombre de billets disponibles
      event.availableTickets -= quantity;
      await event.save();
      console.log("✅ Nombre de billets mis à jour !");
    } catch (err) {
      console.error("❌ Erreur lors de la création de la réservation :", err);
      return res.status(500).json({ error: "Erreur lors de la création de la réservation" });
    }
  }

  res.status(200).json({ received: true });
};