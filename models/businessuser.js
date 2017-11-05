'use strict';
/*istanbul ignore next*/

var Sequelize = require("sequelize");
//var sequelize = require("./db.js").sequelize;

/**
 *  Define estructura de datos de usuario de negocio 'BusinessUser'
 *  Un business user tiene al menos uno y como máximo 3 de estos roles:
 *  - admin
 *  - manager
 *  - user
 *  
 *  Los tres roles corresponden a niveles de acceso para administración del shared server y bases de datos
 */


module.exports = function(sequelize, DataTypes) {
  var BusinessUser = sequelize.define("businessuser", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true // from 1 onwards
    },
    _ref: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    surname: {
      type: Sequelize.STRING
    },
    roles: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false
    }
  }, {
    timestamps: false
  });
 
  return BusinessUser;
};

/*
const BusinessUser = sequelize.define('businessuser', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true,
		unique: true
    },
    _ref: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.STRING,
	  unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    surname: {
      type: Sequelize.STRING
    },
	  roles: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false
	  }
  }, {
    timestamps: false
});
  
module.exports = BusinessUser;

*/