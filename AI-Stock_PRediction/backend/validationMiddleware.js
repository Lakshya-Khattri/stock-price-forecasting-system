const TICKER_REGEX = /^[A-Za-z]{1,5}(\.[A-Za-z]{1,2})?$/;
const MAX_TICKERS = 5;

const validateTickers = (req, res, next) => {
  const { tickers } = req.query;

  if (!tickers || tickers.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "tickers" is required. Example: ?tickers=AAPL,TSLA',
    });
  }

  const tickerList = tickers
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickerList.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid tickers provided.',
    });
  }

  if (tickerList.length > MAX_TICKERS) {
    return res.status(400).json({
      success: false,
      error: `Maximum ${MAX_TICKERS} tickers allowed per request.`,
    });
  }

  const invalidTickers = tickerList.filter((t) => !TICKER_REGEX.test(t));
  if (invalidTickers.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Invalid ticker symbol(s): ${invalidTickers.join(', ')}. Tickers must be 1–5 letters.`,
    });
  }

  req.validatedTickers = tickerList;
  next();
};

module.exports = { validateTickers };
