const User = require('../models/user');

/**
 * rendering the 'register' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

/**
 * parsing the form data and registering the user
 * @param {*} req 
 * @param {*} res 
 */
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Landscapes!');
            res.redirect('/landscapes');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

/**
 * rendering the 'login' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

/**
 * flashing a 'welcome back' message and redirecting to the last page which the user wanted to go, or 'home'
 * @param {*} req 
 * @param {*} res 
 */
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

/**
 * logging out, redirecting to 'home'
 * @param {*} req 
 * @param {*} res 
 */
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}