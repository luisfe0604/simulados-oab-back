const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const usersService = require("../modules/users/users.service");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://simulados-oab-back.onrender.com/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await usersService.findByEmail(email);

        if (!user) {
          user = await usersService.findOrCreate({
            name,
            email,
            password: null
          });
        }
        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;