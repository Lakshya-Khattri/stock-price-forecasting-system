const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS CONFIG (PRODUCTION SAFE) -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://stock-price-forecasting-system-dfsw.vercel.app"
];

// Allow dynamic origin handling
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight explicitly
app.options("*", cors());

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

/* -------------------- ROUTES -------------------- */

app.use("/api", routes);

/* -------------------- HEALTH CHECK -------------------- */

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* -------------------- 404 HANDLER -------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/* -------------------- ERROR HANDLER -------------------- */

app.use(errorHandler);

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`QuantEdge backend running on port ${PORT}`);
});

module.exports = app;
