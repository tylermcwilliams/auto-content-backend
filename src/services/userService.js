const User = require("../models/UserModel"); // Adjust the path as necessary

const findOrCreateUser = (googleId, userEmail, accessToken, done) => {
  User.findOne({ googleId }, (err, existingUser) => {
    if (err) return done(err);
    if (existingUser) {
      // User exists, update accessToken and return the user
      existingUser.accessToken = accessToken;
      existingUser.save((err) => {
        if (err) return done(err);
        return done(null, existingUser);
      });
    } else {
      // User doesn't exist, create a new user
      const newUser = new User({
        email: userEmail,
        googleId,
        accessToken: accessToken,
      });
      newUser.save((err) => {
        if (err) return done(err);
        return done(null, newUser);
      });
    }
  });
};

module.exports = findOrCreateUser;
