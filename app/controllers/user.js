var User = require('../models/user.js');
var Pitch = require('../models/pitch.js');
var multiparty = require('multiparty');
var Dropbox = require("dropbox");
var client = new Dropbox.Client({
    key: "i61n5his3jx7r41",
    secret: "c6t2w5o8ylxktmc"
});

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
		console.log(user._node.data);
		res.jsonp(user._node.data);
	});
}

/**
 * POST /users
 */
exports.createUser = function(req, res, next) {

	user = {};
	user.username = req.body.username;
	user.displayName = req.body.displayName;
	user.password = req.body.password;
	user.email = req.body.email;
	user.city = req.body.city;
	user.state = req.body.state;

	// var form = new multiparty.Form();

	// form.parse(req, function(err, fields, files) {
	// 	user.username = req.body.username;
	// 	user.displayName = req.body.displayName;
	// 	user.password = req.body.password;
	// 	user.email = req.body.email;
	// 	user.city = req.body.city;
	// 	user.state = req.body.state;
 //    });
	

	User.create(user, function (err, node) {
        if (err) return next(err);
        //upload file
        client.
        console.log(node);
		res.jsonp(node._node);
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
			res.jsonp(user);
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

	User.getUserByUsername(req.body.username, function(err, user) {
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
            if (err) return next(err);
            res.jsonp(
            	pitches
            );
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
			res.jsonp(
				pitches
			);
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
				res.jsonp({
					status: status
				});
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
			res.jsonp(
				notifications
			);
		})
	});
};
