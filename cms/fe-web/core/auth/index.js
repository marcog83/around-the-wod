'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('./db');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
    (username, password, done) => {
        db.users.findByUsername(username, (error, user) => {
            if (error) return done(error);
            if (!user) return done(null, false);
            if (user.password !== password) return done(null, false);
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) =>  done(null, user.id));

passport.deserializeUser((id, done) => {
    db.users.findById(id, (error, user) => done(error, user));
});

