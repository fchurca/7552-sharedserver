"use strict";
/*istanbul ignore next*/

var Sequelize = require("sequelize");
//var sequelize = require("./db.js").sequelize;
//var Car = require("./car.js");

/**
 *  Define la estructura de datos de un usuario cliente de la aplicación android
 *  Usuarios de aplicación son típicamente pasajeros y conductores
 *
 */

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("user", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
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
    country: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    birthdate: {
      type: Sequelize.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Car, {
          foreignKey: 'userId',
          as: 'cars',
        });
      }
    }
  });
  
  return User;
};

 /*
const User = sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true
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
    country: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    birthdate: {
      type: Sequelize.STRING
    }
  });

User.associate = (models) => {
  User.hasMany(models.Car, {
    foreignKey: 'id',
    as: 'cars'
  });
};
  
module.exports = User;
//  return User;
//}

*/