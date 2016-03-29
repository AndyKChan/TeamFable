/**
 * This is the model for the json string that will be saved in our database
 */


var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var stripSchema = mongoose.Schema({
	comicstrip: {
   	 	comicName: String,
   	 	//cooperative: Boolean,
   		author: String,
   		date: Date,
        stripid: Number,
        fileName: String
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Strip', stripSchema);
