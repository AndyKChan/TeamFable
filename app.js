///<reference path='types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='types/DefinitelyTyped/express/express.d.ts'/>
var Application = (function () {
    function Application() {
    }
    Application.prototype.start = function () {
        var express = require('express');
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        //Mongoose
        var mongoose = require('mongoose');
        //Passport
        var passport = require('passport');
        var flash = require('connect-flash');
        //Session
        var session = require('express-session');
        var mongoStore = require('connect-mongo')(session);
        var routes = require('./routes/index');
        var users = require('./routes/users');
        var configDB = require('./config/database.js');
        require('./config/passport');
        var app = express();
        var multer = require('multer');
        //Setting up templating engine
        var exphbs = require('express-handlebars');
        var hbs = require('hbs');
        hbs.registerHelper('compare', function(lvalue, rvalue, options) {

        if (arguments.length < 3)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        var operator = options.hash.operator || "==";
        
        var operators = {
            '==':       function(l,r) { return l == r; },
            '===':  function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l == r; }
        }

        if (!operators[operator])
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

        var result = operators[operator](lvalue,rvalue);

        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
        
    });

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', hbs.engine);
    app.set('view engine', hbs);
//
    //app.engine('handlebars', hbs.engine);
  //   app.engine('html', hbs({ defaultLayout: 'main' }));
        //app.set('view engine', 'html');
        
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));
        //Connect to mongoDB
        mongoose.connect(configDB.url);
        //Check database connection
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            console.log("Successfully connected to mongoDB");
        });
        //Required setup for passport
        app.use(session({
            secret: process.env.SESSION_SECRET || 'whenyoufeelitintherainbow',
            httpOnly: true,
            resave: false,
            saveUninitialized: false,
            store: new mongoStore({ mongooseConnection: db })
        })); // session secret
        app.use(passport.initialize());
        app.use(passport.session()); // persistent login sessions
        app.use(flash()); // use connect-flash for flash messages stored in session
        // Make our db accessible to our router
        app.use(function (req, res, next) {
            req.db = db;
            next();
        });
        app.use('/', routes);
        app.use('/users', users);
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        // error handlers
        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                console.log(err)
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }
        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            console.log(err)
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
        module.exports = app;
    };
    return Application;
})();
var application = new Application();
application.start();