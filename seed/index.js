const mongoose = require('mongoose');
const { places, descriptors } = require('./seedHelpers');
const Landscape = require('../models/landscape');
const cities = require('./cities')

mongoose.connect('mongodb://localhost:27017/landscapesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Landscape.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const landscape = new Landscape({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '626bb9519da64cd393399e10',
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
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