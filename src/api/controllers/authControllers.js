const passport = require("passport");
require("dotenv").config();

const REDIRECT_URL = process.env.REDIRECT_URL;

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleAuthCallback = (req, res) => {
  // Successful authentication, redirect home.
  res.redirect(REDIRECT_URL);
};

module.exports = {
  googleAuth,
  googleAuthCallback,
};
