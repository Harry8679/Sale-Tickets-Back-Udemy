const Reservation = require('../models/reservation.model');
const Event = require('../models/event.model');

exports.createReservation = async (req, res) => {
  try {
    const { user, event, tickets } = req.body;
    const eventData = await Event.findById(event);
    
    if (!eventData || eventData.availableTickets < tickets) {
      return res.status(400).json({ error: 'Pas assez de billets disponibles' });
    }

    const totalPrice = eventData.price * tickets;
    const reservation = new Reservation({ user, event, tickets, totalPrice });
    await reservation.save();

    eventData.availableTickets -= tickets;
    await eventData.save();

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réservation' });
  }
};

// exports.getUserReservations = async (req, res) => {
//   const reservations = await Reservation.find({ user: req.user.id }).populate('event');
//   res.json(reservations);
// };

// exports.getUserReservations = async (req, res) => {
//   try {
//     const reservations = await Reservation.find({ user: req.user.id }).populate("event");
//     res.json(reservations);
//   } catch (error) {
//     res.status(500).json({ error: "Erreur lors de la récupération des réservations." });
//   }
// };
exports.getUserReservations = async (req, res) => {
  try {
    console.log("🔍 Récupération des réservations pour l'utilisateur :", req.user.id);
    const reservations = await Reservation.find({ user: req.user.id }).populate("event");
    
    if (!reservations.length) {
      console.log("⚠️ Aucune réservation trouvée.");
    } else {
      console.log("✅ Réservations trouvées :", reservations);
    }
    
    res.json(reservations);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des réservations :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des réservations." });
  }
};
