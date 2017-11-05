"use strict";
/*istanbul ignore next*/

// Sequelize Module: Instantiation and connection to Database 
var pg = require('pg');
const Sequelize = require('sequelize'); // class: starts with mayus S

// Get environment variables from config file is as follows...
var path = require('path');
var environment = process.env.NODE_ENV || "development"; // default is development
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[environment];

var fs        = require('fs');
var basename  = path.basename(module.filename);

/**
 *  Database initialization with Sequelize ORM over postgresql
 */
const sequelize = new Sequelize(config.DATABASE, config.DATABASE_USER, config.DATABASE_PASS, {
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  dialect: config.DATABASE_DIALECT,
  // freezeTableName: true, //prevent sequelize from pluralizing table names
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialectOptions: {
    ssl: true
  }
});

var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "db.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
    console.log(model.name);
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

/**
 *  Sequelize authentication method
 */
sequelize.authenticate()
    .then(function(err) {
        if (err) {
            // Error logging into the Database
            console.log('Unable to connect to the PostgreSQL database:', err);
        } else {
            // Databese connection successful
            console.log('Sequelize Module: Connection to Database has been established successfully.');
        }
    });



//module.exports.sequelize = sequelize;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;