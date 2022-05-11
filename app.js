if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

// importing routes
const userRoutes = require('./routes/users');
const landscapeRoutes = require('./routes/landscapes');
const reviewRoutes = require('./routes/reviews');

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

// middleware

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

//sanitizing queries, replacing volnerability with '_' 
app.use(mongoSanitize({
    replaceWith: '_'
}))

// session config
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

//session config
app.use(session(sessionConfig))

// flash config
app.use(flash());

// passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// setting local variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// setting prefix and using routes

app.use('/', userRoutes);
app.use('/landscapes', landscapeRoutes)
app.use('/landscapes/:id/reviews', reviewRoutes)

// routes

app.get('/', (req, res) => {
    res.render('home');
})

// wrong url
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))       // pass the error to the error handler
})

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// listening

app.listen(3000, () => {
    console.log('Listening on localhost:3000');
})