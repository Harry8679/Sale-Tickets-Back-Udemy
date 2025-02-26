const Reservation = require('../models/reservationModel');
const Event = require('../models/eventModel');

exports.createReservation = async (req, res) => {
  const { eventId, quantity } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const reservation = await Reservation.create({
    user: req.user.id,
    event: eventId,
    quantity,
  });

  res.status(201).json(reservation);
};

exports.getUserReservations = async (req, res) => {
  const reservations = await Reservation.find({ user: req.user.id }).populate('event');
  res.json(reservations);
};