const { reviewSchema, landscapeSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Landscape = require('./models/landscape');
const Review = require('./models/review');

module.exports.validateLandscape = (req, res, next) => {
    const { error } = landscapeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isLoggedInAlready = (req, res, next) => {
    if (req.isAuthenticated()){
        req.flash('error', 'You are logged in already');
        res.redirect('/landscapes');
    }
    next();
}

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

module.exports.isLandscapeAuthor = async (req, res, next) => {
    const { id } = req.params;
    const landscape = await Landscape.findById(id);
    if (!landscape.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/landscapes/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/landscapes/${id}`);
    }
    next();
}