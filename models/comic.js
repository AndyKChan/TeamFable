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
         genre: String,
   	 	favourite: [String],
   		author: String,
   		date: Date,
         worklist:[String],
   		coverpage: String,
         pages:[String]
   		//page1: [String],
   		//page2: [String],
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comic', comicSchema);
