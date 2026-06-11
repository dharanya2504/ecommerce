const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI in environment variables.
 * Exits the process if connection fails (fail-fast strategy).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are defaults in Mongoose 7+ but included for clarity
      serverSelectionTimeoutMS: 5000, // Fail after 5s if no server
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// Handle connection events for robust monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB Disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected.');
});

module.exports = connectDB;
