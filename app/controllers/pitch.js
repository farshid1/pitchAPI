var Pitch = require('../models/pitch.js');

/**
 * GET /pitch
 */
exports.getAllPitches = function(req, res, next) {
	Pitch.getAll(function (err, pitches) {
        if (err) return next(err);
        res.jsonp(pitches);
    });
}


/**
 * POST /pitch
 */
exports.createPitch = function(req, res, next) {

	var pitch = {};
	var location = {};
	var data = {};

	pitch.title = req.body.title;
	pitch.description = req.body.description;
	pitch.date = req.body.date;
	pitch.time = req.body.time;

	location.city = req.body.city;
	location.state = req.body.state;
	location.address = req.body.address;
	location.zip = req.body.zip;

	data.location = location;
	data.pitch = pitch;
	data.userEmail = req.body.userEmail;
	console.log(data);

	Pitch.create(data, function (err, node) {
        if (err) return next(err);
        //res.redirect('/pitchs/' + pitch.id);
        console.log(node);
		res.jsonp(node);
    });

};

/**
 * GET /pitch/:id
 */
exports.getPitch = function(req, res, next) {
	Pitch.get(req.params.id,function (err, pitch) {
        if (err) return next(err);
        res.jsonp(pitch);
    });
}

/**
 * PUT /pitch/:id
 */
exports.updatePitch = function(req, res, next) {
	var pitch = {};
	var location = {};
	var data = {};

	pitch.title = req.body.title;
	pitch.description = req.body.description;
	pitch.date = req.body.date;
	pitch.time = req.body.time;

	location.city = req.body.city;
	location.state = req.body.state;
	location.address = req.body.address;
	location.zip = req.body.zip;

	data.location = location;
	data.pitch = pitch;
	data.userEmail = req.body.userEmail;

	Pitch.get(req.params.id,function (err, p) {
        if (err) return next(err);
        
        res.jsonp(pitch);
    });
}