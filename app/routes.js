var pitch = require('./controllers/pitch.js');
var user = require('./controllers/user.js');
var auth = require('./controllers/auth.js');

module.exports = function(router) {
	// route middleware that will happen on every request
	router.use(function(req, res, next) {

		// log each request to the console
		console.log(req.method, req.url);
		// continue doing what we were doing and go to the route
		next();	
	});

	router.route('/')
			.get(function(req, res, next) {
				res.jsonp({hey: "i'm working"});
			});
	// Users Routes
	router.route('/user')
			.get(user.getAllUsers)
			.post(user.createUser);

	router.route('/user/:id')
			.get(auth.isAuthenticated, user.getUserById)
			.post(auth.isAuthenticated, user.updateUser)
			.delete(auth.isAuthenticated, user.deleteUser);

	router.route('/user/:id')
			.get(auth.isAuthenticated, user.getUserByUsername);

	router.route('/user/login')
			.post(user.login);
	//Action Routes
	router.route('/user/:id/attend')
			.get(auth.isAuthenticated, user.getAttendingPitches);

	router.route('/user/:id/myPitches')
			.get(auth.isAuthenticated, user.getMyPitches);

	router.route('/user/:uid/attend/:pid')
			.post(auth.isAuthenticated, user.attendPitch)
			.delete(auth.isAuthenticated, user.unattend);

	router.route('/user/:uid/notification')
			.get(auth.isAuthenticated, user.getNotification);

	router.route('/user/:uid/comments/:pid')
		.post(auth.isAuthenticated, pitch.commentPitch);

	// Pitches Routes
	router.route('/pitch')
			.post(auth.isAuthenticated, pitch.createPitch);

	router.route('/pitch/:id')
			.get(auth.isAuthenticated, pitch.getPitch)
			.post(auth.isAuthenticated, pitch.updatePitch)
			.delete(auth.isAuthenticated, pitch.deletePitch);

	router.route('/pitch/:id/comments')
			.get(auth.isAuthenticated, pitch.getComments);

    router.route('/pitch/:id/attendants')
        .get(auth.isAuthenticated, pitch.getAttendants);

	router.route('/pitch/search/:lat/:lon')
			.get(auth.isAuthenticated, pitch.searchPitchByLocation);

};