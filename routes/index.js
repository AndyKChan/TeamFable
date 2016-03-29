///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var User = require('../models/user');
var File = require('../models/file');
var Comic = require('../models/comic');
var Comment = require('../models/comment');
var Comicstrip = require('../models/comicstrip');
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
    var fileFormat = (file.originalname).split(".");
    // rename the file to be the comicname + "-" + pagenumber
    callback(null, request.body["comicName"]+"-"+request.body["stripid"]+ "." +fileFormat[fileFormat.length - 1]);
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


/* file upload  */
router.post('/fileupload2', function(request, response) {
    
  upload(request, response, function(err) {
      if(err) {
        console.log('Error Occured');
        console.log(err);
        return;
      }
    console.log(request.body);
    console.log(request.file);
    var comicName= request.body["comicName"];
    Comic.findOne({"comic.comicName" : comicName},function(err,comic){
      if(err) throw err;
      console.log("finding");
      console.log(comic);
  
      var comicstripcoop = new Comicstrip({"comicstrip.comicName" : request.body["comicName"],
                                        "comicstrip.author": request.user.local.username,
                                        "comicstrip.date": new Date(),
                                        "comicstrip.stripid": request.body["comicName"]+"-"+request.body["stripid"]});

      comicstripcoop.save(function(err) {
        if(err) throw err;
        console.log("comicstrip created");
      });

      var a = comic.comic.pages;
      a.push(request.file.filename);
      console.log(a);
      console.log(comicName);
      if(request.body["stripid"] == "cover"){
        Comic.update(
          {'comic.comicName' : comicName},
          {'comic.coverpage' : request.file.filename},
          {safe: true},
          function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
        );
      } else{
        Comic.update(
          {'comic.comicName':comicName},
          {'comic.pages':a},
          {safe: true},
          function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
        );
      } 
    });
    response.redirect("/comic/"+comicName);   
  //});
});
});

router.get('/comic/:name/uploadcover',function(req,res){
  var comicName = req.params.name;
  console.log(comicName);
  Comic.findOne({"comic.comicName" : comicName},function(err,comic){
    if(err) throw err;
    console.log(comic);
    if(comic){
      res.render('uploadcover',{comic,user:req.user});
    } else {
      console.log("No such comic!");
      res.redirect('/home');
    }
  });
});


router.get("/images/:id", function (request, response) {
    var path = imageDir + request.params.filename;
    console.log("fetching image: ", path);
    response.sendFile(path);
});

/* GET comic main page. */
router.get('/comicmainpage', isLoggedIn, function (req, res) {
Comic.find().limit(1).sort({$natural:-1}).exec(function(err, comics) { 
      if (err) throw err;
      File.find().limit(1).sort({$natural:-1}).exec(function(err,files){
        res.render('comicmainpage', {comic: comics, file: files , user: req.user});
      });
  });
});

/* GET cooperative comic main page. */
router.get('/cooperative', isLoggedIn, function (req, res) {
Comic.find().limit(1).sort({$natural:-1}).exec(function(err, comics) { 
      if (err) throw err;
      File.find().limit(1).sort({$natural:-1}).exec(function(err,files){
        res.render('cooperativecomicmain', {comic: comics, file: files , user: req.user});
      });
  });
});

/* GET comic upload page*/
router.get('/comic/:name/upload',isLoggedIn,function(req,res){
  var comicName = req.params.name;
  console.log(comicName);
  Comic.findOne({"comic.comicName" : comicName},function(err,comic){
    if(err) throw err;
    console.log(comic);
    if(comic){
      res.render('uploadcomic',{comic,user:req.user});
    } else {
      console.log("No such comic");
      // still need to improve
      res.redirect('/home');
    }
  });
});

/* POST to cooperative comic */
router.post('/createcomic', function(req, res) {
  console.log(req.body);
  Comic.findOne({"comic.comicName" : req.body["comicName"]}, function(err, comic){
    if(err) throw err;
    console.log("finding");
    if(comic){
      console.log("show home");
      res.send("Comic Already Exist. Please use another name");
    } else{
      var comic = new Comic({
        "comic.comicName": req.body["comicName"],
        "comic.cooperative": (req.body["comictype"]=='coop'),
        "comic.description": req.body["description"],
        "comic.favourite":[],
        "comic.genre": req.body["genre"],
        "comic.rating":0,
        "comic.ratings":[],
        "comic.author": req.user.local.username,
        "comic.date": new Date(),
        "comic.coverpage": [],
        "comic.pages": [],
        "comic.worklist":[req.user.local.username,]
      });
      comic.save(function(err) {
        if (err) throw err;
        res.send({redirect:'/comic/'+req.body["comicName"]});
      });
    }

  });
  
});

// /* GET solo comic main page. */
// router.get('/solo', isLoggedIn, function (req, res) {
//     //var soloURL = '/solo/';
//    // var titleADDON = user.local.comictitle;
//    // var url = soloURL.concat(titleADDON);
//    res.render('solocomicmain', {

//         user: req.user // get the user out of session and pass to template
//     });
// });

/* GET solo comic main page. */
router.get('/solo', isLoggedIn, function (req, res) {
Comic.find().limit(1).sort({$natural:-1}).exec(function(err, comics) { 
      if (err) throw err;
      File.find().limit(1).sort({$natural:-1}).exec(function(err,files){
        res.render('solocomicmain/' + req.user.username, {comic: comics, file: files , user: req.user});
      });
  });
});

/* POST to solo comic */
router.post('/solo', function(req, res) {

  var comic = new Comic({
    "comic.comicName": req.body["comicName"],
    "comic.cooperative": false,
    "comic.description": req.body["description"],
    "comic.genre" : req.body["genre"],
    "comic.favorite": false,
    "comic.author": req.user.local.username,
    "comic.date": new Date(),
    "comic.img": req.body["img"],
    "comic.page1": req.body["page1"],
    "comic.page2": req.body["page2"]
  });

  comic.save(function(err) {
      if (err) throw err;
      res.redirect('/comicmainpage');
  });
});

/* Solo File Uploading Service */
router.post('/fileupload', function(request, response) {
    
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

  File.find().limit(1).sort({$natural:-1}).exec(function(err, files) { 
      if (err) throw err;
  // object of all the users
    console.log("FAF");
    console.log(files);
  //i'm pulling file names from the database in this for loop and sending it, 
  //my problem is here where i should send back the whole file object
          //send back the whole file object, look at the tutorial for user/email
      response.redirect("/solo");   
  })
});
});

router.get("/images/:id", function (request, response) {
    var path = imageDir + request.params.filename;
    console.log("fetching image: ", path);
    response.sendFile(path);
});
/*GET facebook login*/
router.get('/auth/facebook',passport.authenticate('facebook'));

/*call back from facebook login*/
router.get('/auth/facebook/callback',
  passport.authenticate('facebook',{failureRedirect:'/login'}),
  function(req,res){
    if(req.user.facebook.first){
      res.redirect('/fbtype');
    }else{
      res.redirect('/home');
    }
    
  });

/*Get fbtype page*/
router.get('/fbtype',function(req,res){
  res.render('fbtype',{user:req.user});
});

/* Post fbtype*/
router.post('/fbtype',function(req,res){
  console.log(req.body);
  console.log(req.user);
  User.update(
    {'facebook.id' : req.user.facebook.id},
    {'local.contributor':req.body['fbtype']=="contributor",
     'facebook.first':false},
    {safe:true},
    function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
    );
  res.redirect('/home');
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
router.get('/profile/:username', isLoggedIn, function (req, res) {
  var u = req.user;
  console.log(req.params);
   User.findOne({'local.username':req.params.username}, function(err, user) {
      if (err) throw err;
      u = user;
  console.log(req.params);
    res.render('profile', {
        user: req.user, otheruser: u // get the user out of session and pass to template
    });
});
});   
router.get('/profile', isLoggedIn, function (req, res) {
  var u = req.user;
  var invite = u.local.invites;
  console.log(req);
    res.render('profile', {
        user: u, otheruser: u, invite // get the user out of session and pass to template
    });
});

router.put('/updateProfile', function (req, res) {
  console.log(req.body);
var username = req.user.local.username;
var birthdate = req.user.local.birthdate;
var hobbies = req.user.local.hobbies;
var location = req.user.local.location;

if (req.body.birthdate == "") {
  req.body.birthdate = birthdate;
}
if (req.body.location == "") {
  req.body.location = location;
}
if (req.body.hobbies == "") {
  req.body.hobbies = hobbies;
}

User.update({'local.username': username},
    {'local.birthdate':req.body.birthdate, 
    'local.hobbies':req.body.hobbies, 
    'local.location':req.body.location,
    }, {multi:true},function(err, data){
});
});
/*delete invitations*/
router.delete('/deleteInvite', function (req, res) {
    User.update({"local.username":req.user.local.username},{$pull: {"local.invites": req.body.comicName}},
      { safe: true },
      function () {
      });
});

/*POST user to worklist*/
router.post('/acceptInvite', function(req, res) {
  console.log(req.body);
    Comic.findOne({"comic.comicName":req.body.comicName},function(err,comic){
        if (err) throw err;
        var tempcomicworklist = comic.comic.worklist;
        if(tempcomicworklist.indexOf(req.user.local.username) == -1){
          tempcomicworklist.push(req.user.local.username);
        }
        console.log(tempcomicworklist);
        Comic.update(
            {'comic.comicName': req.body.comicName},
            {'comic.worklist':tempcomicworklist},
            {safe:true},
        function(err,raw){
            if(err) throw err;
            res.redirect("/comic/"+req.body.comicName);
          }
      );
  });
});


// to remove everything
// Comment.remove({}, function (err) {
//  if (err) return handleError(err);
  // removed!
//});
router.get('/comment/:comic', isLoggedIn, function (req, res) {
  Comment.find({'comment.comic':req.params.comic}, function(err, comments) {
      if (err) throw err;
      {Comic.findOne({'comic.comicName':req.params.comic}, function(err, comic) {
      if (err) throw err;
    res.render('comment', {comment: comments , user: req.user, comic: comic});
  });}
 });
});
/* POST to comments */
router.post('/comment', function(req, res) {
console.log(req.body);
var comment = new Comment({
    "comment.post": req.body["comment"],
    "comment.commentor": req.user.local.username,
    "comment.picture": req.user.local.picture,
    "comment.date": new Date(),
    "comment.comic": req.body["comicName"],
});
console.log(comment);
  comment.save(function(err) {
      if (err) throw err;
      res.redirect('/comment/'+comment.comment.comic);
      console.log('comment posted!');
  });
});

/*DELETE comment*/
router.delete('/deleteComment', function (req, res) {
    Comment.find({"comment.post":req.body.post,"comment.date":req.body.date}).remove().exec();
});

/* GET myworks page. */
router.get('/myworks', isLoggedIn, function(req, res){
   Comic.find({"comic.author" : req.user.local.username}, function(err, comics){
       if (err) throw err;
      res.render('myworks', {
         comic: comics,
         otheruser: req.user,
         user: req.user // get the user out of session and pass to template
      });
    });
});

/* GET myworks page. */
router.get('/myworks/:username', isLoggedIn, function(req, res){
User.findOne({'local.username':req.params.username}, function(err, user) {
if (err) throw err;
   {Comic.find({"comic.author" : user.local.username}, function(err, comics){
       if (err) throw err;
      res.render('myworks', {
         comic: comics,
         otheruser: user,
         user: req.user // get the user out of session and pass to template
      });
    });}
});
});

/* Post invite */
router.post('/myworks', function(req, res) {
    User.findOne({"local.username":req.body["invite"]},function(err,user){
        if (err) throw err;
        var tempuserinvites = user.local.invites;
        if(tempuserinvites.indexOf(req.body["comicName"]) == -1){
          tempuserinvites.push(req.body["comicName"]);
        }
        console.log(tempuserinvites);
        User.update(
            {'local.username': req.body["invite"]},
            {'local.invites':tempuserinvites},
            {safe:true},
        function(err,raw){
            if(err) throw err;
            res.redirect("/profile");
          }
      );
  });
}); 
/*nav seatch*/
router.post('/navsearch',function(req,res){
  
});

/* GET search page. */
router.get('/search', isLoggedIn, function (req, res) {
    res.render('search', {
        user: req.user // get the user out of session and pass to template
    });
});
/*search result*/
router.post('/test', function(req,res,next) {
  console.log("POST REQ");
  console.log(req.body);
  var a ="";
  if(req.body.type == "comic"){
    Comic.find({'comic.comicName' : req.body.data},function(err,comics){
      console.log("SEARCHING");
      console.log(comics);
      if(err) throw err;
      //console.log(req.body);
      //console.log({comic: comics});
      if(comics.length!=0){
        for(i=0;i<comics.length;i++){
          a += comics[i]["comic"]["comicName"]+" ";
        }
        console.log(a);
        //console.log(comics[0]["comic"]["author"]);
      } else {
        a = "Not Found!";
      }
      res.send(a);
    });
  } else if(req.body.type == "author"){
    User.find({'local.username' : req.body.data},function(err,users){
      console.log("SEARCHING");
      console.log(users);
      if(err) throw err;
      if(users.length!=0){
        for(i=0;i<users.length;i++){
          a += users[i]["local"]["username"]+" ";
         }
      } else {
        a = "Not Found!";
      }
      res.send(a);
    });
  } else {
    Comic.find({'comic.genre':req.body.data}, function(err,comics){
      console.log("SEARCHING");
      console.log(comics);
      if (err) throw err;
      if(comics.length != 0){
        for(i=0;i<comics.length;i++){
          a +=comics[i]["comic"]["comicName"]+" ";
        }
      } else {
        a = "Not Found!"
      }
      res.send(a);
      });
  }
 });
 
 /* Put rating*/
router.put('/updateRating', isLoggedIn, function (req, res) {
  console.log(req.body);

 Comic.findOne({'comic.comicName': req.body.comicName},function(err,comic){
      var updated = 0;
      var overallrating = 0;
      var count = 0;
      console.log(comic);
        if (err) throw err;
        var tempcomicratings = comic.comic.ratings;
        for (var i in tempcomicratings) {
          if (tempcomicratings[i].rater == req.user.local.username) {
          tempcomicratings[i].rating = req.body.rating;
          updated = 1;
          }
        }

        console.log(updated);
        if (updated == 0)
          tempcomicratings.push({"rater": req.user.local.username,"rating": req.body.rating })
        else{console.log("already in array")};

          for (var i in tempcomicratings) {
          if (tempcomicratings[i].rating != undefined) {
            count += 1;
            overallrating += tempcomicratings[i].rating; 
            }          
        } 
        console.log(count);
        overallrating = overallrating/count;
        Comic.update(
            {'comic.comicName': req.body.comicName},
            {'comic.ratings':tempcomicratings,
            'comic.rating':overallrating},
            {safe:true},
        function(err,raw){
            if (err) throw err;
          }
      );
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
Comic.find().limit(1).sort({$natural:-1}).exec(function(err, comics) { 
      if (err) throw err;
      File.find().limit(1).sort({$natural:-1}).exec(function(err,files){
        res.render('cooperativecomic', {comic: comics, file: files , user: req.user});
      });
  });
});

/* POST to comic */
router.post('/cooperativecomic', function(req, res) {

  var comic = new Comic({
    "comic.comicName": req.body["comicName"],
    "comic.cooperative": true,
    "comic.description": req.body["description"],
    "comic.genre": req.body["genre"],
    "comic.favorite": false,
    "comic.author": req.user.local.username,
    "comic.date": new Date(),
    "comic.img": req.body["img"],
    "comic.page1": req.body["page1"],
    "comic.page2": req.body["page2"]
  });

  comic.save(function(err) {
      if (err) throw err;
      res.redirect('/cooperativecomic');
  });
});

/*check user*/
router.post('/checkuser',function(req,res){
  console.log(req.body.data);
  var username = req.body.data;
  if(req.body.type=="favourite"){
    User.findOne({"local.username":username},function(err,user){
      if (err) throw err;
      if (user.local.favourite.indexOf(req.body.comic) == -1){
        res.send("notfavourite");
      } else {
        res.send("favourited");
      }
    });
  }

});

/*add favourite*/
router.post('/addfavourite',function(req,res){
  console.log("here");
  console.log(req.body);
  var comicName = req.body.comic;
  var username = req.body.data;
  console.log(comicName);
  console.log(username);

  Comic.findOne({"comic.comicName" : comicName},function(err,comic){
    if(err) throw err;

    var tempcomicfavour = comic.comic.favourite;
    console.log(tempcomicfavour);
    if(tempcomicfavour.indexOf(username) == -1){
      tempcomicfavour.push(username); 
    }
    Comic.update(
          {'comic.comicName' : comicName},
          {'comic.favourite' : tempcomicfavour},
          {safe: true},
          function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
        );
  });

  User.findOne({"local.username" : username},function(err,user){
    if (err) throw err;
    var tempuserfavourite = user.local.favourite;
    if(tempuserfavourite.indexOf(comicName) == -1){
      tempuserfavourite.push(comicName);
    }
    console.log(tempuserfavourite);
    User.update(
    {'local.username': username},
    {'local.favourite':tempuserfavourite},
    {safe:true},
    function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
  );
  }); 
  console.log("comicsucc");
  res.send("Added Successfully!");
});
/*delete favourite*/
router.post('/delfavourite',function(req,res){

  var comicName = req.body.comic;
  var username = req.body.data;

  Comic.findOne({"comic.comicName" : comicName},function(err,comic){
    if(err) throw err;

    var tempcomicfavour = comic.comic.favourite;
    var index = tempcomicfavour.indexOf(username);
    if(index > -1){
      tempcomicfavour.splice(index,1); 
    }
    Comic.update(
          {'comic.comicName' : comicName},
          {'comic.favourite' : tempcomicfavour},
          {safe: true},
          function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
        );
  });

  User.findOne({"local.username" : username},function(err,user){
    if (err) throw err;
    var tempuserfavourite = user.local.favourite;
    var comicindex = tempuserfavourite.indexOf(comicName);
    if(comicindex > -1){
      tempuserfavourite.splice(comicindex,1);
    }
    User.update(
    {'local.username': username},
    {'local.favourite':tempuserfavourite},
    {safe:true},
    function(err,raw){
            if(err) throw err;
            console.log(raw);
          }
  );
  });
  res.send("Delete Successfully!");
});

/*Get comic mainpage with cover page and Comicname*/
router.get('/comic/:name', isLoggedIn, function(req, res){
  var comicName = req.params.name;
  console.log(comicName);
  Comic.findOne({"comic.comicName" : comicName},function(err,comic){
    if(err) throw err;
    if(comic){
      console.log(JSON.stringify(comic));
      console.log(req.user);
      res.render('test',{user: req.user, comic});
    } else {
      console.log("No such comic");
      // still need to improve
      res.redirect('/home');
    }
    
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
