const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const config = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// The frontend container's nginx sits in front of this API, so trust one proxy hop
// (needed for rate limiting to see the real client IP).
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Brute-force protection on login/registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' }
});

app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({ success: dbConnected, database: dbConnected ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', roleRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use(errorHandler);

module.exports = app;
