"use strict";
/*istanbul ignore next*/

var Sequelize = require("sequelize");
//var sequelize = require("./db.js").sequelize;
//var User = require("./user.js");

module.exports = function(sequelize, DataTypes) {
  var Car = sequelize.define("car", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true // from 1 onwards
    },
    _ref: {
      type: Sequelize.STRING,
    },
    owner: {
      type: Sequelize.INTEGER, // the id of the owner of the car
      allowNull: false
    },
    properties: {
      type: Sequelize.ARRAY(Sequelize.JSON)
    }
  }, {
    timestamps: false
  }, {
    classMethods: {
      associate: function(models) {
        Car.belongsTo(models.User);
      }
    }
  });
  
  return Car;
};

/**
 *  Define la estructura del auto que puede tener un usuario de aplicación con type 'conductor'
 *
 */

 /*
const Car = sequelize.define('car', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true
    },
    _ref: {
      type: Sequelize.STRING,
    },
    owner: {
      type: Sequelize.STRING // owner is the id of the owner of the car
    },
    properties: {
      type: Sequelize.ARRAY(Sequelize.JSON)
    }
  }, {
    timestamps: false
});

Car.associate = (models) => {
  Car.belongsTo(User, {
    foreignKey: 'id',
    onDelete: 'CASCADE'
  });
};
  
module.exports = Car;
*/


