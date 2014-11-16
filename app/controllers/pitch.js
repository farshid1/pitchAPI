var Pitch = require('../models/pitch.js');
var User = require('../models/user.js');

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

//complete
	Pitch.get(req.params.id,function (err, p) {
        if (err) return next(err);
        
        res.jsonp(pitch);
    });
};

/**
 * DELETE /pitch/:id
 */
exports.deletePitch = function(req, res, next) {
	Pitch.get(req.params.id, function (err, pitch) {
        if (err) return next(err);
        pitch.del(function (err) {
            if (err) return next(err);
            res.jsonp({status: "success"});
        });
    });
};

/**
 * GET pitch/:pid/comments
 */
exports.getComments = function(req, res, next) {
	Pitch.get(req.params.id, function (err, pitch) {
        if (err) return next(err);
        pitch.getComment(function (err, comments) {
            if (err) return next(err);
            res.jsonp({
            	status: "success",
            	comments: comments
            });
        });
    });
};

/**
 * POST /user/:uid/comments/:pid
 */
exports.commentPitch = function(req, res, next) {
	console.log(req.body);
	User.get(req.params.uid, function(err, user) {
		if (err) return next(err);
		Pitch.get(req.params.pid, function(err, pitch) {
			if (err) return next(err);
			user.comment(pitch, req.body.commentText, function(err, comment) {
				if (err) return next(err);
				res.jsonp({
					status: 'success',
					comment: comment
				});
			});
		});
	});
};

/**
 * GET pitch/search/:lat/:lon
 */
exports.searchPitchByLocation = function(req, res, next) {
	
};