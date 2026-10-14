const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Sensitive Auth route limiter (Anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 login attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// Public Lead / RFQ submission limiter (Anti-spam bot)
const leadSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, // max 10 inquiry submissions per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Inquiry submission rate limit reached. Please wait a few minutes before submitting another inquiry.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  leadSubmissionLimiter,
};
