const mongoose = require("mongoose");

const REMOTE_MONGO_URI = "mongodb://db:27017/auto-content";

const connectDB = async (uri = REMOTE_MONGO_URI) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.info("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
