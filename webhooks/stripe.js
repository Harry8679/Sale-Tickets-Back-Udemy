const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/event.model");
const Reservation = require("../models/reservation.model");

exports.handleStripeWebhook = async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const eventId = session.metadata.eventId;
    const quantity = session.metadata.quantity;

    const eventFound = await Event.findById(eventId);
    if (eventFound) {
      eventFound.availableTickets -= quantity;
      await eventFound.save();

      await Reservation.create({
        user: session.customer_email, // Stocke l'email de l'utilisateur
        event: eventId,
        ticketsBought: quantity,
      });
    }
  }

  res.status(200).json({ received: true });
};