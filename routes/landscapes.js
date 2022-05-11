const express = require('express');
const landscapes = require('../controllers/landscapes');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isLandscapeAuthor, validateLandscape } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const router = express.Router();

// structuring the landscape routes with essential middleware and catch block for async functions

router.route('/')
    .get(catchAsync(landscapes.index))
    .post(isLoggedIn, upload.array('image'), validateLandscape, catchAsync(landscapes.createLandscape))

router.get('/new', isLoggedIn, landscapes.renderNewForm)

router.get('/map', landscapes.renderMap)

router.route('/:id')
    .get(catchAsync(landscapes.showLandscape))
    .put(isLoggedIn, isLandscapeAuthor, upload.array('image'), validateLandscape, catchAsync(landscapes.updateLandscape))
    .delete(isLoggedIn, isLandscapeAuthor, catchAsync(landscapes.deleteLandscape));

router.get('/:id/edit', isLoggedIn, isLandscapeAuthor, catchAsync(landscapes.renderEditForm))



module.exports = router;