const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Landscape = require('./models/landscape')
const methodOverride = require('method-override');

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
app.use(methodOverride('_method'));

// routes

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/landscapes', async (req, res) => {
    const landscapes = await Landscape.find({});
    res.render('landscapes/index', { landscapes })
})

app.get('/landscapes/:id', async (req, res) => {
    const landscape = await Landscape.findById(req.params.id);
    res.render('landscapes/show', { landscape })
})

// listening

app.listen(3000, () => {
    console.log('Listening on localhost:3000');
})