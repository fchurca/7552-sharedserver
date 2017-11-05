"use strict";
/*istanbul ignore next*/

var Sequelize = require("sequelize");

/**
 *  Define la estructura de datos de una rule
 *
 */

module.exports = function(sequelize, DataTypes) {
  var Rule = sequelize.define("rule", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true // from 1 onwards
    },
    _ref: {
      type: Sequelize.STRING
    },
    language: {
      type: Sequelize.STRING
    },
    blob: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN
    }    
  }, {
    timestamps: false
  });
  
  return Rule;
};