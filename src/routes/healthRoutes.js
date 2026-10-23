const express = require("express");
const router = express.Router();

/**
 * Simple health check handler
 */
const getHealthStatus = (req, res) => {
  return res.status(200).json({
    message: "Server is running",
  });
};

router.get("/", getHealthStatus);

module.exports = { router, getHealthStatus };
