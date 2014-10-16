var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PitchSchema = new Schema({
  title:  String,
  tags: [String],
  description:   String,
  location: [Number],
  date: { 
  	type: Date, 
  	default: Date.now 
  }
  
});

/**
 * Index Location
 */
PitchSchema.index({location: '2d'});	

//We should add the last argument to link the model to our collection
var Pitch = mongoose.model('Pitch', PitchSchema, 'pitch');
module.exports = Pitch;

