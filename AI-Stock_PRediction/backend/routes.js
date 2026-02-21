const express = require('express');
const router = express.Router();
const rateLimiter = require('./rateLimiter');
const { validateTickers } = require('./validationMiddleware');
const stockService = require('./stockService');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuantEdge AI Backend',
  });
});

// Prediction endpoint
router.get('/predict', rateLimiter, validateTickers, async (req, res, next) => {
  try {
    const tickers = req.validatedTickers;
    const results = await stockService.getPredictions(tickers);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
