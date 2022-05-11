const { reviewSchema, landscapeSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Landscape = require('./models/landscape');
const Review = require('./models/review');

// middleware for validating landscape and review, checking if the user is logged in or not, and if the user is author or not.

/**
 * using Joi Schemas for validating landscape
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @throws ExpressError
 */
module.exports.validateLandscape = (req, res, next) => {
    const { error } = landscapeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

/**
 * using Joi Schemas for validating review
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @throws ExpressError
 */
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

/**
 * checking id user is already logged in
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.isLoggedInAlready = (req, res, next) => {
    if (req.isAuthenticated()){
        req.flash('error', 'You are logged in already');
        res.redirect('/');
    }
    next();
}

/**
 * checking if a user is logged in, if not it redirects to '/login' and saves the returnTo address.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if(req.originalMethod == 'GET'){
            req.session.returnTo = req.originalUrl
        }
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

/**
 * checking if the current user is the author of the landscape
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.isLandscapeAuthor = async (req, res, next) => {
    const { id } = req.params;
    const landscape = await Landscape.findById(id);
    if (!landscape.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/landscapes/${id}`);
    }
    next();
}

/**
 * checking if the current user is the author of the review
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/landscapes/${id}`);
    }
    next();
}