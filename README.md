# QuantEdge AI – Intelligent Stock Forecasting Platform

A production-ready full-stack ML application for next-day stock price prediction using Random Forest Regression and Yahoo Finance data. No API keys required.

---

## Architecture Overview

```
quantedge/
├── backend/                 # Node.js + Express + Python ML
│   ├── server.js            # Express app entry point
│   ├── routes.js            # API route definitions
│   ├── stockService.js      # Service layer (spawns Python)
│   ├── mlService.py         # RandomForest ML microservice
│   ├── validationMiddleware.js
│   ├── rateLimiter.js
│   ├── errorHandler.js
│   ├── requirements.txt     # Python deps
│   ├── package.json
│   └── render.yaml          # Render deployment config
│
└── frontend/                # React + Vite
    ├── src/
    │   ├── App.jsx           # Main application
    │   ├── api.js            # Axios API layer
    │   ├── index.css         # Global dark theme
    │   ├── main.jsx          # React entry
    │   └── components/
    │       ├── ChartComponent.jsx   # Recharts multi-line chart
    │       ├── StockCard.jsx        # Per-stock info card
    │       └── CompareView.jsx      # Multi-stock layout
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── netlify.toml          # Netlify deployment config
```

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- Python 3.9+
- pip

### Backend Setup

```bash
cd backend
npm install
pip3 install -r requirements.txt

# Start server (port 5000)
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start dev server (port 5173, proxies /api → localhost:5000)
npm run dev
```

Open http://localhost:5173

---

## API Reference

### GET /api/health
Returns service health status.

### GET /api/predict?tickers=AAPL,TSLA,NVDA
Runs ML prediction for each ticker.

**Query params:**
- `tickers` (required) — comma-separated ticker symbols (max 5)

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "count": 2,
  "data": [
    {
      "success": true,
      "ticker": "AAPL",
      "currentPrice": 185.50,
      "predictedPrice": 188.92,
      "changePercent": 1.84,
      "signal": "HOLD",
      "rmse": 3.2145,
      "history": [...],
      "featureCount": 7,
      "modelType": "RandomForestRegressor"
    }
  ]
}
```

---

## ML Model Details

- **Algorithm:** RandomForestRegressor (scikit-learn)
- **Trees:** 100 estimators, max depth 8
- **Features:** 7 total
  - `lag_1` through `lag_5` — previous 1–5 day closing prices
  - `ma_5` — 5-day simple moving average
  - `ma_10` — 10-day simple moving average
- **Evaluation:** TimeSeriesSplit 5-fold cross-validation RMSE
- **Data:** 1 year of daily OHLCV via yfinance
- **Chart:** Last 6 months of history returned

**Signal Logic:**
| Condition | Signal |
|-----------|--------|
| predicted > current by >2% | BUY ▲ |
| predicted < current by >2% | SELL ▼ |
| within ±2% | HOLD ◆ |

---

## Deployment

### Backend → Render

1. Push `backend/` to a GitHub repository
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build Command:** `npm install && pip3 install -r requirements.txt`
   - **Start Command:** `node server.js`
   - **Environment:** `NODE_ENV=production`, `ALLOWED_ORIGINS=https://your-app.netlify.app`
4. Use the included `render.yaml` for one-click deploy

### Frontend → Netlify

1. Push `frontend/` to GitHub
2. Create new site on [netlify.com](https://netlify.com), connect repo
3. Set **Build command:** `npm run build`, **Publish dir:** `dist`
4. Add environment variable: `VITE_API_URL=https://your-quantedge-backend.onrender.com/api`
5. The included `netlify.toml` handles SPA routing redirects

---

## Security & Production Notes

- No API keys or secrets anywhere in the codebase
- Rate limiting: 20 requests/minute per IP
- Input validation: ticker symbols 1–5 letters, max 5 per request
- CORS restricted to `ALLOWED_ORIGINS` in production
- All errors centralized through `errorHandler.js`
- Python process timeout: 2 minutes per ticker

---

## Disclaimer

This application is for educational and demonstration purposes only. The predictions made by this ML model should **not** be used as financial advice. Past performance does not guarantee future results.
