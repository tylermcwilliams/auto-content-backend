const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
  },
  lastLogin: {
    type: Number,
    required: true,
  },
  subscriptionTier: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
