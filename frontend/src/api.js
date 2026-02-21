import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://your-quantedge-backend.onrender.com'
    : '/api');

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 180_000, // 3 min – ML training can take a while
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

export const fetchPredictions = async (tickers) => {
  const tickerString = Array.isArray(tickers) ? tickers.join(',') : tickers;
  const res = await client.get(`/predict?tickers=${tickerString}`);
  return res.data;
};

export const fetchHealth = async () => {
  const res = await client.get('/health');
  return res.data;
};

export default client;
