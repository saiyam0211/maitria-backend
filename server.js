// server/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// CORS configuration - this must come before any route definitions
const corsOptions = {
  origin: "http://localhost:3000", // your frontend URL
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import models
require("./models");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payment", require("./routes/payment"));

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working correctly",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
