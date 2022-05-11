const express = require('express');
const { isLoggedInAlready } = require('../middleware')
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

const router = express.Router();

// structuring the user routes with essential middleware, catch block for async functions and authentication

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(isLoggedInAlready, users.renderLogin)
    .post(isLoggedInAlready, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;