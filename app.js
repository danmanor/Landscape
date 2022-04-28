const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Landscape = require('./models/landscape')
const Review = require('./models/review')
const methodOverride = require('method-override');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/landscapesDB');
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

// routes

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/landscapes', async (req, res) => {
    const landscapes = await Landscape.find({});
    res.render('landscapes/index', { landscapes })
})

app.post('/landscapes', async (req, res) => {
    const landscape = new Landscape(req.body.landscape);
    await landscape.save();
    res.redirect(`/landscapes/${landscape._id}`);
})

app.get('/landscapes/new', (req, res) => {
    res.render('landscapes/new');
})

app.get('/landscapes/:id', async (req, res) => {
    const landscape = await Landscape.findById(req.params.id).populate({path: 'reviews'})
    res.render('landscapes/show', { landscape })
})

app.get('/landscapes/:id/edit', async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    res.render('landscapes/edit', { landscape });
})

app.put('/landscapes/:id', async (req, res) => {
    const landscape = await Landscape.findByIdAndUpdate(req.params.id, { ...req.body.landscape });
    res.redirect(`/landscapes/${landscape._id}`);
})

app.delete('/landscapes/:id', async (req, res) => {
    const landscape = await Landscape.findByIdAndDelete(req.params.id);
    res.redirect('/landscapes')
})

app.post('/landscapes/:id/reviews', async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    const review = new Review(req.body.review);
    landscape.reviews.push(review);
    await review.save();
    await landscape.save();
    res.redirect(`/landscapes/${landscape._id}`);
})

app.delete('/landscapes/:id/reviews/:reviewId', async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    await Landscape.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/landscapes/${landscape._id}`);
})

// listening

app.listen(3000, () => {
    console.log('Listening on localhost:3000');
})