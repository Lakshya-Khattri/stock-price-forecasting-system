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

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const response = await fetchPredictions(
        inputValue.toUpperCase()
      );

      if (!response.success) {
        throw new Error("Failed to fetch predictions");
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

        <div style={inputWrapper}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="AAPL, TSLA, NVDA..."
            style={inputStyle}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

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
              QuantEdge AI is a machine learning-powered stock forecasting
              platform predicting next-day closing prices using engineered
              financial features and time-aware regression models.
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

/* ---------------- RESPONSIVE STYLES ---------------- */

const appStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "#060b18",
  color: "#e6f1ff",
  fontFamily: "Inter, sans-serif",
  width: "100%",
  overflowX: "hidden"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 24px",
  borderBottom: "1px solid #111a2e",
  flexWrap: "wrap",
  gap: "10px"
};

const githubStyle = {
  color: "#00d4ff",
  textDecoration: "none",
  fontWeight: 600
};

const mainStyle = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 20px",
  textAlign: "center",
  boxSizing: "border-box"
};

const heroTitle = {
  fontSize: "clamp(26px, 6vw, 52px)",
  fontWeight: 800,
  marginBottom: 15
};

const subtitle = {
  color: "#8fa6d6",
  maxWidth: 600,
  margin: "0 auto 30px"
};

const inputWrapper = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto"
};

const inputStyle = {
  flex: "1 1 250px",
  minWidth: 0,
  background: "#0f1626",
  border: "1px solid #1f2a44",
  borderRadius: 10,
  padding: "14px 16px",
  color: "#fff",
  fontSize: 16
};

const dropdownWrapper = {
  marginTop: 15,
  width: "100%",
  maxWidth: "300px",
  marginLeft: "auto",
  marginRight: "auto"
};

const dropdownStyle = {
  width: "100%",
  background: "#0f1626",
  border: "1px solid #1f2a44",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#fff",
  fontSize: 14
};

const buttonStyle = {
  flex: "0 0 auto",
  background: "#111827",
  color: "#00d4ff",
  border: "1px solid #00d4ff",
  borderRadius: 10,
  padding: "14px 24px",
  fontWeight: 600
};

const errorStyle = {
  marginTop: 20,
  padding: 12,
  background: "#1a1f2e",
  border: "1px solid #ff1744",
  borderRadius: 8,
  color: "#ff6b81"
};

const infoSection = {
  borderTop: "1px solid #111a2e",
  padding: "50px 20px",
  background: "#0a1224"
};

const infoContainer = {
  maxWidth: "1100px",
  margin: "0 auto",
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

const footerStyle = {
  textAlign: "center",
  padding: "22px 0",
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
