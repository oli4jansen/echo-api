module.exports = function (db, utils, other) {
    
  var fs = other.fs,
  id3 = other.id3,
  async = other.async

  /********
   * Track *
   ********/
  return {

  /*
   * List Tracks
   */
  search: function (req, res) {
    /* OH FUCK NO REGEX */
    var regex = new RegExp(req.params.query, "i");
    var query = db.Track.find({$or: [{ title: regex },{ artist: regex },{ album: regex }] }).sort('-plays');

    query.exec(function (err, tracks) {
      res.json(tracks || []);
    })
  },

  }
}
