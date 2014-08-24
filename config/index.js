var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , env = process.env.NODE_ENV || 'development'
  , port = 8000

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'echo-api'
    },
    port: port,
    db: 'mongodb://0.0.0.0:27017/db-development',
  },

  production: {
    root: rootPath,
    app: {
      name: 'echo-api'
    },
    port: port,
    db: 'mongodb://localhost/db-production',
  }
};

module.exports = config[env];
