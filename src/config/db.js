const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;

  if (!uri) {
    console.error(
      "CRITICAL: MONGO_URI is not set in environment variables! Please configure it in your hosting dashboard."
    );
    return;
  }

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log("[MongoDB Connected]");
  } catch (error) {
    console.error("[MongoDB Connection Error] Failed to connect to database");
  }
};

module.exports = connectDB;
