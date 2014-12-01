var User = require('../models/user.js');
var Pitch = require('../models/pitch.js');
var util = require('util');
var geocoder = require('geocoder');
var extend = require('extend');

var AWS = require('aws-sdk');
var s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
});
var fs = require('fs');
console.log(process.env.AWS_ID, process.env.AWS_SECRET);
// var Uploader = require('s3-streaming-upload').Uploader;
// var upload = null; 
// var s3 = require('s3');
// var awsS3Client = new AWS.S3(s3Options);
// var options = {
//   s3Client: awsS3Client,
//   accessKeyId: process.env.AWS_ID,
//   secretAccessKey: process.env.AWS_SECRET
//   // more options available. See API docs below.
// };
// var client = s3.createClient(options);
/**
 * GET /users
 */
exports.getAllUsers = function(req, res, next) {
	User.getAll(function (err, users) {
        if (err) return next(err);
        res.jsonp(users);
    });
}

/**
 * GET /users/:id
 */
exports.getUserById = function(req, res, next) {
	User.get(req.params.id, function(err, user) {
		if (err) return next(err);
		//console.log(user._node.data);
		userr =[];
		userr.push(user._node.data);
		res.jsonp(userr);
	});
}

/**
 * POST /user
 */
exports.createUser = function(req, res, next) {

	user = {};
	//console.log(req.files);
	user.username = req.body.username;
	user.displayName = req.body.displayName;
	user.password = req.body.password;
	user.email = req.body.email;
	user.city = req.body.city;
	user.state = req.body.state;


	User.create(user, function (err, node) {
        if (err) return next(err);
        //upload file
        //console.log(node);
        fs.readFile(req.files.image.path, function(err, data){
        	dest = 'user'+node.id+'.'+req.files.image.originalname.split('.').pop()
			s3Client.putObject({
		        Bucket: 'pitchproject',
		        Key: dest,
		        ACL: 'public-read',
		        Body: data,
		        ContentLength: req.files.image.size,
		      }, function(err, data) {
		        if (err)  next(err);
		        User.get(node.id, function(err, user) {
		        	if (err) {next(err)};
		        	user._node._data.data.image = dest;
		        	user.save(function(err) {
						if (err) return next(err);
						console.log("success");
						res.jsonp(extend(null,user._node.data, {id: user.id}));
					});
		        });
		        
		        //console.log("done", data);
		        
		        //console.log("https://s3.amazonaws.com/" + 'pitchproject' + '/' + 'pitch');
		    });
		});
		
    });

};


/**
 * PUT /users/:id
 */
exports.updateUser = function(req, res, next) {
	User.get(req.params.id, function(err, user) {
		if (err) return next(err);
		//console.log(user);
		user.displayName = req.body.displayName;
		user.username = req.body.username;
		user.email = req.body.email;
		user.password = req.body.password ? req.body.password : user.password;
		user.city = req.body.city;
		user.state = req.body.state;
		user.save(function(err) {
			if (err) return next(err);
			console.log("success");
			res.jsonp(extend(null,user._node.data, {id: user.id}));
		})
		
	})

};

/**
 * DELETE /users/:id
 */
exports.deleteUser = function(req, res, next) {
	 User.get(req.params.id, function (err, user) {
        if (err) return next(err);
        user.del(function (err) {
            if (err) return next(err);
            res.jsonp({status:"success"});
        });
    });
}



exports.getUserByUsername = function(req, res, next) {

	username = req.body.username;

	User.getUserByUsername(username, function (err, user) {
        if (err) {
        	res.jsonp({status: err});
        	return;
        }
        res.jsonp(user);
    });
};
/**
 * POST /user/login
 */
 // here find the user by username first then try to login
exports.login = function(req, res, next) {

    console.log("sdjksjfjsbdfjsbdfjhsdjhfshjdfjsdh");
    console.log(req.body.username, req.body.password);
	User.getUserByUsername(req.body.username, function(err, user) {
        console.log("sdjksjfjsbdfjsbdfjhsdjhfshjdfjsdh");
        if (err) {
        	res.jsonp({status: err});
        	return;
        }
        console.log(user._node.data);
        if (user._node.data.password == req.body.password) {
        	res.jsonp({
        		userId: user.id
        	});
        	return;
        }
        res.jsonp({
        	status: "failed",
        	error: "wrong password"
        });
	});

};

/**
 * POST /user/:id/attend
 */
exports.getAttendingPitches = function(req, res, next) {
	User.get(req.params.id, function (err, user) {
		if (err) return next(err);
        user.getAttendingPitches(function (err, pitches) {
            if (err) {
            	return res.jsonp(err);
            }
            console.log(pitches[0]);
            if (pitches.length > 0) {
				res.jsonp(pitches);
			}
			else {
				res.jsonp({error: "empty"});
			}
        });
	});
};

/**
 * GET /user/:id/myPitches
 */
exports.getMyPitches = function(req, res, next) {
	User.get(req.params.id, function(err, user) {
		if (err) return next(err);
		user.getPiches(function(err, pitches) {
			if (err) return next(err);
			if (pitches.length > 0) {
				res.jsonp(pitches);
			}
			else {
				res.jsonp({error: "empty"});
			}
		});
	});
};

/**
 * POST /user/:uid/attend/:pid
 */
exports.attendPitch = function(req, res, next) {
	User.get(req.params.uid, function(err, user) {
		if (err) return next(err);
		Pitch.get(req.params.pid, function(err, pitch) {
			if (err) return next(err);

            user.attend(pitch, function(err, status) {
                if (err) return next(err);
                return res.jsonp({status: status});
            });


		});
	});
};

/**
 * DELETE /user/:uid/attend/:pid
 */
exports.unattend = function(req, res, next) {
	User.get(req.params.uid, function(err, user) {
		if (err) return next(err);
		Pitch.get(req.params.pid, function(err, pitch) {
			if (err) return next(err);
			user.unattend(pitch.id, function(err, status) {
				if (err) return next(err);
				res.jsonp({
					status: status
				});
			});
		});
	});
};

/**
 * GET /user/:uid/notification
 */
exports.getNotification = function(req, res, next) {
	User.get(req.params.uid, function(err, user) {
		if (err) return next(err);
		user.getNotification(function(err, notifications) {
			if (err) return next(err);
			if (notifications.length > 0) {
				res.jsonp(notifications);
			}
			else {
				res.jsonp({error: "empty"});
			}
		});
	});
};
