import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

import vaultRoute from "./api/vault.js";
import songsRoute from "./api/songs.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Session & Passport
app.use(
  session({
    secret: "super_secret_key_123",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const ALLOWED_EMAILS = [
  "hiiyogitaaa11@gmail.com",
  "policeofficers100@gmail.com",
];

// OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: "900088000170-9iql224cug0sbrjonf1sp54n2qambscr.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (ALLOWED_EMAILS.includes(email)) return done(null, profile);
      return done(null, false);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/index.html?auth=denied" }),
  (req, res) => {
    if (req.user && ALLOWED_EMAILS.includes(req.user.emails[0].value)) {
      return res.redirect("/index.html?auth=success");
    } else {
      return res.redirect("/index.html?auth=denied");
    }
  }
);

app.use("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// static
app.use(express.static(__dirname));

// API routes
app.use("/api/vault", vaultRoute);
app.use("/api/songs", songsRoute);

// Always serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));
