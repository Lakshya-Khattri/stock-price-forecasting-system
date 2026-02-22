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
router.get(
  '/predict',
  rateLimiter,
  validateTickers,
  async (req, res, next) => {
    try {
      const tickers = req.validatedTickers;

      if (!Array.isArray(tickers) || tickers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid tickers provided',
        });
      }

      const results = await stockService.getPredictions(tickers);

      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        count: results.length,
        data: results,
      });

    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
