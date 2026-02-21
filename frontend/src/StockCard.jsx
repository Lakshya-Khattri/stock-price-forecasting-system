import React from 'react';

const SIGNAL_CONFIG = {
  BUY: {
    label: 'BUY',
    color: 'var(--buy-green)',
    bg: 'var(--buy-green-dim)',
    icon: '▲',
    desc: 'Predicted to rise >2%',
  },
  SELL: {
    label: 'SELL',
    color: 'var(--sell-red)',
    bg: 'var(--sell-red-dim)',
    icon: '▼',
    desc: 'Predicted to fall >2%',
  },
  HOLD: {
    label: 'HOLD',
    color: 'var(--hold-amber)',
    bg: 'var(--hold-amber-dim)',
    icon: '◆',
    desc: 'Change within ±2%',
  },
};

const fmt = (val, decimals = 2) =>
  typeof val === 'number'
    ? val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : '—';

const fmtUSD = (val) =>
  typeof val === 'number'
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(val)
    : '—';

export default function StockCard({ data, accentColor, index }) {
  if (!data) return null;

  if (data.error) {
    return (
      <div
        className="stock-card stock-card--error fade-in-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="stock-card__header">
          <span className="stock-card__ticker">{data.ticker}</span>
          <span className="stock-card__error-badge">ERROR</span>
        </div>
        <p className="stock-card__error-msg">{data.error}</p>
        <style>{cardStyles}</style>
      </div>
    );
  }

  const sig = SIGNAL_CONFIG[data.signal] || SIGNAL_CONFIG.HOLD;
  const changeIsPositive = (data.changePercent || 0) >= 0;

  return (
    <div
      className="stock-card fade-in-up"
      style={{
        animationDelay: `${index * 0.1}s`,
        '--card-accent': accentColor,
      }}
    >
      {/* Header */}
      <div className="stock-card__header">
        <div className="stock-card__title-group">
          <span className="stock-card__ticker">{data.ticker}</span>
          <span className="stock-card__model">{data.modelType}</span>
        </div>
        <div
          className="stock-card__signal"
          style={{ color: sig.color, background: sig.bg, borderColor: sig.color }}
        >
          <span className="stock-card__signal-icon">{sig.icon}</span>
          <span className="stock-card__signal-label">{sig.label}</span>
        </div>
      </div>

      <p className="stock-card__signal-desc" style={{ color: sig.color }}>
        {sig.desc}
      </p>

      {/* Price row */}
      <div className="stock-card__prices">
        <div className="stock-card__price-block">
          <span className="stock-card__price-label">Current Price</span>
          <span className="stock-card__price-value">{fmtUSD(data.currentPrice)}</span>
        </div>
        <div className="stock-card__price-divider" />
        <div className="stock-card__price-block">
          <span className="stock-card__price-label">Predicted (Next Day)</span>
          <span
            className="stock-card__price-value"
            style={{ color: changeIsPositive ? 'var(--buy-green)' : 'var(--sell-red)' }}
          >
            {fmtUSD(data.predictedPrice)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="stock-card__stats">
        <div className="stock-card__stat">
          <span className="stock-card__stat-label">Change</span>
          <span
            className="stock-card__stat-value"
            style={{ color: changeIsPositive ? 'var(--buy-green)' : 'var(--sell-red)' }}
          >
            {changeIsPositive ? '+' : ''}{fmt(data.changePercent)}%
          </span>
        </div>
        <div className="stock-card__stat">
          <span className="stock-card__stat-label">RMSE</span>
          <span className="stock-card__stat-value stock-card__stat-value--mono">
            {fmt(data.rmse, 4)}
          </span>
        </div>
        <div className="stock-card__stat">
          <span className="stock-card__stat-label">Features</span>
          <span className="stock-card__stat-value stock-card__stat-value--mono">
            {data.featureCount}
          </span>
        </div>
        <div className="stock-card__stat">
          <span className="stock-card__stat-label">Data Points</span>
          <span className="stock-card__stat-value stock-card__stat-value--mono">
            {data.history?.length || '—'}
          </span>
        </div>
      </div>

      {/* Accent bar */}
      <div
        className="stock-card__accent-bar"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />

      <style>{cardStyles}</style>
    </div>
  );
}

const cardStyles = `
.stock-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.stock-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--card-accent, var(--accent-cyan)), transparent);
  opacity: 0.6;
}
.stock-card:hover {
  border-color: var(--border-bright);
  box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0,212,255,0.05);
  transform: translateY(-2px);
}
.stock-card--error {
  border-color: var(--sell-red-dim);
  opacity: 0.8;
}
.stock-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4px;
}
.stock-card__title-group { display: flex; flex-direction: column; gap: 4px; }
.stock-card__ticker {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.stock-card__model {
  font-size: 10px;
  font-family: var(--text-mono);
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stock-card__signal {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.stock-card__signal-icon { font-size: 10px; }
.stock-card__error-badge {
  background: var(--sell-red-dim);
  color: var(--sell-red);
  border: 1px solid var(--sell-red);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.stock-card__signal-desc {
  font-size: 11px;
  font-family: var(--text-mono);
  margin-bottom: 20px;
  opacity: 0.8;
}
.stock-card__error-msg {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 8px;
}
.stock-card__prices {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
}
.stock-card__price-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
}
.stock-card__price-divider {
  width: 1px;
  background: var(--border);
}
.stock-card__price-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  font-family: var(--text-mono);
}
.stock-card__price-value {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--text-mono);
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.stock-card__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stock-card__stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stock-card__stat-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  font-family: var(--text-mono);
}
.stock-card__stat-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.stock-card__stat-value--mono { font-family: var(--text-mono); }
.stock-card__accent-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
}
`;
