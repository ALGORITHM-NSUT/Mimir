const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const session = require("express-session");

const app = express();

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const emailDomain = email.split("@")[1];
    
    if (emailDomain === "nsut.ac.in") {
        return done(null, profile);
    } else {
        return done(null, false, { message: "Only NSUT email addresses are allowed" });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

app.get("/auth/google/callback", 
    passport.authenticate("google", { 
        failureRedirect: "/login" 
    }),
    (req, res) => {
        res.redirect("/");
    }
);

app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Hello, ${req.user.displayName}!`);
    } else {
        res.send("You are not logged in.");
    }
});

app.get("/login", (req, res) => {
    res.send("Login failed. Only NSUT email addresses are allowed.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
