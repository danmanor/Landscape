const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// mongoose User schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// adding passport-local-mongoose to schema, (username, password, methods, etc.)
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);