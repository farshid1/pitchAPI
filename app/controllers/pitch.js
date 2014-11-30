var Pitch = require('../models/pitch.js');
var User = require('../models/user.js');
var Location = require('../models/location.js');
var extend = require('extend');
//var geocoder = require('geocoder');
var AWS = require('aws-sdk');
var s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
});
var fs = require('fs');

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
    data.userID = req.body.userID;

    Pitch.create(data, function (err, node) {
        if (err) return next(err);

        fs.readFile(req.files.image.path, function(err, d){
            dest = 'pitch'+node.id+'.'+req.files.image.originalname.split('.').pop()
            s3Client.putObject({
                Bucket: 'pitchproject',
                Key: dest,
                ACL: 'public-read',
                Body: d,
                ContentLength: req.files.image.size,
            }, function(err, d) {
                if (err)  next(err);

                console.log(node.id);
                Pitch.get(node.id, function(err, p){
                    if (err) return next(err);

                    p._node._data.data.image = dest;
                    p.save(function(err){
                        if (err) return next(err);
                        User.get(data.userID, function(err, user) {
                            if (err) return next(err);
                            console.log(user);
                            console.log(extend(null,p._node.data, data.location, {creator: user._node._data.data.username}, {id: p.id}));
                            res.jsonp(extend(null,p._node.data, data.location, {creator: user._node._data.data.username}, {id: p.id}));
                        });

                    });
                });



            });
        });


    });



	// address = req.body.address + " " + req.body.city + " " + req.body.state + " " + req.body.zip;
	// console.log(address);
	// //get locations coordinates
	// geocoder.geocode(address, function(err, data) {
	// 	//if (err) {next(err)};
	// 	console.log(data.status);
	// 	if (data.status !== 'OVER_QUERY_LIMIT' && data.status !== 'ZERO_RESULTS') {
 //            location.lat = data.results[0].geometry.location.lat;
	// 		location.lng = data.results[0].geometry.location.lng;
	// 		console.log(data.results[0].geometry.location);
 //        } else {
 //            // google has a limit on the number of requests per rime 
 //            return res.jsonp({error: "location does not exist"});
 //        }
		
	// });



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