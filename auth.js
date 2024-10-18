const passport = require("passport");
const bcrypt = require("bcryptjs");
const { getUser, getUserById } = require("./db/queries");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
    try {
      const user = await getUser(username);

      if (!user) {
        return done(null, false, { message: "Username not found in database" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = { passport };
