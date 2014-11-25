// server.js

// BASE SETUP
// =============================================================================

// call the packages we need ================================
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var router = express.Router(); 
var session = require('express-session');
var passport = require('passport');

//database setuo
// var mongoose = require('mongoose');
// mongoose.connect("mongodb://localhost:27017/pich-db");


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

var port = process.env.PORT || 8080; 

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// routes ==================================================
require('./app/routes')(router); // pass our application into our routes



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('time to pitch');