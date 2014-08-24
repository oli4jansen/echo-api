var express = require('express')
  , os = require('os')
  , interfaces = os.networkInterfaces()
  , addrs = []
  
// Set config.host ip
for (k in interfaces) {
  for (k2 in interfaces[k]) {
    var address = interfaces[k][k2]
    if(address.family == 'IPv4' && !address.internal)
      addrs.push(address.address)
  }
}

module.exports = function (app, config) {
 
  config.host = addrs.pop()

  // API session store
  var MongoStore = require('connect-mongo')(express)

  // Set app vars
  app.set('port', config.port);

  // Configure API environment
  app.configure(function () {
    app.use(express.compress())
    app.use(express.logger('dev'))
    app.use(express.json({ limit:'10mb' }))
    app.use(express.urlencoded({ limit:'10mb' }))
    app.use(express.cookieParser())
    app.use(express.methodOverride())
    app.use(express.static(config.root + '/public'))
    app.use(express.favicon(config.root + '/public/img/favicon.ico'))
    app.use(app.router)
    app.use(function (req, res) {
      res.send('404')
    })
  })

  // CORS support
  app.all('*', function (req, res, next) {
    if (!req.get('Origin')) return next();
    // use "*" here to accept any origin
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.set('Access-Control-Allow-Credentials', 'true');
    // res.set('Access-Control-Allow-Max-Age', 3600);
    if ('OPTIONS' == req.method) return res.send(200);
    next();
  })
}