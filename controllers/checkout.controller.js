const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/event.model");

exports.createCheckoutSession = async (req, res) => {
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
  try {
    console.log("Données reçues:", req.body);

    const { eventId, quantity, userId } = req.body; // Ajout de userId

    if (!eventId || !quantity || !userId) {
      return res.status(400).json({ error: "eventId, quantity et userId sont requis" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({ error: "Pas assez de billets disponibles" });
    }

    // Création de la session Stripe avec metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: event.name,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/profile?success=true`,
      cancel_url: `http://localhost:3000/profile?canceled=true`,
      metadata: {
        eventId: eventId,
        userId: userId, // Ajout du userId
        quantity: quantity.toString(), // Converti en string pour Stripe
      },
    });

    console.log("✅ Session Stripe créée avec metadata :", session);
    res.json({ url: session.url });

  } catch (error) {
    console.error("❌ Erreur Stripe:", error);
    res.status(500).json({ error: "Erreur lors de la création de la session Stripe" });
  }
};