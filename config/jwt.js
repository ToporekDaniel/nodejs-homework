const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/userSchema");

function setJWTStrategy() {
  const secret = process.env.SECRET;
  const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  passport.use(
    new JwtStrategy(params, async (payload, done) => {
      try {
        const user = await User.findOne({ _id: payload.id }).lean();
        if (!user) {
          return done(new Error("User not found."), null);
        }
        return done(null, user);
      } catch (e) {
        return done(e, null);
      }
    })
  );
}

module.exports = setJWTStrategy;
