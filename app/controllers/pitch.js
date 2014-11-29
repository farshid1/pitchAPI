var Pitch = require('../models/pitch.js');
var User = require('../models/user.js');
var Location = require('../models/location.js');
var geocoder = require('geocoder');

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

	// location.city = req.body.city;
	// location.state = req.body.state;
	// location.address = req.body.address;
	// location.zip = req.body.zip;

	address = location.address + " " + location.city + " " + location.state + " " + location.zip;
	console.log(address);
	//get locations coordinates
	geocoder.geocode(address, function(err, data) {
		//if (err) {next(err)};
		console.log(data.status);
		if (data.status !== 'OVER_QUERY_LIMIT' && data.status !== 'ZERO_RESULTS') {
            location.lat = data.results[0].geometry.location.lat;
			location.lng = data.results[0].geometry.location.lng;
			console.log(data.results[0].geometry.location);
        } else {
            // google has a limit on the number of requests per rime 
            return res.jsonp({error: "location does not exist"});
        }
		
	});

	data.location = location;
	data.pitch = pitch;
	data.userEmail = req.body.userEmail;
	console.log(data);

	Pitch.create(data, function (err, node) {
        if (err) return next(err);
        //res.redirect('/pitchs/' + pitch.id);
        console.log(node);
		res.jsonp(node._node);
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

//complete
	p = {};
	Pitch.get(req.params.id,function (err, pitch) {
        if (err) return next(err);

        pitch.title = req.body.title;
        p.title = req.body.title;
		pitch.description = req.body.description;
		p.description = req.body.description;
		pitch.date = req.body.date;
		p.date = req.body.date;
		pitch.time = req.body.time;
		p.time = req.body.time;

		p.city = req.body.city;
		p.state = req.body.state;
		p.address = req.body.address;
		p.zip = req.body.zip;

		pitch.save(function(err) {
			if (err) next(err);
			Location.updateByPitchId(pitch.id, p, function(err, location){

				if (err) {next(err)};
				console.log("from the controller", location.address);
				
				res.jsonp(p);

				// location.save(function(err, l){
				// 	if (err) next(err);
				// 	console.log("from the controller location save:", l.address);
				// 	res.jsonp(p);
				// })
			});
		});
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
        pitch.getComments(function (err, comments) {
            if (err) return next(err);
            res.jsonp(
            	comments
            );
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
				res.jsonp(
					comment
				);
			});
		});
	});
};

/**
 * GET pitch/search/:lat/:lon
 */
exports.searchPitchByLocation = function(req, res, next) {
	
};