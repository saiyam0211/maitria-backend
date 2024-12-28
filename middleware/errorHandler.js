// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;

// Add this to your server.js after all routes
app.use(errorHandler);
