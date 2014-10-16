var mongoose = require('mongoose');
var Pitch = require('../models/pitch.js');
var _=require('underscore');

// Get all pitches
exports.getAllPitches = function(req, res) {
	Pitch.find(function(err, pitches) {
		res.jsonp(pitches);
	});
}

// Create a pitch
exports.createPitch = function(req, res) {

	//console.log(req);
	// var pitch = new Pitch({
	// 	total: req.body.title,
	pitch = new Pitch();
	// });
	pitch.title = req.body.title;
	pitch.tags = [];
	_.each(req.body.tags, function(tag){
		pitch.tags.push(tag);
	});

	pitch.description = req.body.description;

	pitch.location = req.body.location;

	pitch.save(function(err, pitch){
		if (err) console.error(err);
		console.log(pitch, "yo what up")
		res.jsonp(pitch);
	});

}

// Get a pitch
exports.getPitch = function(req, res) {
	res.json({ message: 'Bear created!' });
}

// Update a pitch
exports.updatePitch = function(req, res) {
	res.json({ message: 'Bear created!' });
}

// Delete a pitch
exports.deletePitch = function(req, res) {
	res.json({ message: 'Bear created!' });
}

