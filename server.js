const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");

// Load Environment Variables
dotenv.config();

// Connect Database
const connectDB = require("./src/config/db");
connectDB();

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS Whitelist
const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy blocked access from this origin."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Body Parser (limit payload to 10MB for base64 / product images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. NoSQL Query Injection Sanitization (Express 5 Compatible)
const cleanSanitize = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      cleanSanitize(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) cleanSanitize(req.body);
  if (req.params) cleanSanitize(req.params);
  if (req.query) cleanSanitize(req.query);
  next();
});

// 5. HTTP Request Logger in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 6. Global Rate Limiter
const { apiLimiter } = require("./src/middleware/rateLimiter");
app.use("/api", apiLimiter);

// 7. System Health Check Endpoints (Root /, /health, and /api/health)
const { router: healthRoutes, getHealthStatus } = require("./src/routes/healthRoutes");
app.get("/", getHealthStatus);
app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);

// 8. Mount Modular API Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/divisions", require("./src/routes/divisionRoutes"));
app.use("/api/leads", require("./src/routes/leadRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));

// 9. Error Handling Middlewares
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(` SKY WARDENS DEFENCE API RUNNING ON PORT : ${PORT}`);
  console.log(` HEALTH CHECK                            : http://localhost:${PORT}/api/health`);
  console.log(` ENVIRONMENT                             : ${process.env.NODE_ENV || "development"}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
