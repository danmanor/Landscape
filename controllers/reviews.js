const Landscape = require('../models/landscape');
const Review = require('../models/review');

/**
 * finding the landscape, creating review and saving the review as the landscape's review
 * @param {*} req 
 * @param {*} res 
 */
module.exports.createReview = async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    landscape.reviews.push(review);
    await review.save();
    await landscape.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/landscapes/${landscape._id}`);
}

/**
 * deleting the 
 * @param {*} req 
 * @param {*} res 
 */
module.exports.deleteReview = async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    await Landscape.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/landscapes/${landscape._id}`);
}
