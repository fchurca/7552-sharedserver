/*istanbul ignore next*/

var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));
router.use('/servers', require('./servers'));
router.use('/business-users', require('./business-users'));
router.use('/rules', require('./rules'));
router.use('/trips', require('./trips'));
router.use('/token', require('./token'));

// API Version
var apiVersion = '1.0';
exports.apiVersion = apiVersion;

exports.isEmpty = function(value) {
  return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}


// always return router
module.exports = router;