#!/usr/bin/env python3
"""
QuantEdge AI – ML Microservice
Improved regression version (no sklearn).
Time-aware split + better features.

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


def fetch_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)

    if df.empty:
        raise ValueError(f"No data found for ticker '{ticker}'. It may be invalid or delisted.")

    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    close = df["Close"].copy()

    # Lag features
    for lag in range(1, 6):
        df[f"lag_{lag}"] = close.shift(lag)

    # Moving averages
    df["ma_5"] = close.rolling(5).mean()
    df["ma_10"] = close.rolling(10).mean()

    # Returns + Volatility
    df["returns"] = close.pct_change()
    df["volatility"] = close.pct_change().rolling(5).std()

    return df


def train_and_predict(df: pd.DataFrame):

    feature_cols = [f"lag_{i}" for i in range(1, 6)] + [
        "ma_5",
        "ma_10",
        "returns",
        "volatility",
    ]

    # Create next-day target
    df["Target"] = df["Close"].shift(-1)

    # Drop NaN rows (lag + MA + shift)
    df = df.dropna()

    if len(df) < 30:
        raise ValueError("Not enough data after feature engineering.")

    X = df[feature_cols].values
    y = df["Target"].values.reshape(-1, 1)

    # -------- Time-based split (80/20) --------
    split_index = int(len(df) * 0.8)

    X_train = X[:split_index]
    y_train = y[:split_index]

    X_test = X[split_index:]
    y_test = y[split_index:]

    # Add bias column
    X_train_b = np.c_[np.ones((X_train.shape[0], 1)), X_train]

    # Normal Equation training
    theta = np.linalg.pinv(X_train_b.T @ X_train_b) @ X_train_b.T @ y_train

    # -------- Evaluate on TEST set --------
    X_test_b = np.c_[np.ones((X_test.shape[0], 1)), X_test]
    y_pred_test = X_test_b @ theta

    rmse = float(np.sqrt(np.mean((y_test - y_pred_test) ** 2)))

    # -------- Predict next day --------
    latest_features = df[feature_cols].iloc[-1].values.reshape(1, -1)
    latest_b = np.c_[np.ones((1, 1)), latest_features]

    predicted_price = float((latest_b @ theta)[0][0])

    # Prevent negative nonsense predictions
    predicted_price = max(0, predicted_price)

    return predicted_price, rmse


def build_signal(current_price: float, predicted_price: float) -> str:
    change_pct = (predicted_price - current_price) / current_price * 100

    if change_pct > 2.0:
        return "BUY"
    elif change_pct < -2.0:
        return "SELL"
    return "HOLD"


def build_history(df: pd.DataFrame, months: int = 6) -> list:
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
            "featureCount": 9,
            "modelType": "TimeSplitLinearRegression",
        }

        print(json.dumps(result))

    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    except Exception:
        print(json.dumps({
            "error": f"Internal ML error for {ticker}: {traceback.format_exc().splitlines()[-1]}"
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
