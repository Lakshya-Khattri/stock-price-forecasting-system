import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CHART_COLORS = [
  '#00d4ff',
  '#7c4dff',
  '#ff6d00',
  '#00e676',
  '#ff1744',
];

// Merge multiple stocks' history into a single array keyed by date
function mergeHistories(stocksData) {
  const dateMap = {};
  stocksData.forEach((stock) => {
    if (!stock.history || stock.error) return;
    stock.history.forEach((point) => {
      if (!dateMap[point.date]) dateMap[point.date] = { date: point.date };
      dateMap[point.date][stock.ticker] = point.close;
    });
  });
  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <p style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--text-mono)', marginBottom: 8 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--text-mono)', flex: 1 }}>
            {entry.dataKey}
          </span>
          <span style={{ color: entry.color, fontWeight: 700, fontSize: 13, fontFamily: 'var(--text-mono)' }}>
            ${Number(entry.value).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-bright)',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

export default function ChartComponent({ stocksData }) {
  const [hiddenTickers, setHiddenTickers] = useState(new Set());

  const validStocks = stocksData.filter((s) => s.history && !s.error);
  if (!validStocks.length) return null;

  const merged = mergeHistories(validStocks);

  const toggleTicker = (ticker) => {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });
  };

  // Format x-axis: show abbreviated date labels
  const formatXAxis = (tick) => {
    if (!tick) return '';
    const [, month, day] = tick.split('-');
    return `${month}/${day}`;
  };

  // Normalize to % change from first point for multi-stock comparison
  const isMulti = validStocks.length > 1;

  const normalizedData = isMulti
    ? merged.map((row) => {
        const norm = { date: row.date };
        validStocks.forEach((stock) => {
          const firstRow = merged.find((r) => r[stock.ticker] !== undefined);
          if (firstRow && firstRow[stock.ticker] && row[stock.ticker]) {
            norm[stock.ticker] = parseFloat(
              (((row[stock.ticker] - firstRow[stock.ticker]) / firstRow[stock.ticker]) * 100).toFixed(3)
            );
          }
        });
        return norm;
      })
    : merged;

  const yAxisLabel = isMulti ? '% Change' : 'Price (USD)';
  const yFormatter = isMulti ? (v) => `${v.toFixed(1)}%` : (v) => `$${v.toFixed(0)}`;

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={titleStyle}>
            {isMulti ? 'Comparative Performance' : `${validStocks[0].ticker} – 6 Month History`}
          </h3>
          {isMulti && (
            <p style={subtitleStyle}>Normalized to % change from start date for fair comparison</p>
          )}
        </div>
        <div style={legendStyle}>
          {validStocks.map((stock, i) => {
            const color = CHART_COLORS[i % CHART_COLORS.length];
            const hidden = hiddenTickers.has(stock.ticker);
            return (
              <button
                key={stock.ticker}
                onClick={() => toggleTicker(stock.ticker)}
                style={{
                  ...legendBtnStyle,
                  opacity: hidden ? 0.35 : 1,
                  borderColor: color,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ color, fontWeight: 700, fontSize: 12, fontFamily: 'var(--text-mono)' }}>
                  {stock.ticker}
                </span>
                {!hidden && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--text-mono)' }}>
                    ${stock.currentPrice?.toFixed(2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={normalizedData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            {validStocks.map((stock, i) => {
              const color = CHART_COLORS[i % CHART_COLORS.length];
              return (
                <linearGradient key={stock.ticker} id={`grad-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval={Math.floor(merged.length / 8)}
          />
          <YAxis
            tickFormatter={yFormatter}
            tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          {isMulti && <ReferenceLine y={0} stroke="var(--border-bright)" strokeDasharray="4 2" />}
          {validStocks.map((stock, i) => {
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Line
                key={stock.ticker}
                type="monotone"
                dataKey={hiddenTickers.has(stock.ticker) ? null : stock.ticker}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: 'var(--bg-card)' }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { CHART_COLORS };

const wrapperStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '24px',
  marginBottom: '24px',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
};

const titleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.01em',
};

const subtitleStyle = {
  fontSize: '11px',
  color: 'var(--text-dim)',
  fontFamily: 'JetBrains Mono, monospace',
  marginTop: 4,
};

const legendStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const legendBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  background: 'var(--bg-surface)',
  border: '1px solid',
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};
