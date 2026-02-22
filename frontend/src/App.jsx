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
    if (!inputValue.trim()) return;

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const response = await fetchPredictions(
        inputValue.trim().toUpperCase()
      );

      if (!response || !response.success) {
        throw new Error("Invalid response from server");
      }

      setResults(response.data);
    } catch (err) {
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
        <h2>QuantEdge AI</h2>
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

      {/* INFO */}
      <section style={infoSection}>
        <div style={infoGrid}>
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

/* ---------------- FULL WIDTH LAYOUT ---------------- */

const appStyle = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: "#060b18",
  color: "#e6f1ff",
  fontFamily: "Inter, sans-serif"
};

const headerStyle = {
  width: "100%",
  padding: "20px 5vw",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #111a2e",
  boxSizing: "border-box"
};

const mainStyle = {
  flex: 1,
  width: "100%",
  padding: "60px 5vw",
  boxSizing: "border-box"
};

/* HERO */

const heroTitle = {
  fontSize: "clamp(28px, 5vw, 52px)",
  fontWeight: 800,
  textAlign: "center",
  marginBottom: 20
};

const subtitle = {
  textAlign: "center",
  color: "#8fa6d6",
  marginBottom: 40
};

/* FORM */

const inputWrapper = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
  marginBottom: 20
};

const inputStyle = {
  flex: "1 1 320px",
  maxWidth: 500,
  background: "#0f1626",
  border: "1px solid #1f2a44",
  borderRadius: 10,
  padding: "14px 16px",
  color: "#fff",
  fontSize: 16
};

const buttonStyle = {
  background: "#111827",
  color: "#00d4ff",
  border: "1px solid #00d4ff",
  borderRadius: 10,
  padding: "14px 24px",
  fontWeight: 600
};

const dropdownWrapper = {
  display: "flex",
  justifyContent: "center",
  marginBottom: 30
};

const dropdownStyle = {
  background: "#0f1626",
  border: "1px solid #1f2a44",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#fff",
  fontSize: 14
};

const errorStyle = {
  marginTop: 20,
  padding: 12,
  background: "#1a1f2e",
  border: "1px solid #ff1744",
  borderRadius: 8,
  color: "#ff6b81",
  textAlign: "center"
};

/* INFO */

const infoSection = {
  width: "100%",
  padding: "60px 5vw",
  background: "#0a1224",
  borderTop: "1px solid #111a2e",
  boxSizing: "border-box"
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 40
};

const infoTitle = {
  fontSize: 18,
  marginBottom: 10,
  color: "#ffffff"
};

const infoText = {
  color: "#8fa6d6",
  lineHeight: 1.6
};

/* FOOTER */

const footerStyle = {
  textAlign: "center",
  padding: "24px 0",
  borderTop: "1px solid #111a2e",
  fontSize: 13,
  color: "#6c7a99",
  position: "relative",
  cursor: "pointer"
};

const factBox = {
  position: "absolute",
  bottom: "55px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#0f1626",
  border: "1px solid #00d4ff",
  padding: "14px 18px",
  borderRadius: 10,
  width: "90%",
  maxWidth: 500,
  fontSize: 13,
  color: "#cde3ff",
  boxShadow: "0 0 20px rgba(0,212,255,0.15)"
};
