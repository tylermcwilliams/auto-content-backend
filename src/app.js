const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const app = express();
const session = require("express-session");
const passport = require("./api/middleware");

app.use(express.json()); // for parsing application/json
app.use(cors());

app.use(
  session({
    secret: "your secret key", // A secret key used to sign the session ID cookie
    resave: false, // Avoid resaving sessions that have not been modified
    saveUninitialized: false, // Do not save uninitialized sessions
    cookie: {
      secure: false, // Set to true if using https
      httpOnly: true, // Prevents client-side JS from reading the cookie
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration (in milliseconds)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/dashboard");
  }
);

app.use("/api", require("./api/routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});

connectDB();
