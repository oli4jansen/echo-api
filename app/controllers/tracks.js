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
      db.Track.find({}, 'id', function (err, tracks) {

        // Only keep the track IDs/filenames in the array
        var tracksDatabase = [];
        tracks.forEach(function (track) {
          tracksDatabase.push(track.id);
        });

        // Calculate the difference (= the tracks that are missing in the database)
        var tracksNotInDatabase = tracksFileSystem.diff( tracksDatabase );

        var calls = [];
        var tracksToSaveToDatabase = [];

        // Get metadata for each track
        tracksNotInDatabase.forEach(function (track) {
          calls.push(function (callback) {
            id3({ file: musicFolder+track, type: id3.OPEN_LOCAL }, function(err, tags) {
              console.log(tags);
              if(err) {
                console.log(err);
              }else{
                tracksToSaveToDatabase.push({
                  id: track,
                  title: tags.title,
                  artist: tags.artist,
                  album: tags.album,
                  plays: 0
                });
              }
              callback(null, track);
            });
          })
        });

        // When all metadata is collected, we can save it to the database
        async.parallel(calls, function(err, result) {
          if (err) return utils.error(res, 500, err)
          db.Track.create(tracksToSaveToDatabase, function (err) {
            if (err) return utils.error(res, 500, err)
            res.json(tracksToSaveToDatabase || [])
          });
        });
      });
    })
  },

  /*
   * Sync Database
   */
  testSync: function (req, res) {
    // Get all tracks in the music folder
    fs.readdir(musicFolder, function (err, tracksFileSystem) {
      if(err) return utils.error(res, 500, err)


      id3({ file: musicFolder+tracksFileSystem[0], type: id3.OPEN_LOCAL }, function(err, tags) {
        console.log(tags);
        if(err) {
          console.log(err);
        }
      });
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
    if(!req.params.id) return utils.error(res, 403, 'Requires a track ID')

    db.Track.find({ id: req.params.id }, function (err, tracks) {
      var output = [];
      var calls = [];

      tracks.forEach(function (track) {
        calls.push(function (callback) {
          id3({ file: musicFolder+track.id, type: id3.OPEN_LOCAL }, function(err, tags) {
            tags.id = track.id
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
    res.sendfile(musicFolder+req.params.id);

    db.Track.findOne({ id: req.params.id }, function (err, track) {
      if(err) return;
      track.plays++;
      track.save(function (err) {
        if(err) console.log(err);
      });
    });
  },
  
  }
}
