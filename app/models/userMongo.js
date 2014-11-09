var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  username:  String,
  password: String,
  displayName: String,
  email: String,
  city: String,
  state: String,
  dateJoined: { 
  	type: Date, 
  	default: Date.now 
  }
  
});



//We should add the last argument to link the model to our collection
var User = mongoose.model('User', UserSchema, 'user');
module.exports = User;

