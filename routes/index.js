///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var User = require('../models/user');
var File = require('../models/file');
var Comic = require('../models/comic');
var Comment = require('../models/comment');
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
var upload = multer({storage: storage}).single('filename');
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


/* Cooperative File Uploading Service */
router.post('/fileupload2', function(request, response) {
    
  upload(request, response, function(err) {
      if(err) {
        console.log('Error Occured');
        console.log(err);
        return;
      }
    console.log(request.file);
  // STORE FILENAME INTO MONGODO- FILENAME FIELD IS IN request.file.filename

  var file2 = new File({
                  filename: request.file.filename
              });
  
  file2.save(function(err) {
      if (err) throw err;
      console.log('File saved!');
  });

  File.find().limit(1).sort({$natural:-1}).exec(function(err, files) { 
      if (err) throw err;
  // object of all the users
    console.log("FAF");
    console.log(files);
  //i'm pulling file names from the database in this for loop and sending it, 
  //my problem is here where i should send back the whole file object
          //send back the whole file object, look at the tutorial for user/email
      response.redirect("/cooperative");   
  })
});
});

router.get("/images/:id", function (request, response) {
    var path = imageDir + request.params.filename;
    console.log("fetching image: ", path);
    response.sendFile(path);
});


// router.get("/images/:id", function (request, response) {
//     var path = imageDir + request.params.filename;
//     console.log("fetching image: ", path);
//     response.sendFile(path);
// });

/* GET cooperative comic main page. */
router.get('/cooperative', isLoggedIn, function (req, res) {
Comic.find().limit(1).sort({$natural:-1}).exec(function(err, comics) { 
      if (err) throw err;
      File.find().limit(1).sort({$natural:-1}).exec(function(err,files){
        res.render('cooperativecomicmain', {comic: comics, file: files , user: req.user});
      });
  });
});

/* POST to comic */
router.post('/cooperative', function(req, res) {

  var comic = new Comic({
    "comic.comicName": req.body["comicName"],
    "comic.cooperative": true,
    "comic.description": req.body["description"],
    "comic.favorite": false,
    "comic.author": req.user.local.username,
    "comic.date": new Date(),
    "comic.img": req.body["img"]
  });

  comic.save(function(err) {
      if (err) throw err;
      res.redirect('/cooperative');
  });
});

/* GET login page. */
router.get('/login', function (req, res) {
    res.render('login', { message: req.flash('loginMessage') });
});
/* GET signup page. */
router.get('/signup', function (req, res) {
    res.render('signup', { message: req.flash('signupMessage')});
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

// to remove everything
// Comment.remove({}, function (err) {
//  if (err) return handleError(err);
  // removed!
//});
router.get('/comment', isLoggedIn, function (req, res) {
  Comment.find({}, function(err, comments) {
      if (err) throw err;
    res.render('comment', {comment: comments , user: req.user});
  });
});
/* POST to comments */
router.post('/comment', function(req, res) {
var comment = new Comment({
    "comment.post": req.body["comment"],
    "comment.commentor": req.user.local.username,
    "comment.picture": req.user.local.picture,
    "comment.date": new Date(),
});
  comment.save(function(err) {
      if (err) throw err;
      res.redirect('/comment');
      console.log('comment posted!');
  });
});

/* GET cooperative comic main page. */
router.get('/cooperative', isLoggedIn, function (req, res) {
Comic.find({}, function(err, comics) {
      if (err) throw err;
    res.render('cooperativecomicmain', {comic: comics , user: req.user});
  });
});

/* POST to comic */
router.post('/cooperative', function(req, res) {
var comic = new Comic({
    "comic.comicName": req.body["title"],
    "comic.cooperative": true,
    "comic.description": req.body["description"],
    "comic.favorite": false,
    "comic.author": req.user.local.username,
});
  comic.save(function(err) {
      if (err) throw err;
      res.redirect('/cooperative');
  });
});

/* GET myworks page. */
router.get('/myworks', isLoggedIn, function (req, res) {
    res.render('myworks', {
        user: req.user // get the user out of session and pass to template
    });
});
/* GET search page. */
router.get('/search', isLoggedIn, function (req, res) {
    res.render('search', {
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

/* Edit view. */
router.get('/editcomic', isLoggedIn, function (req, res) {
    res.render('cooperativecomicmain', {
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
