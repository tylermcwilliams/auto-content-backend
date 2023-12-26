const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
require("dotenv").config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

passport.serializeUser((user, done) => {
  done(null, user.id); // or whatever unique identifier you have for the user
});

passport.deserializeUser((id, done) => {
  // Find the user by ID and pass it to done
  // Example: User.findById(id, (err, user) => done(err, user));
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      done(null, profile);
    }
  )
);

module.exports = passport; // Use module.exports for CommonJS
