///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var User = require('../models/user');
var File = require('../models/file');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var imageDir = __dirname + "/../public/images/";
var fs = require("fs");
var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, './public/images');
},
filename: function (request, file, callback) {
    console.log(file);
    callback(null, file.originalname)
}
});
var upload = multer({storage: storage}).single('upl');
/**
 * Middleware
 */
// route middleware to make sure a user is logged in
var isLoggedIn = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
};
/* GET main page. */
router.get('/', function (req, res, next) {
    res.render('index');
});
/* File uploading service */
router.post('/fileupload', function(request, response) {
    var filename_arr = [];
  upload(request, response, function(err) {
      if(err) {
        console.log('Error Occured');
        console.log(err);
        return;
    }
    console.log(request.file);
  // STORE FILENAME INTO MONGODO- FILENAME FIELD IS IN request.file.filename

  var file = new File({
    filename: request.file.filename
});
  file.save(function(err) {
      if (err) throw err;
      console.log('File saved!');
  });
  File.find({}, function(err, files) {
      if (err) throw err;

  // object of all the users
  
  console.log("FAF");
  console.log(files);
  
  for(i=0;i <files.length; i++){
    console.log(files[i].filename);
    filename_arr.push(files[i].filename);
    if (i == (files.length -1)){
        response.render('cooperativecomicmain', {filenames: filename_arr});   
    }
};

});
  
})
});
router.get("/images/:id", function (request, response) {
    var path = imageDir + request.params.filename;
    console.log("fetching image: ", path);
    response.sendFile(path);
});
/* GET login page. */
router.get('/login', function (req, res) {
    res.render('login', { message: req.flash('loginMessage') });
});
/* GET signup page. */
router.get('/signup', function (req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
});
/* GET home page. */
router.get('/home', isLoggedIn, function (req, res) {
    res.render('home', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET profile page. */
router.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET solo comic main page. */
router.get('/solo', isLoggedIn, function (req, res) {
    //var soloURL = '/solo/';
   // var titleADDON = user.local.comictitle;
   // var url = soloURL.concat(titleADDON);
   res.render('solocomicmain', {

        user: req.user // get the user out of session and pass to template
    });
});
/* GET solo comic page 1. */
router.get('/solocomic', isLoggedIn, function (req, res) {
    res.render('solocomic', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET solo comic page 2. */
router.get('/solocomic2', isLoggedIn, function (req, res) {
    res.render('solocomic2', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET cooperative comic main page. */
router.get('/cooperative', isLoggedIn, function (req, res) {
    res.render('cooperativecomicmain', {
        user: req.user // get the user out of session and pass to template

    });

});
/* GET cooperative comic page 1. */
router.get('/cooperativecomic', isLoggedIn, function (req, res) {
    res.render('cooperativecomic', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET cooperative comic page 2. */
router.get('/cooperativecomic2', isLoggedIn, function (req, res) {
    res.render('cooperativecomic2', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET upload page. */
router.get('/upload', isLoggedIn, function (req, res) {
    res.render('upload', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET Userlist page. */
router.get('/userlist', function (req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({}, {}, function (e, docs) {
        res.render('userlist', {
            "userlist": docs
        });
    });
});
/**
 * Logout page
 */
 router.get('/logout', function (req, res, next) {
    req.logout();
    // req.session.destroy();
    res.redirect('/');
});
 /* POST to Authenticate Service */
 router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true // allow flash messages
}));
 /* POST to Add User Service */
 router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
}));
 module.exports = router;