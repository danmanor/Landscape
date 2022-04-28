const { reviewSchema, landscapeSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const landscape = require('./models/landscape');
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