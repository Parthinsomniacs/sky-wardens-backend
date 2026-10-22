const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URI_LOCAL;

  if (!uri) {
    console.error(
      "CRITICAL: MONGO_URI / MONGODB_URI is not set in environment variables! Please configure it in your hosting dashboard."
    );
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
  }
};

module.exports = connectDB;
