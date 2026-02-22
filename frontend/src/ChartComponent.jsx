import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

// Merge histories by date
function mergeHistories(stocksData) {
  const dateMap = {};

  stocksData.forEach((stock) => {
    if (!stock.history || stock.error) return;

    stock.history.forEach((point) => {
      if (!dateMap[point.date]) dateMap[point.date] = { date: point.date };
      dateMap[point.date][stock.ticker] = point.close;
    });
  });

  return Object.values(dateMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={tooltipStyle}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 8 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
        >
          <span style={{ color: entry.color, fontWeight: 600 }}>
            {entry.dataKey}
          </span>
          <span style={{ color: entry.color }}>
            ${Number(entry.value).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ChartComponent({ stocksData }) {
  const [hiddenTickers, setHiddenTickers] = useState(new Set());

  const validStocks = stocksData.filter(
    (s) => s.history && !s.error
  );

  if (!validStocks.length) return null;

  const merged = mergeHistories(validStocks);
  const isMulti = validStocks.length > 1;

  const toggleTicker = (ticker) => {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });
  };

  // Normalize for multi-stock comparison
  const normalizedData = isMulti
    ? merged.map((row) => {
        const norm = { date: row.date };

        validStocks.forEach((stock) => {
          const firstRow = merged.find(
            (r) => r[stock.ticker] !== undefined
          );

          if (
            firstRow &&
            firstRow[stock.ticker] &&
            row[stock.ticker]
          ) {
            norm[stock.ticker] =
              ((row[stock.ticker] -
                firstRow[stock.ticker]) /
                firstRow[stock.ticker]) *
              100;
          }
        });

        return norm;
      })
    : merged;

  const yFormatter = isMulti
    ? (v) => `${v.toFixed(1)}%`
    : (v) => `$${v.toFixed(0)}`;

  const formatXAxis = (tick) => {
    if (!tick) return '';
    const [, month, day] = tick.split('-');
    return `${month}/${day}`;
  };

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          {isMulti
            ? 'Comparative Performance'
            : `${validStocks[0].ticker} – 6 Month History`}
        </h3>

        <div style={legendStyle}>
          {validStocks.map((stock, i) => {
            const color =
              CHART_COLORS[i % CHART_COLORS.length];
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
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                  }}
                />
                <span style={{ color, fontWeight: 600 }}>
                  {stock.ticker}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={normalizedData}
          margin={{ top: 20, right: 30, left: 60, bottom: 30 }}
        >
          <CartesianGrid
            stroke="#1e293b"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke="#ffffff"
            tick={{ fill: '#ffffff', fontSize: 12 }}
            tickMargin={10}
          />

          <YAxis
            tickFormatter={yFormatter}
            stroke="#ffffff"
            tick={{ fill: '#ffffff', fontSize: 12 }}
            tickMargin={10}
          />

          <Tooltip content={<CustomTooltip />} />

          {isMulti && (
            <ReferenceLine
              y={0}
              stroke="#64748b"
              strokeDasharray="4 2"
            />
          )}

          {validStocks.map((stock, i) => {
            const color =
              CHART_COLORS[i % CHART_COLORS.length];

            if (hiddenTickers.has(stock.ticker))
              return null;

            return (
              <Line
                key={stock.ticker}
                type="monotone"
                dataKey={stock.ticker}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: color,
                  strokeWidth: 2,
                  stroke: '#0f172a',
                }}
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
  width: "100%",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "24px",
  marginBottom: "32px",
  boxSizing: "border-box"
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '12px',
};

const titleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#ffffff',
};

const legendStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const legendBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  background: '#0f172a',
  border: '1px solid',
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};
