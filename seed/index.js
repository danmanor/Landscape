const mongoose = require('mongoose');
const { places, descriptors } = require('./seedHelpers');
const Landscape = require('../models/landscape');
const cities = require('./cities')
const images = require('./images')

// mongoose config

mongoose.connect('mongodb://localhost:27017/landscapesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

/**
 * 
 * @param {*} array 
 * @returns a random sample of an array
 */
const sample = array => array[Math.floor(Math.random() * array.length)];

/**
 * seeding the database with random data
 */
const seedDB = async () => {
    await Landscape.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomSeed1 = Math.floor(Math.random() * 21);
        const randomSeed2 = Math.floor(Math.random() * 21);
        const landscape = new Landscape({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '626bb9519da64cd393399e10',
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: `${images[randomSeed1].url}`,
                    filename: `${images[randomSeed1].filename}`
                },
                {
                    url: `${images[randomSeed2].url}`,
                    filename: `${images[randomSeed2].filename}`
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
        })
        await landscape.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})