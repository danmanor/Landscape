const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

// mongoose Image schema
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// virtual property of thumbnail
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// options for schema, passing also virtuals
const opts = { toJSON: { virtuals: true } };

// mongoose Landscape schema
const LandscapeSchema = new Schema({
    title: String,
    location: String,
    description: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: 
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts)

// defining a virtual property for map popup 
LandscapeSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/landscapes/${this._id}">${this.title}</a><strong>
    `
});

// deleting the reviews of landscape after it is deleted
LandscapeSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Landscape', LandscapeSchema);