const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/event.model");
const Reservation = require("../models/reservation.model");

exports.createCheckoutSession = async (req, res) => {
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
  try {
    console.log("Données reçues:", req.body);

    const { eventId, quantity } = req.body;
    if (!eventId || !quantity) {
      return res.status(400).json({ error: "eventId et quantity sont requis" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({ error: "Pas assez de billets disponibles" });
    }

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
    });

    console.log("Session Stripe créée:", session.url);
    res.json({ url: session.url });

  } catch (error) {
    console.error("Erreur Stripe:", error);
    res.status(500).json({ error: "Erreur lors de la création de la session Stripe" });
  }
};
