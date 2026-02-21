const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS – allow all origins in development, restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET'],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`QuantEdge backend running on port ${PORT}`);
});

module.exports = app;
