const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS CONFIG (FINAL STABLE VERSION) -------------------- */

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // Allow localhost
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Allow ANY Netlify subdomain for your project
      if (
        origin.endsWith(".netlify.app") &&
        origin.includes("aistockpredictionbycodeforge")
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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
