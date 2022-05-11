const express = require('express');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Landscape = require('../models/landscape');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// structuring the review routes with essential middleware and catch block for async functions

const router = express.Router({ mergeParams: true });       // merging the landscape id param

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;