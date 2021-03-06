/**
 * This is the model for the json string that will be saved in our database
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local: {
        email: String,
        username: String,
        password: String,
        birthdate: String,
        hobbies: String,
        location: String,
        contributor: Boolean,
        picture: String,
        comictitles: [String],
        favourite:[String],
        invites:[String],
        bookmarks: [
        		{comicName: String,
         		page: String}],
        },
    facebook: {
        id : String,
        token: String,
        email: String,
        name : String,
        first:Boolean,
    }
});

// encrpyts the password
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
