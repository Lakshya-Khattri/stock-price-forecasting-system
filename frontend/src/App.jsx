import React, { useState, useRef, useEffect } from 'react';
import CompareView from './CompareView';
import { fetchPredictions } from './api';

const POPULAR_TICKERS = [
  'AAPL', 'TSLA', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'NFLX', 'AMD', 'SPY',
];

const TICKER_SUGGESTIONS = [
  { label: 'Mag 7', tickers: 'AAPL,MSFT,GOOGL,AMZN,META,NVDA,TSLA' },
  { label: 'EV Wars', tickers: 'TSLA,RIVN,LCID' },
  { label: 'AI Chips', tickers: 'NVDA,AMD,INTC' },
  { label: 'Big Tech', tickers: 'AAPL,MSFT,GOOGL' },
];

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return;
    const msgs = [
      'Fetching historical data via yfinance…',
      'Engineering lag & moving average features…',
      'Training RandomForest model…',
      'Running time-series cross-validation…',
      'Generating price predictions…',
      'Almost there…',
    ];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const id = setInterval(() => {
      i = (i + 1) % msgs.length;
      setLoadingMsg(msgs[i]);
    }, 2800);
    return () => clearInterval(id);
  }, [loading]);

  const handleSubmit = async (tickerStr) => {
    const value = (tickerStr || inputValue).trim().toUpperCase();
    if (!value) return;

    setError(null);
    setResults(null);
    setLoading(true);
    if (tickerStr) setInputValue(tickerStr);

    try {
      const response = await fetchPredictions(value);
      if (!response.success) throw new Error(response.error || 'Request failed');
      setResults(response.data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const tickerList = inputValue
    .toUpperCase()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div style={appStyle}>
      {/* Background grid */}
      <div style={bgGridStyle} aria-hidden />
      <div style={bgGlowStyle} aria-hidden />

      {/* Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>
          <span style={logoIconStyle}>◈</span>
          <div>
            <span style={logoTextStyle}>QuantEdge</span>
            <span style={logoAIStyle}> AI</span>
          </div>
        </div>
        <nav style={navStyle}>
          <span style={navBadgeStyle}>
            <span style={dotStyle} />
            Live ML Engine
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={navLinkStyle}
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main style={mainStyle}>
        <div style={heroStyle}>
          <div style={heroTagStyle}>
            <span style={dotStyle} />
            Powered by RandomForestRegressor · No API Keys Required
          </div>
          <h1 style={heroTitleStyle}>
            Intelligent Stock
            <br />
            <span style={heroAccentStyle}>Forecasting Platform</span>
          </h1>
          <p style={heroSubtitleStyle}>
            Enter up to 5 ticker symbols to train a machine learning model on historical data,
            predict tomorrow's closing price, and receive Buy/Sell/Hold signals.
          </p>
        </div>

        {/* Input section */}
        <div style={inputSectionStyle}>
          <div style={inputWrapperStyle}>
            <div style={inputFieldStyle}>
              <span style={inputIconStyle}>⌕</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="AAPL, TSLA, NVDA, MSFT…"
                style={inputStyle}
                disabled={loading}
                aria-label="Stock ticker symbols"
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue('')}
                  style={clearBtnStyle}
                  aria-label="Clear input"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !inputValue.trim()}
              style={{
                ...submitBtnStyle,
                opacity: loading || !inputValue.trim() ? 0.5 : 1,
                cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={spinnerStyle} />
              ) : (
                <>
                  <span>Analyze</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>

          {/* Ticker pills */}
          {tickerList.length > 0 && (
            <div style={pillRowStyle}>
              {tickerList.map((t) => (
                <span key={t} style={pillStyle}>{t}</span>
              ))}
            </div>
          )}

          {/* Quick-select suggestions */}
          <div style={suggestionsStyle}>
            <span style={suggestLabelStyle}>Quick pick:</span>
            {TICKER_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSubmit(s.tickers)}
                disabled={loading}
                style={suggestBtnStyle}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Popular tickers */}
          <div style={popularStyle}>
            {POPULAR_TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setInputValue((prev) => {
                    const existing = prev.toUpperCase().split(',').map((x) => x.trim()).filter(Boolean);
                    if (existing.includes(t)) return prev;
                    if (existing.length >= 5) return prev;
                    return existing.length ? `${prev}, ${t}` : t;
                  });
                  inputRef.current?.focus();
                }}
                style={popularBtnStyle}
                disabled={loading}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={loadingBoxStyle} className="fade-in-up">
            <div style={loadingInnerStyle}>
              <div style={loadingSpinnerStyle} />
              <div>
                <p style={loadingTitleStyle}>ML Engine Running</p>
                <p style={loadingSubStyle}>{loadingMsg}</p>
              </div>
            </div>
            <div style={loadingBarTrackStyle}>
              <div style={loadingBarStyle} />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={errorBoxStyle} className="fade-in-up" role="alert">
            <span style={errorIconStyle}>⚠</span>
            <div>
              <p style={errorTitleStyle}>Prediction Failed</p>
              <p style={errorMsgStyle}>{error}</p>
            </div>
            <button onClick={() => setError(null)} style={errorDismissStyle}>×</button>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div ref={resultsRef} style={resultsStyle} className="fade-in-up">
            <div style={resultHeaderStyle}>
              <h2 style={resultTitleStyle}>Analysis Results</h2>
              <span style={resultTimeStyle}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <CompareView results={results} />
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div style={emptyStateStyle}>
            <div style={statsGridStyle}>
              {[
                { val: '7', label: 'ML Features', sub: 'lag + moving avg' },
                { val: '5×', label: 'CV Splits', sub: 'time-series aware' },
                { val: '100', label: 'Trees', sub: 'random forest' },
                { val: '6mo', label: 'Chart Data', sub: 'historical view' },
              ].map((s) => (
                <div key={s.val} style={statCardStyle}>
                  <span style={statValStyle}>{s.val}</span>
                  <span style={statLabelStyle}>{s.label}</span>
                  <span style={statSubStyle}>{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <p style={footerTextStyle}>
          QuantEdge AI · Data via <strong>yfinance</strong> · No API keys required · Not financial advice
        </p>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

/* ---- Styles ---- */
const appStyle = {
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
};

const bgGridStyle = {
  position: 'fixed',
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(37,45,74,0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37,45,74,0.4) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
  zIndex: 0,
  pointerEvents: 'none',
};

const bgGlowStyle = {
  position: 'fixed',
  top: '-20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '60vw',
  height: '50vh',
  background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
  zIndex: 0,
  pointerEvents: 'none',
};

const headerStyle = {
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 40px',
  borderBottom: '1px solid var(--border)',
  background: 'rgba(11,14,23,0.8)',
  backdropFilter: 'blur(16px)',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const logoIconStyle = {
  fontSize: 28,
  color: 'var(--accent-cyan)',
  textShadow: '0 0 20px var(--accent-cyan-glow)',
  lineHeight: 1,
};

const logoTextStyle = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: '-0.03em',
  color: 'var(--text-primary)',
};

const logoAIStyle = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: '-0.03em',
  color: 'var(--accent-cyan)',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 20,
};

const navBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--buy-green)',
  background: 'var(--buy-green-dim)',
  padding: '4px 12px',
  borderRadius: 20,
  border: '1px solid rgba(0,230,118,0.3)',
};

const dotStyle = {
  display: 'inline-block',
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: 'currentColor',
  animation: 'pulse-dot 2s infinite',
};

const navLinkStyle = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.02em',
  transition: 'color 0.2s',
};

const mainStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 1200,
  margin: '0 auto',
  padding: '60px 40px 40px',
};

const heroStyle = {
  textAlign: 'center',
  marginBottom: 48,
};

const heroTagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--accent-cyan)',
  background: 'var(--accent-cyan-dim)',
  border: '1px solid rgba(0,212,255,0.25)',
  padding: '5px 16px',
  borderRadius: 20,
  marginBottom: 20,
  letterSpacing: '0.05em',
};

const heroTitleStyle = {
  fontSize: 'clamp(40px, 6vw, 68px)',
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  color: 'var(--text-primary)',
  marginBottom: 20,
};

const heroAccentStyle = {
  background: 'linear-gradient(135deg, var(--accent-cyan), #7c4dff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const heroSubtitleStyle = {
  fontSize: 16,
  color: 'var(--text-secondary)',
  maxWidth: 560,
  margin: '0 auto',
  lineHeight: 1.7,
};

const inputSectionStyle = {
  maxWidth: 700,
  margin: '0 auto 48px',
};

const inputWrapperStyle = {
  display: 'flex',
  gap: 12,
  marginBottom: 12,
};

const inputFieldStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: 'var(--bg-input)',
  border: '1px solid var(--border-bright)',
  borderRadius: 'var(--radius)',
  padding: '0 16px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const inputIconStyle = {
  fontSize: 20,
  color: 'var(--text-dim)',
  lineHeight: 1,
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: 16,
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: 500,
  letterSpacing: '0.04em',
  padding: '16px 0',
};

const clearBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-dim)',
  fontSize: 22,
  cursor: 'pointer',
  lineHeight: 1,
  padding: '0 4px',
};

const submitBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 28px',
  background: 'linear-gradient(135deg, var(--accent-cyan), #0090cc)',
  color: '#000',
  fontFamily: 'Syne, sans-serif',
  fontSize: 14,
  fontWeight: 700,
  border: 'none',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
  height: 54,
  minWidth: 110,
  justifyContent: 'center',
  transition: 'opacity 0.2s, transform 0.1s',
};

const spinnerStyle = {
  width: 18,
  height: 18,
  border: '2px solid rgba(0,0,0,0.3)',
  borderTopColor: '#000',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
  display: 'inline-block',
};

const pillRowStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginBottom: 12,
};

const pillStyle = {
  padding: '3px 10px',
  background: 'var(--accent-cyan-dim)',
  color: 'var(--accent-cyan)',
  border: '1px solid rgba(0,212,255,0.3)',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: 600,
  letterSpacing: '0.06em',
};

const suggestionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 10,
  flexWrap: 'wrap',
};

const suggestLabelStyle = {
  fontSize: 11,
  color: 'var(--text-dim)',
  fontFamily: 'JetBrains Mono, monospace',
};

const suggestBtnStyle = {
  padding: '4px 12px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-secondary)',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  cursor: 'pointer',
  transition: 'border-color 0.15s, color 0.15s',
};

const popularStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
};

const popularBtnStyle = {
  padding: '4px 10px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-dim)',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: 500,
  cursor: 'pointer',
  letterSpacing: '0.04em',
  transition: 'border-color 0.15s, color 0.15s',
};

const loadingBoxStyle = {
  maxWidth: 520,
  margin: '0 auto 32px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '24px',
  overflow: 'hidden',
};

const loadingInnerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 16,
};

const loadingSpinnerStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '3px solid var(--border)',
  borderTopColor: 'var(--accent-cyan)',
  animation: 'spin 0.8s linear infinite',
  flexShrink: 0,
};

const loadingTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 4,
};

const loadingSubStyle = {
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--text-secondary)',
};

const loadingBarTrackStyle = {
  height: 3,
  background: 'var(--border)',
  borderRadius: 2,
  overflow: 'hidden',
};

const loadingBarStyle = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--accent-cyan), #7c4dff)',
  borderRadius: 2,
  animation: 'loading-bar 6s ease-in-out infinite',
};

const errorBoxStyle = {
  maxWidth: 600,
  margin: '0 auto 32px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  background: 'var(--sell-red-dim)',
  border: '1px solid rgba(255,23,68,0.4)',
  borderRadius: 'var(--radius)',
  padding: '16px 20px',
};

const errorIconStyle = {
  fontSize: 18,
  color: 'var(--sell-red)',
  flexShrink: 0,
  marginTop: 2,
};

const errorTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--sell-red)',
  marginBottom: 3,
};

const errorMsgStyle = {
  fontSize: 13,
  color: 'var(--text-secondary)',
  fontFamily: 'JetBrains Mono, monospace',
};

const errorDismissStyle = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: 'var(--text-dim)',
  fontSize: 20,
  cursor: 'pointer',
  lineHeight: 1,
  flexShrink: 0,
};

const resultsStyle = {
  marginTop: 12,
};

const resultHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
  paddingBottom: 16,
  borderBottom: '1px solid var(--border)',
};

const resultTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
};

const resultTimeStyle = {
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--text-dim)',
};

const emptyStateStyle = {
  marginTop: 20,
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 16,
  maxWidth: 700,
  margin: '0 auto',
};

const statCardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '20px 16px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const statValStyle = {
  fontSize: 32,
  fontWeight: 800,
  color: 'var(--accent-cyan)',
  letterSpacing: '-0.03em',
  fontFamily: 'JetBrains Mono, monospace',
};

const statLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const statSubStyle = {
  fontSize: 10,
  color: 'var(--text-dim)',
  fontFamily: 'JetBrains Mono, monospace',
};

const footerStyle = {
  position: 'relative',
  zIndex: 1,
  borderTop: '1px solid var(--border)',
  padding: '20px 40px',
  textAlign: 'center',
  marginTop: 60,
};

const footerTextStyle = {
  fontSize: 12,
  color: 'var(--text-dim)',
  fontFamily: 'JetBrains Mono, monospace',
};
