if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Landscape = require('./models/landscape')
const Review = require('./models/review')
const methodOverride = require('method-override');
const path = require('path');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { validateLandscape, validateReview, isLoggedIn, isLoggedInAlready, isLandscapeAuthor, isReviewAuthor } = require('./middlewear');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { cloudinary, storage } = require("./cloudinary");
const multer = require('multer');
const upload = multer({ storage });
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// mongoose config
mongoose.connect('mongodb://localhost:27017/landscapesDB', 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// middlewear

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'abc',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// session config
app.use(session(sessionConfig))

// flash config
app.use(flash());

// passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// routes

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/landscapes',catchAsync( async (req, res) => {
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
}))

app.post('/landscapes', upload.array('image'), validateLandscape, isLoggedIn, catchAsync( async (req, res) => {
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
}))

app.get('/landscapes/new', isLoggedIn, (req, res) => {
    res.render('landscapes/new');
})

app.get('/landscapes/:id', catchAsync( async (req, res) => {
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
}))

app.get('/landscapes/:id/edit', isLoggedIn, catchAsync( async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    if (!landscape) {
        req.flash('error', 'Cannot find that landscape!');
        return res.redirect('/landscapes');
    }
    res.render('landscapes/edit', { landscape });
}))

app.put('/landscapes/:id', upload.array('image'), isLoggedIn, isLandscapeAuthor, validateLandscape, catchAsync( async (req, res) => {
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
}))

app.delete('/landscapes/:id', isLandscapeAuthor, isLoggedIn, catchAsync( async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    for (let image of landscape.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    await Landscape.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted landscape')
    res.redirect('/landscapes')
}))

app.post('/landscapes/:id/reviews',isLoggedIn, validateReview, catchAsync( async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    landscape.reviews.push(review);
    await review.save();
    await landscape.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/landscapes/${landscape._id}`);
}))

app.delete('/landscapes/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    await Landscape.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/landscapes/${landscape._id}`);
}))

app.get('/register', catchAsync( async (req, res) => {
    res.render('users/register');
}))

app.post('/register',catchAsync( async (req, res) => {
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
}))

app.get('/login', catchAsync( async (req, res) => {
    res.render('users/login');
}))

app.post('/login',isLoggedInAlready, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

app.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/landscapes');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// listening

app.listen(3000, () => {
    console.log('Listening on localhost:3000');
})