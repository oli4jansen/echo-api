module.exports = function (db) {
  
  var ObjectId = require('mongoose').Types.ObjectId
  
  function error (res, code, msg) {
  	res.send(code, {
  		error: msg
  	})
  }
  
  return {
  
  /*
   * error()
   * - Wraps error message and delivers it to response
   */
  error: error,
  
}
}