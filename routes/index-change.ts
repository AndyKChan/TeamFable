///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>

///<reference path='../types/DefinitelyTyped/express/express.d.ts'/> 

var express = require('express');
var router = express.Router();

interface UserInterface {
        getName() : string;
        getEmail() : string;
}

class User implements UserInterface {
    
    private name : string;
    private email : string;

    constructor(theName : string, theEmail: string){
        this.name = theName;
        this.email = theEmail;
    }

    getName(){
        return this.name;
    }

    getEmail(){
        return this.email;
    }
}

class Router {

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



    /* POST to Add User Service */
    router.post('/adduser', function(req, res) {

        // Set our internal DB variable
        var db = req.db;

        // Get our form values. These rely on the "name" attributes
        var userName = req.body.username;
        var userEmail = req.body.useremail;

        // Set our collection
        var collection = db.get('usercollection');

        // Submit to the DB
        collection.insert({
            "username" : userName,
            "email" : userEmail
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.redirect("userlist");
            }
        });
    });
}

var user = new User();
var router = new Router(); 

module.exports = {router, user};