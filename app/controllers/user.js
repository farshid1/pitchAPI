var User = require('../models/user.js');

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
exports.getUser = function(req, res, next) {
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

	User.create(user, function (err, node) {
        if (err) return next(err);
        //res.redirect('/users/' + user.id);
        console.log(node._node.data);
		res.jsonp(node._node.data);
    });

};


/**
 * PUT /users/:id
 */
exports.updateUser = function(req, res, next) {
	User.get(req.params.id, function(err, user) {
		if (err) return next(err);
		console.log(user);
		
		res.jsonp(user);
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

/**
 * POST /users/login
 */
exports.login = function(req, res, next) {

	user = {};
	user.username = req.body.username;
	user.password = req.body.password;

	User.login(user, function (err, userId) {
        if (err) {
        	//return next(err);
        	res.jsonp({status: err});
        	return;
        }
        res.jsonp({userId: userId});
    });
}

