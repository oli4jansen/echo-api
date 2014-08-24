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
  app.get('/tracks/sync', t.sync)
  app.get('/tracks/test-sync', t.testSync)
  app.get('/tracks/:id/info', t.info)
  app.get('/tracks/:id', t.stream)

  app.get('/search/:query', s.search)
  
  // catch-all
  app.get('*', function (req, res) { res.status(404).json({ error:'Invalid GET request' }) })
  app.post('*', function (req, res) { res.status(404).json({ error:'Invalid POST request' }) })
  app.delete('*', function (req, res) { res.status(404).json({ error:'Invalid DELETE request' }) })
}