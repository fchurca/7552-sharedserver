var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
var BusinessUser = require('../models/businessuser.js');
var Server = require('../routes/servers.js');

var Verify = require('./verify');

// CREATE TABLE businessusers(id INT PRIMARY KEY, _ref VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40));


/**
 * Test method to empty the business users database and create a dummy business user in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development'
 * 
 * PRE: process.env.ENV_NODE has 'development' value
 */
router.get('/initAndWriteDummyBusinessUser', function(request, response) {
	// Test code: dummy register and table initialization:
	// force: true will drop the table if it already exists
	// It is only available in development environment
	if (process.env.NODE_ENV === 'development'){
		BusinessUser.sync({force: true}).then(() => {
		  // Table created
		  
		  var dummyBusinessUser = {
			id: 0,
			username: 'johnny',
			password: 'aaa',
			name: 'John',
			surname: 'Hancock',
			roles: ['admin', 'manager', 'user']
		  };
		  BusinessUser.create(dummyBusinessUser)
		  .then(() => {
			return response.status(200).json(dummyBusinessUser);
		  })
		  .catch(error => {
			  return response.status(500).json({code: 0, message: "Unexpected error while trying to create new dummy user for testing."});
			// mhhh, wth!
		  })
		  
		})
	}
});

/**
 *  Devuelve toda la información acerca de los usuarios de negocio indicados.
 *
 */ 

router.get('/', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
	BusinessUser.findAll({
		attributes: ['id', '_ref', 'username', 'password', 'name', 'surname', 'roles']
		}).then(businessusers => {
	    if (!businessusers) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }
		return response.status(200).json(businessusers);
	});
});

/**
 *  Da de alta un usuario de negocio.
 *
 */

router.post('/', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
	Server.usernameExists(request.body.username, function(res, next) {
		if (res) {
			return response.status(400).json({code: 0, message: "Existe un servidor con este nombre de usuario"});
		}

		console.log("Before creating a businessuser - username doesn't exist in server table");
			BusinessUser.create({
			id: request.body.id,
			username: request.body.username,
			password: request.body.password,
			name: request.body.name,
			surname: request.body.surname,
			roles: request.body.roles
		}).then(businessuser => {
			if (!businessuser) {
			  return response.status(500).json({code: 0, message: "Unexpected error"});
			}
			response.status(201).json(businessuser);
		});
	});	
});

/**
 *  Da de baja un usuario de negocio.
 *
 */
router.delete('/:businessuserId', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
  BusinessUser.destroy({
    where: {
      id: request.params.businessuserId
    }
  }).then(affectedRows => {
    if (affectedRows == 0) {
      return response.status(500).json({code: 0, message: "Unexpected error: didn't find target user"});
    }

    BusinessUser.findAll({ // must return all businessusers
		attributes: ['id', '_ref', 'username', 'password', 'name', 'surname', 'roles']
    })
    .then(users => {
      if (!users) {
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      return response.status(204).json(users);
    });
  });
});

module.exports = router;

/**
 * Method to clean the business users table
**/
function clearBusinessUsersTable() {
	return new Promise(
	  function (resolve, reject) {
		BusinessUser.destroy({
		where: {},
		truncate: true
		})
		.then(affectedRows => {
		  if (affectedRows == 0) {
			// database was already empty
		  }
		  resolve(true);
		})
		// .catch(reject(false));
	});
}

module.exports.clearBusinessUsersTable = clearBusinessUsersTable;