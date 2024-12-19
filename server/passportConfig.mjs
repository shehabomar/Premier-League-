import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './db.mjs';
import bcrypt from 'bcryptjs';

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: "USER NOT FOUND" });
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return done(null, false, { message: "PASSWORDS DO NOT MATCH" });
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
