///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
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
router.post('/fileupload', multer({ dest: './public/images/'}).single('upl'), function(req,res){
    console.log(req.body); //form fields
    /* example output:
    { title: 'abc' }
     */
    console.log(req.file); //form files
    /* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
     */
    res.status(204).end();
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
    res.render('comicmain', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET cooperative comic main page. */
router.get('/cooperative', isLoggedIn, function (req, res) {
    res.render('comicmain', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET comic page. */
router.get('/comic', isLoggedIn, function (req, res) {
    res.render('comic', {
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
