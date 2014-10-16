var mongoose = require('mongoose');
var User = require('../models/user.js');
var _=require('underscore');

// Get all users
exports.getAllUsers = function(req, res) {
	User.find(function(err, pitches) {
		res.jsonp(pitches);
	});
}

// Create a user
exports.createUser = function(req, res) {


	user = new User();
	
	user.username = req.body.username;
	user.displayName = req.body.displayName;
	user.password = req.body.password;
	user.email = req.body.email;
	user.city = req.body.city;
	user.state = req.body.state;


	
	user.save(function(err, user){
		if (err) console.error(err);
		console.log(user, "yo what up")
		res.jsonp(user);
	});

}

// Get a user
exports.getUser = function(req, res) {
	res.json({ message: 'Bear created!' });
}

// Update a user
exports.updateUser = function(req, res) {
	res.json({ message: 'Bear created!' });
}

// Delete a user
exports.deleteUser = function(req, res) {
	res.json({ message: 'Bear created!' });
}

