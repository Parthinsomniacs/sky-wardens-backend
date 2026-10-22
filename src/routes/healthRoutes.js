const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * Health check handler returning system and database metrics
 */
const getHealthStatus = async (req, res) => {
  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  // Measure database ping latency
  let dbPingMs = null;
  if (isDbConnected && mongoose.connection.db) {
    try {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - startTime;
    } catch {
      dbPingMs = -1;
    }
  }

  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const uptimeHuman = `${hours}h ${minutes}m ${seconds}s`;

  const memoryUsage = process.memoryUsage();
  const isHealthy = isDbConnected;
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? "healthy" : "unhealthy",
    message: isHealthy
      ? "All systems operational (Sky Wardens Aerospace & Defence Backend)"
      : "Database connection degraded or offline",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      formatted: uptimeHuman,
    },
    database: {
      status: dbStateMap[dbState] || "unknown",
      host: mongoose.connection.host || "unavailable",
      name: mongoose.connection.name || "unavailable",
      pingMs: dbPingMs,
    },
    system: {
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      memory: {
        rssMB: +(memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMB: +(memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: +(memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      },
    },
  });
};

router.get("/", getHealthStatus);

module.exports = { router, getHealthStatus };
