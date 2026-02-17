import yfinance as yf
from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta
from newsapi import NewsApiClient
from textblob import TextBlob
from sklearn.metrics import mean_absolute_error
import warnings

warnings.filterwarnings('ignore')

# -----------------------------
# Step 1: Fetch Historical Stock Data
# -----------------------------
def get_stock_data(ticker='NVDA', period='2y'):
    stock = yf.Ticker(ticker)
    data = stock.history(period=period)

    data.reset_index(inplace=True)
    data = data[['Date', 'Close']]
    data.columns = ['ds', 'y']

    # Remove timezone (Prophet requirement)
    data['ds'] = pd.to_datetime(data['ds']).dt.tz_localize(None)

    return data


# -----------------------------
# Step 2: Train + Evaluate + Predict
# -----------------------------
def predict_stock_prices(data):

    train = data[:-30]
    test = data[-30:]

    # Model for evaluation
    model_eval = Prophet(daily_seasonality=True, yearly_seasonality=True)
    model_eval.fit(train)

    future_test = model_eval.make_future_dataframe(periods=30)
    forecast_test = model_eval.predict(future_test)

    mae = mean_absolute_error(test['y'], forecast_test['yhat'][-30:])
    print(f"\nModel MAE (last 30 days): {mae:.2f}")

    # NEW model for final prediction
    model_final = Prophet(daily_seasonality=True, yearly_seasonality=True)
    model_final.fit(data)

    future = model_final.make_future_dataframe(periods=7)
    forecast = model_final.predict(future)

    predictions = forecast[['ds','yhat','yhat_lower','yhat_upper']].tail(7)
    predictions.columns = ['Date','Predicted Price','Lower Bound','Upper Bound']

    return predictions


# -----------------------------
# Step 3: News Sentiment
# -----------------------------
def analyze_news_sentiment(api_key, query='Nvidia', days_back=7):
    newsapi = NewsApiClient(api_key=api_key)

    from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')

    articles = newsapi.get_everything(
        q=query,
        from_param=from_date,
        language='en',
        sort_by='relevancy',
        page_size=10
    )

    sentiments = []

    for article in articles['articles']:
        text = article['title'] + ' ' + (article['description'] or '')
        sentiment = TextBlob(text).sentiment.polarity

        sentiments.append({
            'title': article['title'],
            'sentiment': sentiment,
            'url': article['url']
        })

    avg_sentiment = sum(s['sentiment'] for s in sentiments)/len(sentiments) if sentiments else 0

    return sentiments, avg_sentiment


# -----------------------------
# Step 4: Founder Mentions
# -----------------------------
def analyze_founder_interviews(api_key, founder='Jensen Huang', days_back=7):
    return analyze_news_sentiment(api_key, query=f'"{founder}" Nvidia', days_back=days_back)


# -----------------------------
# Step 5: Holders + Volume
# -----------------------------
def analyze_holders_and_volume(ticker='NVDA'):
    stock = yf.Ticker(ticker)

    holders = stock.institutional_holders
    if holders is not None:
        holders = holders[['Holder','Shares','Value']].head(10)
    else:
        holders = "No institutional holder data available."

    recent_data = stock.history(period='1mo')

    avg_volume = recent_data['Volume'].mean()
    latest_volume = recent_data['Volume'].iloc[-1]

    volume_analysis = (
        f"Average monthly volume: {avg_volume:.0f}. "
        f"Latest volume: {latest_volume:.0f}. "
        f"{'High selling activity possible' if latest_volume > avg_volume*1.5 else 'Normal activity'}."
    )

    return holders, volume_analysis


# -----------------------------
# MAIN
# -----------------------------
if __name__ == "__main__":

    NEWS_API_KEY = "PASTE YOUR API KEY HERE"

    print("Fetching Nvidia stock data...")
    stock_data = get_stock_data()

    print("Predicting next 7 days' prices...")
    predictions = predict_stock_prices(stock_data)

    print("\nPredicted Prices:")
    print(predictions.to_string(index=False))

    print("\nAnalyzing news sentiment...")
    news_sentiments, avg_news_sentiment = analyze_news_sentiment(NEWS_API_KEY)

    print(f"Average News Sentiment: {avg_news_sentiment:.2f}")
    for item in news_sentiments[:5]:
        print(f"- {item['title']} (Sentiment: {item['sentiment']:.2f})")

    print("\nAnalyzing Jensen Huang mentions...")
    founder_sentiments, avg_founder_sentiment = analyze_founder_interviews(NEWS_API_KEY)

    print(f"Average Founder Sentiment: {avg_founder_sentiment:.2f}")
    for item in founder_sentiments[:3]:
        print(f"- {item['title']} (Sentiment: {item['sentiment']:.2f})")

    print("\nAnalyzing holders and volume...")
    holders, volume_analysis = analyze_holders_and_volume()

    print("\nTop Institutional Holders:")
    print(holders)

    print(f"\nVolume Analysis: {volume_analysis}")

    print("\nNote: Educational project only. Markets are not predictable.")
