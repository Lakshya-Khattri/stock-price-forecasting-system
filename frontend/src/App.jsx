import React, { useState, useRef, useEffect } from 'react';
import CompareView from './CompareView.jsx';
import { fetchPredictions } from './api';

const POPULAR_TICKERS = [
  'AAPL', 'TSLA', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'NFLX', 'AMD', 'SPY',
];

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleSubmit = async () => {
    const value = inputValue.trim().toUpperCase();
    if (!value) return;

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const response = await fetchPredictions(value);
      if (!response.success) throw new Error(response.error || 'Request failed');
      setResults(response.data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={appStyle}>
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

      <main style={mainStyle}>
        <div style={heroStyle}>
          <h1 style={heroTitleStyle}>
            Intelligent Stock Forecasting Platform
          </h1>
          <p style={heroSubtitleStyle}>
            Enter up to 5 ticker symbols to train a machine learning model
            and predict tomorrow’s closing price.
          </p>
        </div>

        <div style={inputSectionStyle}>
          <div style={inputWrapperStyle}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="AAPL, TSLA, NVDA..."
              style={inputStyle}
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={submitBtnStyle}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {results && (
          <div ref={resultsRef}>
            <CompareView results={results} />
          </div>
        )}
      </main>

      <footer style={footerStyle}>
        Made by Lakshya Khattri · CodeForge
      </footer>
    </div>
  );
}

/* -------- Styles -------- */

const appStyle = {
  minHeight: '100vh',
  background: '#070a14',
  color: '#e6f1ff',
  fontFamily: 'Inter, sans-serif',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #1f2a44',
};

const githubStyle = {
  color: '#00d4ff',
  textDecoration: 'none',
  fontWeight: 600,
};

const mainStyle = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '40px 20px',
};

const heroStyle = {
  textAlign: 'center',
  marginBottom: 40,
};

const heroTitleStyle = {
  fontSize: 'clamp(28px, 5vw, 52px)',
  fontWeight: 800,
  marginBottom: 16,
};

const heroSubtitleStyle = {
  fontSize: 16,
  color: '#9fb3d1',
  maxWidth: 600,
  margin: '0 auto',
};

const inputSectionStyle = {
  maxWidth: 700,
  margin: '0 auto 40px',
};

const inputWrapperStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
};

const inputStyle = {
  flex: 1,
  minWidth: 200,
  background: '#0f1626',
  border: '1px solid #1f2a44',
  borderRadius: 12,
  padding: '14px 16px',
  color: '#fff',
  fontSize: 16,
};

const submitBtnStyle = {
  background: '#111827',
  color: '#00d4ff',
  border: '1px solid #00d4ff',
  borderRadius: 12,
  padding: '14px 24px',
  cursor: 'pointer',
  fontWeight: 600,
};

const errorStyle = {
  background: '#1f1f2e',
  border: '1px solid #ff1744',
  padding: 12,
  borderRadius: 8,
  textAlign: 'center',
  color: '#ff6b81',
  maxWidth: 600,
  margin: '20px auto',
};

const footerStyle = {
  textAlign: 'center',
  padding: 20,
  borderTop: '1px solid #1f2a44',
  marginTop: 60,
  color: '#8899bb',
};
