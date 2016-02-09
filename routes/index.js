///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/> 
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/* GET main page. */
router.get('/', function (req, res, next) {
    res.render('index');
});
/* GET login page. */
router.get('/login', function (req, res) {
    res.render('login');
});
/* GET signup page. */
router.get('/signup', function (req, res) {
    res.render('signup');
});
/* GET home page. */
router.get('/home', function (req, res) {
    res.render('home');
});
/* GET profile page. */
router.get('/profile', function (req, res) {
    res.render('profile');
});
/* GET comicMain page. */
router.get('/comicmain', function (req, res) {
    res.render('comicmain');
});
/* GET comic page. */
router.get('/comic', function (req, res) {
    res.render('comic');
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
/* POST to Authenticate Service */
router.post('/login', function (req, res) {
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
        $or: [
            { "email": userName },
            { "username": userName }
        ]
    }, function (err, user) {
        if (err) {
            console.log("hi4");
            res.send("There was an error");
        }
        else if (!user) {
            console.log("hi1");
            res.send("No such user exists");
        }
        else if (user.password != userPassword) {
            console.log("hi2");
            res.send("Incorrect Password");
            console.log(user["password"]);
            console.log(user.password);
        }
        else {
            console.log(user["password"]);
            res.redirect("home");
            console.log(user);
        }
    });
});
/* POST to Add User Service */
router.post('/adduser', function (req, res) {
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
        $or: [
            { "email": userEmail },
            { "username": userName }
        ]
    }, function (err, user) {
        if (err) {
            res.send("There was an error");
        }
        else if (!user) {
            collection.insert({
                "username": userName,
                "email": userEmail,
                "password": userPassword
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
        }
        else {
            res.redirect("Username or Email is already taken");
        }
    });
});
/* POST to Add Image Service */
router.post('/addimage', function (req, res) {
    // img path
    var imgPath = '/path/to/some/img.png';
    // connect to mongo
    mongoose.connect('localhost', 'testing_storeImg');
    var A = mongoose.model('A', schema);
    mongoose.connection.on('open', function () {
        console.error('mongo is open');
        // empty the collection
        A.remove(function (err) {
            if (err)
                throw err;
            console.error('removed old docs');
            // store an img in binary in mongo
            var a = new A;
            a.img.data = fs.readFileSync(imgPath);
            a.img.contentType = 'image/png';
            a.save(function (err, a) {
                if (err)
                    throw err;
                console.error('saved img to mongo');
                // start a demo server
                var server = express.createServer();
                server.get('/', function (req, res, next) {
                    A.findById(a, function (err, doc) {
                        if (err)
                            return next(err);
                        res.contentType(doc.img.contentType);
                        res.send(doc.img.data);
                    });
                });
                server.on('close', function () {
                    console.error('dropping db');
                    mongoose.connection.db.dropDatabase(function () {
                        console.error('closing db connection');
                        mongoose.connection.close();
                    });
                });
                server.listen(3333, function (err) {
                    console.error('press CTRL+C to exit');
                });
                process.on('SIGINT', function () {
                    server.close();
                });
            });
        });
    });
});
module.exports = router;
