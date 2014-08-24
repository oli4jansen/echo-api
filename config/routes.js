module.exports = function (app, http, db, fs, async) {
  
  var utils = require('../app/lib/utils')(db),
  id3 = require('id3js')
  
  function route(name, other) {
    return require('../app/controllers/'+name)(db, utils, other)
  }
  
  var t = route('tracks', {fs:fs,id3:id3,async:async})
  var s = route('search', {fs:fs,id3:id3,async:async})

  // Tracks
  app.get('/tracks', t.list)
  app.get('/tracks/clear', t.clear)
  app.get('/tracks/sync', t.sync)
  app.get('/tracks/:_id/info', t.info)
  app.get('/tracks/:_id', t.stream)
  app.put('/tracks/:_id', t.update)

  app.get('/search/:query', s.search)
  
  // catch-all
  app.get('*', function (req, res) { res.status(404).json({ error:'Invalid GET request' }) })
  app.post('*', function (req, res) { res.status(404).json({ error:'Invalid POST request' }) })
  app.delete('*', function (req, res) { res.status(404).json({ error:'Invalid DELETE request' }) })
}