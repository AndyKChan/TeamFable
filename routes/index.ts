///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>

///<reference path='../types/DefinitelyTyped/express/express.d.ts'/> 


var express = require('express');
var router = express.Router();


/* GET main page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login');
});

/* GET signup page. */
router.get('/signup', function(req, res) {
    res.render('signup');
});

/* GET home page. */
router.get('/home', function(req, res) {
  res.render('home');
});

/* GET profile page. */
router.get('/profile', function(req, res) {
  res.render('profile');
});


/* GET comicMain page. */
router.get('/comicmain', function(req, res) {
  res.render('comicmain');
});

/* GET comic page. */
router.get('/comic', function(req, res) {
  res.render('comic');
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


/* POST to Authenticate Service */
router.post('/login', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userPassword = req.body.userpassword;
    console.log(userName);
    console.log(userPassword);

    // Set our collection
    var collection = db.get('usercollection');

    collection.findOne({
        $or:[
            {"email": userName},
            {"username": userName}
        ]
    }, function(err, user) {
        if(err) {
         console.log("hi4");
            res.send("There was an error");
        }
        else if(!user) {
            console.log("hi1");
            res.send("No such user exists");
        }
        else if(user.password != userPassword){
            console.log("hi2");
            res.send("Incorrect Password");
            console.log(user["password"]);
            console.log(user.password);
        } else {
            console.log(user["password"]);

            res.redirect("home");
            console.log(user);
        }
    });

});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var userPassword = req.body.userpassword;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.findOne({

        $or:[
            {"email": userEmail},
            {"username": userName}
        ]
    
    }, function(err, user) {
        
        if(err) {
            res.send("There was an error");
        }
        else if(!user) {

            collection.insert({
                "username" : userName,
                "email" : userEmail,
                "password" : userPassword
            }, function (err, user) {
                if (err) {
                    // If it failed, return error
                    res.send("Database Insert Failed");
                }
                else {
                    // And forward to success page
                    res.redirect("login");
                }
            });

        } else {
            res.redirect("Username or Email is already taken");
        }
    });
});

module.exports = router;