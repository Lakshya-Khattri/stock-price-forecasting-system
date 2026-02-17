# Stock Price Forecasting System

A machine learning-driven system for short-term stock price forecasting using time-series modeling and news sentiment analysis.

This project demonstrates end-to-end ML pipeline development on real-world financial data, including data ingestion, preprocessing, modeling, evaluation, and external signal integration.

---

# Problem Statement

Financial markets are influenced by both quantitative signals (historical prices, volume) and qualitative signals (news, sentiment, market perception).

The objective of this project is to explore how time-series forecasting combined with sentiment analysis can be used to model short-term stock price movements.

This is a technical exploration — not a trading system.

---

# Key Highlights

• End-to-end ML pipeline on financial data  
• Time-series forecasting using Facebook Prophet  
• NLP-based sentiment extraction from live news  
• Model evaluation using holdout validation  
• Automated financial data ingestion  
• Clean and reproducible workflow  

---

# System Architecture

Data Sources:
- Historical stock data (yFinance)
- Financial news (NewsAPI)

Pipeline:
1. Data Collection  
2. Preprocessing & Cleaning  
3. Time-Series Modeling (Prophet)  
4. Sentiment Analysis (TextBlob)  
5. Model Evaluation (MAE)  
6. Forecast Generation  

---

# Tech Stack

Python  
Prophet (Time-Series Forecasting)  
Pandas & NumPy  
Scikit-learn (Evaluation Metrics)  
TextBlob (NLP Sentiment Analysis)  
yFinance API  
NewsAPI  

---

# Project Structure

