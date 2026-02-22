import axios from "axios";

/*
  BASE_URL:
  - Uses Vercel environment variable if available
  - Falls back to Render backend URL for safety
*/
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://stock-price-forecasting-system.onrender.com";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 180000, // ML can take time
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      (error.code === "ECONNABORTED"
        ? "Request timed out. Backend may be sleeping (Render free tier)."
        : null) ||
      error.message ||
      "Network error. Backend may be unreachable.";

    return Promise.reject(new Error(message));
  }
);

/* ---------------- API CALLS ---------------- */

/**
 * Fetch stock predictions
 */
export const fetchPredictions = async (tickers) => {
  const tickerString = Array.isArray(tickers)
    ? tickers.join(",")
    : tickers;

  const response = await client.get(
    `/api/predict?tickers=${encodeURIComponent(tickerString)}`
  );

  return response.data;
};

/**
 * Backend health check
 */
export const fetchHealth = async () => {
  const response = await client.get(`/health`);
  return response.data;
};

export default client;
