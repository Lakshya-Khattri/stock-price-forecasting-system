#!/usr/bin/env python3
"""
QuantEdge AI – ML Microservice
Fetches historical stock data via yfinance, engineers features,
trains a RandomForestRegressor, predicts next-day close, and
outputs a clean JSON response.

Usage: python3 mlService.py <TICKER>
"""

import sys
import json
import warnings
import traceback

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import TimeSeriesSplit


def fetch_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    """Download historical OHLCV data for the given ticker."""
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    if df.empty:
        raise ValueError(f"No data found for ticker '{ticker}'. It may be invalid or delisted.")
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create lag features and moving averages."""
    close = df["Close"].copy()

    # Lag features: t-1 to t-5
    for lag in range(1, 6):
        df[f"lag_{lag}"] = close.shift(lag)

    # Moving averages
    df["ma_5"] = close.rolling(5).mean()
    df["ma_10"] = close.rolling(10).mean()

    df = df.dropna()
    return df


def train_and_predict(df: pd.DataFrame):
    """
    Train RandomForestRegressor with TimeSeriesSplit CV,
    evaluate RMSE, predict next-day closing price.
    """
    feature_cols = [f"lag_{i}" for i in range(1, 6)] + ["ma_5", "ma_10"]

    X = df[feature_cols].values
    y = df["Close"].values

    # Time-series cross-validation RMSE
    tscv = TimeSeriesSplit(n_splits=5)
    rmse_scores = []
    for train_idx, val_idx in tscv.split(X):
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X[train_idx], y[train_idx])
        preds = model.predict(X[val_idx])
        rmse_scores.append(np.sqrt(mean_squared_error(y[val_idx], preds)))

    avg_rmse = float(np.mean(rmse_scores))

    # Final model trained on all data
    final_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1,
    )
    final_model.fit(X, y)

    # Predict next day using latest available row
    latest = df[feature_cols].iloc[-1].values.reshape(1, -1)
    predicted_price = float(final_model.predict(latest)[0])

    return predicted_price, avg_rmse


def build_signal(current_price: float, predicted_price: float) -> str:
    change_pct = (predicted_price - current_price) / current_price * 100
    if change_pct > 2.0:
        return "BUY"
    elif change_pct < -2.0:
        return "SELL"
    return "HOLD"


def build_history(df: pd.DataFrame, months: int = 6) -> list:
    """Return last N months of OHLCV as list of dicts for charting."""
    cutoff = pd.Timestamp.now(tz=df.index.tz) - pd.DateOffset(months=months)
    recent = df[df.index >= cutoff].copy()
    history = []
    for ts, row in recent.iterrows():
        history.append({
            "date": ts.strftime("%Y-%m-%d"),
            "close": round(float(row["Close"]), 4),
            "open": round(float(row["Open"]), 4),
            "high": round(float(row["High"]), 4),
            "low": round(float(row["Low"]), 4),
            "volume": int(row["Volume"]),
        })
    return history


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No ticker provided."}))
        sys.exit(1)

    ticker = sys.argv[1].strip().upper()

    try:
        df_raw = fetch_data(ticker, period="1y")
        current_price = float(df_raw["Close"].iloc[-1])

        df_feat = engineer_features(df_raw.copy())
        predicted_price, rmse = train_and_predict(df_feat)

        signal = build_signal(current_price, predicted_price)
        history = build_history(df_raw, months=6)

        change_pct = (predicted_price - current_price) / current_price * 100

        result = {
            "success": True,
            "ticker": ticker,
            "currentPrice": round(current_price, 4),
            "predictedPrice": round(predicted_price, 4),
            "changePercent": round(change_pct, 2),
            "signal": signal,
            "rmse": round(rmse, 4),
            "history": history,
            "featureCount": 7,
            "modelType": "RandomForestRegressor",
        }

        print(json.dumps(result))

    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    except Exception:
        print(json.dumps({"error": f"Internal ML error for {ticker}: {traceback.format_exc().splitlines()[-1]}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
