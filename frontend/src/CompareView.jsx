import React from 'react';
import StockCard from './StockCard';
import ChartComponent, { CHART_COLORS } from './ChartComponent';

export default function CompareView({ results }) {
  if (!results || results.length === 0) return null;

  const validResults = results.filter((r) => !r.error);
  const errorResults = results.filter((r) => r.error);

  const signalSummary = validResults.reduce(
    (acc, r) => {
      acc[r.signal] = (acc[r.signal] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div style={wrapperStyle}>
      {/* Summary banner */}
      {validResults.length > 1 && (
        <div style={summaryStyle}>
          <span style={summaryLabelStyle}>PORTFOLIO SIGNALS</span>

          <div style={summaryBadgesStyle}>
            {['BUY', 'HOLD', 'SELL'].map((sig) =>
              signalSummary[sig] ? (
                <span
                  key={sig}
                  style={{
                    ...sigBadgeStyle,
                    color:
                      sig === 'BUY'
                        ? 'var(--buy-green)'
                        : sig === 'SELL'
                        ? 'var(--sell-red)'
                        : 'var(--hold-amber)',
                    background:
                      sig === 'BUY'
                        ? 'var(--buy-green-dim)'
                        : sig === 'SELL'
                        ? 'var(--sell-red-dim)'
                        : 'var(--hold-amber-dim)',
                    borderColor:
                      sig === 'BUY'
                        ? 'var(--buy-green)'
                        : sig === 'SELL'
                        ? 'var(--sell-red)'
                        : 'var(--hold-amber)',
                  }}
                >
                  {signalSummary[sig]}× {sig}
                </span>
              ) : null
            )}
          </div>

          <span style={summaryCountStyle}>
            {results.length} ticker{results.length > 1 ? 's' : ''} analyzed
          </span>
        </div>
      )}

      {/* Chart */}
      <ChartComponent stocksData={results} />

      {/* Cards */}
      <div style={gridStyle}>
        {results.map((stock, i) => (
          <StockCard
            key={stock.ticker}
            data={stock}
            accentColor={CHART_COLORS[i % CHART_COLORS.length]}
            index={i}
          />
        ))}
      </div>

      {errorResults.length > 0 && (
        <p style={errorNoteStyle}>
          {errorResults.length} ticker
          {errorResults.length > 1 ? 's' : ''} failed to load. Check that the
          symbol is valid on Yahoo Finance.
        </p>
      )}
    </div>
  );
}

/* ---------- FULL WIDTH WRAPPER ---------- */

const wrapperStyle = {
  width: '100%',
  marginTop: 40,
  boxSizing: 'border-box'
};

/* ---------- SUMMARY ---------- */

const summaryStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '14px 20px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  marginBottom: 24,
  flexWrap: 'wrap',
};

const summaryLabelStyle = {
  fontSize: 10,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--text-dim)',
  letterSpacing: '0.12em',
  fontWeight: 600,
};

const summaryBadgesStyle = {
  display: 'flex',
  gap: 8,
  flex: 1,
  flexWrap: 'wrap'
};

const sigBadgeStyle = {
  padding: '4px 12px',
  borderRadius: 20,
  border: '1px solid',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.05em',
};

const summaryCountStyle = {
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--text-secondary)',
};

/* ---------- GRID ---------- */

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 20,
  width: '100%'
};

/* ---------- ERROR ---------- */

const errorNoteStyle = {
  marginTop: 20,
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--sell-red)',
  textAlign: 'center',
  opacity: 0.7,
};
