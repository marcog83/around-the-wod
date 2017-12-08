const passport = require('passport');
const ceLogin = require('connect-ensure-login');
require('../core/auth/index');
const session = require('express-session');
const login = passport.authenticate('local', {successReturnToOrRedirect: '/cms', failureRedirect: '/cms/login'});

const loginForm = (request, response) => {
    response.render('login', {});
};
const logout = (request, response) => {
    request.logout();
    response.redirect('/cms');
};
module.exports.middleware = () => {
    return ceLogin.ensureLoggedIn({redirectTo: "/cms/login"})
};
module.exports.init = (app) => {
    app.use(require('cookie-parser')());
    app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));

    // Initialize Passport and restore authentication state, if any, from the
// session.
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/login', loginForm);
    app.post('/login', login);
    app.get('/logout', logout);
};