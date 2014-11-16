// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user.js');


passport.use(new BasicStrategy(
  function(username, password, callback) {
    User.getUserByUsername(username, function (err, user) {
      if (err) { 
        console.log(err);
        return callback(err); }

      // No user found with that username
      if (!user) { return callback("user not found", false); }

      // Make sure the password is correct
      User.login({username: username, password: password }, function(err, userId) {
        if (err) { return callback(err); }

        // Password did not match
        if (!userId) { return callback("password did not match", false); }

        // Success
        return callback(null, userId);
      });
    });
  }
));



exports.isAuthenticated = passport.authenticate('basic', { session : false });
