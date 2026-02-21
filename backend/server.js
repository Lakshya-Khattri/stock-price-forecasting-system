const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS CONFIG -------------------- */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or tools like Postman
      if (!origin) return callback(null, true);

      // Allow localhost during development
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }

      // Allow explicitly defined production origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

/* -------------------- ROUTES -------------------- */

app.use('/api', routes);

/* -------------------- HEALTH CHECK -------------------- */

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/* -------------------- 404 HANDLER -------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

/* -------------------- ERROR HANDLER -------------------- */

app.use(errorHandler);

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`QuantEdge backend running on port ${PORT}`);
});

module.exports = app;
