/*istanbul ignore next*/

//! @file index.js
//! Starts the app

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static(__dirname + '/public'));

// winston logger
var logger = require('./utils/logger');

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Load any undefined ENV variables form a specified file. 
var env = require('node-env-file');
  env(__dirname + '/.env');

// Get environment variables from config file is as follows...
var path = require("path");
var environment = process.env.NODE_ENV || "development"; // default is development
var config = require(path.join(__dirname, 'config', 'config.json'))[environment];

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/users', function(request, response) {
  response.render('pages/users');
});

app.get('/businessusers', function(request, response) {
  response.render('pages/businessusers');
});

app.get('/appservers', function(request, response) {
  response.render('pages/appservers');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes
app.use('/api', require('./routes/api'));

// starts server
app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// --------------------------------------------------------------------------
// Sequelize Module: Instantiation and connection to Database 
var pg = require('pg');
const sequelize = require('./models/db');
// --------------------------------------------------------------------------

/**
 * Returns "Hello World!" in order to test Coveralls
 *
 * @return {string}
 */
function getStringToPrint() {
  return "Hello World!";
}
 
console.log(getStringToPrint());
 
module.exports = { getStringToPrint: getStringToPrint };