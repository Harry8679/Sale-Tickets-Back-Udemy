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

exports.getUserReservations = async (req, res) => {
  const reservations = await Reservation.find({ user: req.user.id }).populate('event');
  res.json(reservations);
};