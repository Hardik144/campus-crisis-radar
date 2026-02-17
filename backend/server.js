const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Security headers
app.use(helmet());

// Logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again later"
});
app.use("/api", limiter);

// Body parser
app.use(express.json());

// CORS
app.use(cors());

// Routes
const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("Campus Crisis Radar API Running");
});

// Global error handler (always last)
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});