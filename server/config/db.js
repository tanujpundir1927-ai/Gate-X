const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Add connection options for better timeout handling
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of waiting forever
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("==================================================");
    console.log("⚠️  DATABASE WARNING: Connection to MongoDB failed.");
    console.log(`Reason: ${error.message}`);
    console.log("Please check your internet connection and MONGO_URI in .env.");
    console.log("The server is still running, but database operations will fail.");
    console.log("==================================================");
  }
};

module.exports = connectDB;
