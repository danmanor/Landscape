const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// mongoose review schema
const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: 
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', ReviewSchema);