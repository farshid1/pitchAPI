var pitches = require('./controllers/pitch.js');
var user = require('./controllers/user.js');
//var User = require('./controllers/user.js');
module.exports = function(router) {

	// route middleware that will happen on every request
	router.use(function(req, res, next) {

		// log each request to the console
		console.log(req.method, req.url);
		console.log("hey man");
		// continue doing what we were doing and go to the route
		next();	
	});

	// Pitches Routes
	router.route('/pitch').get(pitches.getAllPitches);
	router.route('/pitch').post(pitches.createPitch);
	router.route('/pitch/:id').get(pitches.getPitch);
	router.route('/pitch/:id').put(pitches.updatePitch);
	// router.route('/pitch/:id').delete(pitches.deletePitch);

	// Users Routes
	router.route('/user').get(user.getAllUsers);
	router.route('/user').post(user.createUser);
	router.route('/user/:id').get(user.getUser);
	router.route('/user/:id').put(user.updateUser);
	router.route('/user/:id').delete(user.deleteUser);

	router.route('/user/login').post(user.login);

	//router.route('/users/:userId/pitch/:pitchId').get(users.attendsPitch);	



};