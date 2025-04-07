const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// Middleware
// Middleware - ADD THESE LINES
// app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: 'https://kaya-eight.vercel.app', // your Vercel frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // only if you're using cookies or sessions
}));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({ origin: 'http://localhost:5173' }));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/analysis', require('./routes/analysis'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));