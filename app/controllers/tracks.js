module.exports = function (db, utils, other) {
    
  var fs = other.fs,
  id3 = other.id3,
  async = other.async,
  musicFolder = './music/'

  /********
   * Track *
   ********/
  return {

  /*
   * Sync Database
   */
  sync: function (req, res) {
    // Get all tracks in the music folder
    fs.readdir(musicFolder, function (err, tracksFileSystem) {
      if(err) return utils.error(res, 500, err)

      // Get all tracks in the database
      db.Track.find({}, 'src', function (err, tracks) {

        // Only keep the track IDs/filenames in the array
        var tracksDatabase = [];
        tracks.forEach(function (track) {
          tracksDatabase.push(track.src);
        });

        // Calculate the difference (= the tracks that are missing in the database)
        var tracksNotInDatabase = tracksFileSystem.diff( tracksDatabase );

        var calls = [];
        var tracksToSaveToDatabase = [];

        // Get metadata for each track
        tracksNotInDatabase.forEach(function (track) {
          tracksToSaveToDatabase.push({
            src: track,
            title: track,
            artist: 'unknown artist',
            album: 'unknown album',
            plays: 0
          });
        });

        console.log(tracksToSaveToDatabase);

        db.Track.create(tracksToSaveToDatabase, function (err) {
          if (err) return utils.error(res, 500, err)
          res.json(tracksToSaveToDatabase || [])
        });
      });
    })
  },

  /*
   * Clear Database
   */
  clear: function (req, res) {
    db.Track.remove({}, function (err) {
      res.json(err || []);
    })
  },

  /*
   * List Tracks
   */
  list: function (req, res) {
    db.Track.find({}, function (err, tracks) {
      res.json(tracks || []);
    })
  },

  /*
   * Get Track Info
   */
  info: function (req, res) {
    if(!req.params._id) return utils.error(res, 403, 'Requires a track ID')

    db.Track.find({ _id: req.params._id }, function (err, tracks) {
      var output = [];
      var calls = [];

      tracks.forEach(function (track) {
        calls.push(function (callback) {
          id3({ file: musicFolder+track.src, type: id3.OPEN_LOCAL }, function(err, tags) {
            tags.src = track.src
            output.push(tags);
            callback(null, track);
          })
        })
      })

      async.parallel(calls, function(err, result) {
        if (err) return utils.error(res, 500, err)
        res.json(output || [])
      })
    })
  },

  /*
   * Stream Track
   */

  stream: function (req, res) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendfile(musicFolder+req.params._id);

    db.Track.findOne({ _id: req.params._id }, function (err, track) {
      if(err) return;
      track.plays++;
      track.save(function (err) {
        if(err) console.log(err);
      });
    });
  },

  /*
   * Update Track Info
   */

  update: function (req, res) {
    console.log(req.params);
    console.log(req.body);

    if(!req.params._id || !req.body.title || !req.body.artist || !req.body.album) return utils.error(res, 403, 'Requires data')

    db.Track.findOne({ _id: req.params._id }, function (err, track) {
      if(err) return utils.error(res, 403, err);
      console.log(track);

      track.title = req.body.title;
      track.artist = req.body.artist;
      track.album = req.body.album;

      track.save(function (err) {
        if(err) console.log(err);
        res.json(track || {});
      });
    });
  },
  
  }
}
