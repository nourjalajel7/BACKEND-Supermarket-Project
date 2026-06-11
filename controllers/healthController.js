const mongoose = require("mongoose");

const getHealth = async (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.status(readyState === 1 ? 200 : 503).json({
    status: readyState === 1 ? "ok" : "degraded",
    server: "running",
    database: states[readyState] || "unknown",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
