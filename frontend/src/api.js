import axios from 'axios';

/**
 * BASE_URL determines where your frontend sends requests.
 * It checks Netlify environment variables first, then falls back to your Render URL.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "https://stock-price-forecasting-system.onrender.com";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 180000, // 3 minutes - ML training and prediction can take time
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error messages
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. ML model training can take up to 2 minutes.' : null) ||
      err.message ||
      'Network error. Is the backend running?';
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetches stock predictions for given tickers.
 */
export const fetchPredictions = async (tickers) => {
  const tickerString = Array.isArray(tickers) ? tickers.join(',') : tickers;
  const res = await client.get(`/api/predict?tickers=${tickerString}`);
  return res.data;
};

/**
 * Checks if the Render backend is active.
 */
export const fetchHealth = async () => {
  const res = await client.get('/api/health');
  return res.data;
};

export default client;
