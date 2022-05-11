const Landscape = require('../models/landscape');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

/**
 * splitting the landscapes to the 3 columns and rendering the 'landscapes' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.index = async (req, res) => {
    const landscapes = await Landscape.find({});
    const landscapesLeft = [], landscapesMid = [], landscapesRight = [];
    for (let i = 0 ; i < landscapes.length ; i++){
        let col = i % 3;
        switch (col){
            case 0:
                landscapesLeft.push(landscapes[i]);
                break;
            case 1:
                landscapesMid.push(landscapes[i]);
                break;
            case 2:
                landscapesRight.push(landscapes[i]);
                break;
        }
    }
    res.render('landscapes/index', { landscapesLeft, landscapesMid, landscapesRight })
}

/**
 * rendering the 'new landscape' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.renderNewForm = (req, res) => {
    res.render('landscapes/new');
}

/**
 * extracting the form data, geocoding the longtitude and altitude of 'location', 
 * saving uploaded images, setting author and redirecting to new landscape
 * @param {*} req 
 * @param {*} res 
 */
module.exports.createLandscape = async (req, res) => {
    const landscape = new Landscape(req.body.landscape);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.landscape.location,
        limit: 1
    }).send()
    landscape.geometry = geoData.body.features[0].geometry;
    landscape.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    landscape.author = req.user._id;
    await landscape.save();
    req.flash('success', 'Successfully posted a new landscape!');
    res.redirect(`/landscapes/${landscape._id}`);
}

/**
 * finding the landscape, populating its reviews and author, and author for review.
 * Then, calculating the average review rating, and rendering the 'show' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.showLandscape = async (req, res) => {
    const landscape = await Landscape.findById(req.params.id).populate
    ({path: 'reviews',
      populate: {
        path: 'author'
      }  
    }).populate('author');
    if (!landscape) {
        req.flash('error', 'Cannot find that landscape!');
        return res.redirect('/landscapes');
    }
    const landscapeReviews = landscape.reviews;
    sum = 0.0;
    numberOfReviews = 0;
    for (let review of landscapeReviews){
        sum += review.rating;numberOfReviews += 1;
    }
    let averageRating = sum/numberOfReviews;
    res.render('landscapes/show', { landscape, averageRating });
}

/**
 * finding the landscape and rendering 'edit' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.renderEditForm = async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    if (!landscape) {
        req.flash('error', 'Cannot find that landscape!');
        return res.redirect('/landscapes');
    }
    res.render('landscapes/edit', { landscape });
}

/**
 * finding  and updating the landscape, then deleting the selected images, also from cloudinary
 * @param {*} req 
 * @param {*} res 
 */
module.exports.updateLandscape = async (req, res) => {
    const { id } = req.params;
    const landscape = await Landscape.findByIdAndUpdate(id, { ...req.body.landscape });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    landscape.images.push(...imgs);
    await landscape.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await landscape.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated landscape!');
    res.redirect(`/landscapes/${landscape._id}`)
}

/**
 * finding the landscape and deleting it, deleting the images from cloudinary and also deleting his reviews
 * @param {*} req 
 * @param {*} res 
 */
module.exports.deleteLandscape = async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    for (let image of landscape.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    await Landscape.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted landscape')
    res.redirect('/landscapes')
}

/**
 * rendering the 'map' page
 * @param {*} req 
 * @param {*} res 
 */
module.exports.renderMap = async (req, res) => {
    const landscapes = await Landscape.find({});
    res.render('landscapes/map', { landscapes })
}