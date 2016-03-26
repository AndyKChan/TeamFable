/**
 * This is the model for the json string that will be saved in our database
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var commentSchema = mongoose.Schema({
    comment: {
        comic: String,
        post: String,
        commentor: String,
        picture: String,
        date: String
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
