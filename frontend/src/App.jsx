import React, { useState } from "react";
import CompareView from "./CompareView.jsx";
import { fetchPredictions } from "./api";

const POPULAR_STOCKS = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "AMZN",
  "GOOGL",
  "META"
];

const STOCK_FACTS = [
  "India’s stock market began in 1875 in Bombay.",
  "SEBI was established in 1992.",
  "Nifty 50 tracks 50 leading NSE companies.",
  "India follows a T+1 settlement system.",
  "Rule of 72 estimates doubling time."
];

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFact, setShowFact] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    console.log("Analyze clicked");
    console.log("Input:", inputValue);

    if (!inputValue || !inputValue.trim()) {
      console.log("Empty input, stopping");
      return;
    }

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const response = await fetchPredictions(
        inputValue.trim().toUpperCase()
      );

      console.log("API Response:", response);

      if (!response || !response.success) {
        throw new Error("Invalid response from server");
      }

      setResults(response.data);
    } catch (err) {
      console.error("Error occurred:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const randomFact =
    STOCK_FACTS[Math.floor(Math.random() * STOCK_FACTS.length)];

  return (
    <div style={appStyle}>
      {/* HEADER */}
      <header style={headerStyle}>
        <h2 style={{ margin: 0 }}>QuantEdge AI</h2>
        <a
          href="https://github.com/Lakshya-Khattri/stock-price-forecasting-system.git"
          target="_blank"
          rel="noopener noreferrer"
          style={githubStyle}
        >
          GitHub Repo
        </a>
      </header>

      {/* MAIN */}
      <main style={mainStyle}>
        <h1 style={heroTitle}>
          Intelligent Stock Forecasting Platform
        </h1>

        <p style={subtitle}>
          Enter ticker symbols (comma separated) to predict tomorrow’s closing price.
        </p>

        {/* FORM WRAPPER */}
        <form onSubmit={handleSubmit} style={inputWrapper}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="AAPL, TSLA, NVDA..."
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {/* DROPDOWN */}
        <div style={dropdownWrapper}>
          <select
            style={dropdownStyle}
            onChange={(e) => {
              const selected = e.target.value;
              if (!selected) return;

              setInputValue((prev) => {
                if (!prev) return selected;
                if (prev.includes(selected)) return prev;
                return prev + ", " + selected;
              });
            }}
          >
            <option value="">Add Popular Stock</option>
            {POPULAR_STOCKS.map((stock) => (
              <option key={stock} value={stock}>
                {stock}
              </option>
            ))}
          </select>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {results && <CompareView results={results} />}
      </main>

      {/* ABOUT + CONTACT */}
      <section style={infoSection}>
        <div style={infoContainer}>
          <div>
            <h3 style={infoTitle}>About</h3>
            <p style={infoText}>
              QuantEdge AI predicts next-day stock prices using
              time-aware regression models with engineered
              financial indicators.
            </p>
          </div>

          <div>
            <h3 style={infoTitle}>Contact</h3>
            <p style={infoText}>
              Developer: Lakshya Khattri
              <br />
              GitHub: github.com/Lakshya-Khattri
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={footerStyle}
        onMouseEnter={() => setShowFact(true)}
        onMouseLeave={() => setShowFact(false)}
      >
        Built With Precision · CodeForge

        {showFact && (
          <div style={factBox}>
            💡 {randomFact}
          </div>
        )}
      </footer>
    </div>
  );
}
