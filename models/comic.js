/**
 * This is the model for the json string that will be saved in our database
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var comicSchema = mongoose.Schema({
	comic: {
   	 	comicName: String,
   	 	cooperative: Boolean,
   	 	description: String,
   	 	favorite: Boolean,
   		author: String,
   		date: Date,
   		img: String
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comic', comicSchema);
