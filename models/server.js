var Sequelize = require("sequelize");
var sequelize = require("./db.js").sequelize;

const Server = sequelize.define('server', {
    id: {
      type: Sequelize.STRING,
	  primaryKey: true
    },
    username: { // field automatically added otherwise by passport-local-sequelize
        type: Sequelize.STRING,
        unique: true
	},
	password: { // field automatically added otherwise by passport-local-sequelize
		type: Sequelize.STRING
	},
    _ref: {
      type: Sequelize.STRING
    },
    createdBy: {
      type: Sequelize.INTEGER
    },
    createdTime: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    lastConnection: {
      type: Sequelize.INTEGER
    }
  });
  
module.exports = Server;