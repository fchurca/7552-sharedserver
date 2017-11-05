//! @file business-users.js
//! Describes endpoints for business-users

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var api = require('./api.js');

var models = require('../models/db'); // loads db.js
var BusinessUser = models.businessuser; 

var Verify = require('./verify');

// CREATE TABLE businessusers(id SERIAL PRIMARY KEY, _ref VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40), roles TEXT[]);

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
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
		BusinessUser.sync({force: true}).then(() => {
			// Table created

			var dummyBusinessUser = {
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
			});		  
		});
	} else {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
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
		/* istanbul ignore if  */
	    if (!businessusers) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }

		var userArray = [];
		businessusers.forEach(function(item) {
			var jsonUser = {
				id: item.id,
			    _ref: item._ref,
			    username: item.username,
			    password: item.password,
			    name: item.name,
			    surname: item.surname,
			    roles: item.roles
			}
		    userArray.push(jsonUser);
		});

	    var jsonInResponse = {
			metadata: {
				version: api.apiVersion // falta completar
			},
			businessUser: userArray
		};
		return response.status(200).json(jsonInResponse);
	});
});

/**
 *  Da de alta un usuario de negocio.
 *
 */
router.post('/', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
	// si hay algún parámetro faltante
	if (api.isEmpty(request.body.username) || api.isEmpty(request.body.password) || api.isEmpty(request.body.name)
		|| api.isEmpty(request.body.surname) || api.isEmpty(request.body.roles)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}

	BusinessUser.create({
		username: request.body.username,
		password: request.body.password,
		name: request.body.name,
		surname: request.body.surname,
		roles: request.body.roles
	}).then(businessuser => {
		if (!businessuser) {
			/* istanbul ignore next  */
			return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		var jsonInResponse = {
			metadata: {
				version: api.apiVersion
			},
			businessUser: {
				id: businessuser.id,
			    _ref: businessuser._ref,
			    username: businessuser.username,
			    password: businessuser.password,
			    name: businessuser.name,
			    surname: businessuser.surname,
			    roles: businessuser.roles
			}
		};
		return response.status(201).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
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
			return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
		return response.status(204).json({});
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
  	});
});

/**
 *  Modifica los datos de un usuario de negocio.
 *
 */
router.put('/:businessuserId', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
	// si hay algún parámetro faltante
	if (api.isEmpty(request.body.username) || api.isEmpty(request.body.password) || api.isEmpty(request.body.name)
		|| api.isEmpty(request.body.surname) || api.isEmpty(request.body.roles)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}

	BusinessUser.find({
		where: {
			id: request.params.businessuserId
		}
	}).then(businessuser => {
		if (businessuser) {
			businessuser.updateAttributes({
				username: request.body.username,
				password: request.body.password,
			    name: request.body.name,
			    surname: request.body.surname,
			    roles: request.body.roles
			}).then(updatedUser => {
				var jsonInResponse = {
					metadata: {
						version: api.apiVersion
					},
					businessUser: {
						id: updatedUser.id,
					    _ref: updatedUser._ref,
					    username: updatedUser.username,
					    password: updatedUser.password,
					    name: updatedUser.name,
					    surname: updatedUser.surname,
					    roles: updatedUser.roles
					}
				};
				return response.status(200).json(jsonInResponse);
			});
		} else {
			return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Devuelve toda la información del usuario de negocio.
 *
 */
router.get('/:businessuserId', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	BusinessUser.find({
		where: {
			id: request.params.businessuserId
		}
	}).then(businessuser => {
		if (!businessuser) {
			return response.status(404).json({code: 0, message: "User inexistente"});
		}
		var jsonInResponse = {
			metadata: {
				version: api.apiVersion
			},
			businessUser: {
				id: businessuser.id,
			    _ref: businessuser._ref,
			    username: businessuser.username,
			    password: businessuser.password,
			    name: businessuser.name,
			    surname: businessuser.surname,
			    roles: businessuser.roles
			}
		};
		return response.status(200).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Obtiene información del usuario de negocio conectado.
 *
 */
router.get('/me', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	console.log(request.body + ' is the body \n');
	console.log(request.decoded.username + '\n\n\n');

	var username = request.decoded.username; // or request?
	BusinessUser.find({
		where: {
			username: username
		}
	}).then(businessuser => {
		if (businessuser) {
			var jsonInResponse = {
				metadata: {
					version: api.apiVersion
				},
				businessUser: {
					id: businessuser.id,
				    _ref: businessuser._ref,
				    username: businessuser.username,
				    password: businessuser.password,
				    name: businessuser.name,
				    surname: businessuser.surname,
				    roles: businessuser.roles
				}
			};
			return response.status(200).json(jsonInResponse);
		} else {
			console.log("LLEGA ACÁ \n\n\n");
			return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 *  Modificación de los datos del usuario de negocio conectado.
 *
 */
router.put('/me', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	var username = request.decoded.username;
	BusinessUser.find({
		where: {
			username: username
		}
	}).then(businessuser => {
		if (businessuser) {
			// we don't update roles here
			businessuser.updateAttributes({
				username: request.body.username,
				password: request.body.password,
				name: request.body.name,
				surname: request.body.surname
			}).then(updatedUser => {
				var jsonInResponse = {
					metadata: {
						version: api.apiVersion
					},
					businessUser: {
						id: updatedUser.id,
					    _ref: updatedUser._ref,
					    username: updatedUser.username,
					    password: updatedUser.password,
					    name: updatedUser.name,
					    surname: updatedUser.surname,
					    roles: updatedUser.roles
					}
				};
				return response.status(200).json(jsonInResponse);
			  })
			  .catch(error => {
			  	/* istanbul ignore next  */
				return response.status(500).json({code: 0, message: "Unexpected error while trying to update business user by itself (/me)."});
				// mhhh, wth!
			  })
		} else {
			return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
	});
});

module.exports = router;

/**
 * This method clears the businessusers database, leaving blank the businessusers table
 *
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
	}).catch(function () {
		console.log("Promise Rejected");
	});;
}

module.exports.clearBusinessUsersTable = clearBusinessUsersTable;