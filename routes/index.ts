///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>

///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>

var express = require('express');
var router = express.Router();
var passport = require('passport');

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
}

/* GET main page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', {message: req.flash('loginMessage')});
});

/* GET signup page. */
router.get('/signup', function(req, res) {
    res.render('signup', {message: req.flash('signupMessage')});
});

/* GET home page. */
router.get('/home', isLoggedIn, function(req, res) {
  res.render('home', {
        user: req.user // get the user out of session and pass to template
    });
});

/* GET profile page. */
router.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile', {
        user: req.user // get the user out of session and pass to template
    });
});


/* GET comicMain page. */
router.get('/comicmain', isLoggedIn, function(req, res) {
  res.render('comicmain', {
        user: req.user // get the user out of session and pass to template
    });
});

/* GET comic page. */
router.get('/comic', isLoggedIn, function(req, res) {
  res.render('comic', {
        user: req.user // get the user out of session and pass to template
    });
});

/* GET search page. */
router.get('/search', isLoggedIn, function(req, res) {
  res.render('search', {
        user: req.user // get the user out of session and pass to template
    });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
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
    successRedirect: '/home', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

/* POST to Add User Service */
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

module.exports = router;
