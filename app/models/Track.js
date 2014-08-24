module.exports = function (mongoose, config) {

  var Schema = mongoose.Schema
  	, ObjectId = Schema.ObjectId
    , salt_factor = config.salt || 10
  
  // Define user schema
  var trackSchema = new Schema({
    src: { type: String, required: true, index: { unique: true } },
  	title: { type: String, required: true },
  	artist: { type: String, required: true },
    album: { type: String, required: true },
    plays: { type: Number, required: true }
  }, { versionKey: false });

  /*
   * Methods
   */

  trackSchema.methods.authenticate = function (pass, next) {
  	// Compare via bcrypt
    var err = false;
    var success = true;

		if (err) return next(err)
		next(null, success)
  };

  return mongoose.model('track', trackSchema)
}