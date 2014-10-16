var pitches = require('./controllers/pitch.js');
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


	// User routes :
	// app.post('/user/login', user.login);
	// app.post('/user/add', user.add);
	// app.get('/user/logout', user.logout);
	// app.post('/user/update', user.update);

	// Pitches Routes
	router.route('/pitch').get(pitches.getAllPitches);
	router.route('/pitch').post(pitches.createPitch);
	router.route('/pitch/:id').get(pitches.getPitch);
	router.route('/pitch/:id').post(pitches.updatePitch);
	router.route('/pitch/:id').delete(pitches.deletePitch);



};