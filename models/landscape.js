const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LandscapeSchema = new Schema({
    title: String,
    location: String,
    description: String,
    image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

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