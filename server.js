const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

const PORT = process.env.PORT || 5700;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
