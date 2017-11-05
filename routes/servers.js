//! @file servers.js
//! Describes endpoints for servers

var express = require('express');
var router = express.Router();
// var router = express();

const Sequelize = require('sequelize');
//var Server = require('../models/server.js');

var models = require('../models/db'); // loads db.js
var Server = models.server;       // the model keyed by its name

var Verify = require('./verify');
var api = require('./api');

// CREATE TABLE servers(id VARCHAR(10) PRIMARY KEY, _ref VARCHAR(40), createdBy INT, createdTime VARCHAR(40), name VARCHAR(40), lastConnection INT);

/**
 * Test method to empty the servers database and create a dummy app server in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development'
 * 
 * PRE: process.env.ENV_NODE has 'development' value
 */
router.get('/initAndWriteDummyServer', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  /* istanbul ignore else  */
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
	  Server.sync({force: true}).then(() => {
		// Table created
		
		var dummyServer = {
		id: 0,
		username: 'myDummyAppServer',
		password: 'aaa',
		_ref: 'abc',
		createdBy: 66,
		createdTime: 'abc',
		name: 'DummyServer',
		lastConnection: 2
		};
		
		Server.create(dummyServer)
		.then(() => {
			
			var payload = {
				username: dummyServer.username,
				userOk: false,
				appOk: true,
				managerOk: false,
				adminOk: false
			};
			var token = Verify.getToken(payload);
			var responseJson = {
				server: dummyServer,
				serverToken: token
			}
			return response.status(200).json(responseJson);
			}).catch(error => {
			  	/* istanbul ignore next  */
				return response.status(500).json({code: 0, message: "Unexpected error while trying to create new dummy server for testing."});
				// mhhh, wth!
			});
	    });
	} else {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
	}
});

/**
 *  Devuelve toda la información acerca de todos los application servers indicados.
 *
 */
router.get('/', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	Server.findAll({
		attributes: ['id', 'username', 'password', '_ref', 'createdBy', 'createdTime', 'name', 'lastConnection']
	}).then(servers => {
		/* istanbul ignore if  */
		if (!servers) {
			return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		return response.status(200).json(servers);
	})
});

/**
 *  Da de alta un server.
 *  Se ignorarán los campos de id, _ref y lastConnection.
 *
 */
router.post('/', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	// si hay algún parámetro faltante
	if (api.isEmpty(request.body.id) || api.isEmpty(request.body._ref) || api.isEmpty(request.body.createdBy)
		|| api.isEmpty(request.body.createdTime) || api.isEmpty(request.body.name)
		|| api.isEmpty(request.body.lastConnection)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}

	Server.create({
		id: request.body.id,
		_ref: request.body._ref,
		createdBy: request.body.createdBy,
		createdTime: request.body.createdTime,
		name: request.body.name,
		lastConnection: request.body.lastConnection,
		username: request.body.username,
		password: request.body.password
	}).then(server => {
		/* istanbul ignore if  */
		if (!server) {
			return response.status(500).json({code: 0, message: "Unexpected error"});
		} else {
			// Now we generate and return a new fresh token with full lifetime length from now
			var payload = {
				username: request.decoded.username,
				userOk: request.decoded.userOk,
				appOk: request.decoded.appOk, // normally it would be false to business users
				managerOk: request.decoded.managerOk,
				adminOk: request.decoded.adminOk
			};
			var newToken = Verify.getToken(payload);
			var jsonInResponse = {
				metadata: {version: api.apiVersion},
				server: {
					server: {
						id: server.id,
						_ref: '',
						createdBy: request.body.createdBy,
						createdTime: (new Date).getTime(),
						name: request.body.name,
						lastConnection: 0
					},
					token: {
						expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
						token: newToken
					}
				}
			};
			return response.status(201).json(jsonInResponse);
		}
	});
});

/**
 * Endpoint que utiliza un servidor para dar señales de vida. 
 * Esto tambien se usa para renovar el token de acceso. 
 * El token devuelto podría ser el mismo que el enviado, pero si difieren, el anterior debería ser invalidado.
 *
 */
router.post('/ping', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	Server.findOne({
		where: {
		  username: request.decoded.username
		}
	}).then(server => {
		if (server) {
			// First we add the incoming token to invalid token list
			// This method also eliminates expired tokens
			var oldToken = request.body.token || request.query.token || request.headers[process.env.TOKEN_HEADER_FLAG];

			// Now we generate and return a new fresh token with full lifetime length from now
			var payload = {
				 username: request.decoded.username,
				 userOk: request.decoded.userOk,
				 appOk: request.decoded.appOk, // normally it would be false to business users
				 managerOk: request.decoded.managerOk,
				 adminOk: request.decoded.adminOk
			};
			var newToken = Verify.getToken(payload);
			
			if (newToken != oldToken){
				// elemntal!! We only invalidate token if newToken is different from oldToken...
				Verify.invalidateToken(oldToken);
			}
			
			response.writeHead(200, {"Content-Type": "application/json"});
			var responseJson = JSON.stringify({
				metadata: {version: api.apiVersion},
				ping: {
					server: {
						id: server.Id,
						_ref: server._ref,
						createdBy: server.createdBy,
						createdTime: server.createdTime,
						name: server.name,
						lastConnection: server.lastConnection
					},
					token: {
						expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
						token: newToken
					}
				}
			});
			return response.end(responseJson);
		} else {
			/* istanbul ignore next  */
			return response.status(500).json({code: 0, message: "Username does not exist"});
		}
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error at PING: username not found. Error: "+error});
    });
});

/**
 *  Modifica los datos de un servidor.
 *
 */
router.put('/:serverId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	// si hay algún parámetro faltante
	if (api.isEmpty(request.body.id) || api.isEmpty(request.body._ref) || api.isEmpty(request.body.createdBy)
		|| api.isEmpty(request.body.createdTime) || api.isEmpty(request.body.name)
		|| api.isEmpty(request.body.lastConnection)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}

	Server.find({
		where: {
			id: request.params.serverId
		}
	}).then(server => {
		if (server) {
			server.updateAttributes({
			    id: request.body.id,
			    _ref: request.body._ref,
			    createdBy: request.body.createdBy,
			    createdTime: request.body.createdTime,
			    name: request.body.name,
			    lastConnection: request.body.lastConnection
			}).then(updatedServer => {
				var jsonInResponse = {
					metadata: {
						version: api.apiVersion
					},
					server: {
						id: updatedServer.id,
					    _ref: updatedServer._ref,
					    createdBy: updatedServer.createdBy,
					    createdTime: 0,
					    name: updatedServer.name,
					    lastConnection: 0
					}
				};
		    	return response.status(200).json(jsonInResponse); // TODO Cuidado que esto devuelve solo el id del server
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
 *  Da de baja un servidor.
 *
 */
router.delete('/:serverId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	Server.destroy({
		where: {
			id: request.params.serverId
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
 *  Devuelve toda la información del servidor.
 *
 */
router.get('/:serverId', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	Server.find({
		where: {
			id: request.params.serverId
		}
	}).then(server => {
		if (!server) {
			return response.status(404).json({code: 0, message: "Servidor inexistente"});
		}
		var jsonInResponse = {
			metadata: {
				version: api.apiVersion
			},
			server: {
				id: server.id,
			    _ref: server._ref,
			    createdBy: server.createdBy,
			    createdTime: 0,
			    name: server.name,
			    lastConnection: 0
			}
		};
		return response.status(200).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

/**
 * Resetear un token de un servidor
 * Endpoint para resetear el token. Debe invalidar el anterior.
 *
 */
router.post('/:serverId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
	Server.find({
		where: {
			id: request.params.serverId
		}
	}).then(server => {
		/* istanbul ignore if  */
		if (!server) {
			return response.status(500).json({code: 0, message: "Unexpected error"});
		}

		// var oldToken = request.body.token || request.query.token || request.headers[process.env.TOKEN_HEADER_FLAG];
		// Verify.invalidateToken(oldToken);

		// Now we generate and return a new fresh token with full lifetime length from now
		var payload = {
			username: request.decoded.username,
			userOk: request.decoded.userOk,
			appOk: request.decoded.appOk, // normally it would be false to business users
			managerOk: request.decoded.managerOk,
			adminOk: request.decoded.adminOk
		};
		var newToken = Verify.getToken(payload);

		var responseJson = {
			metadata: {version: api.apiVersion},
			server: {
				server: {
					server: {
						id: server.id,
					    _ref: server._ref,
					    createdBy: server.createdBy,
					    createdTime: 0,
					    name: server.name,
					    lastConnection: 0
					}
				},
				token: {
					expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
					token: newToken
				}
			}
		};
		return response.status(200).json(responseJson);
	});
});

module.exports = router;

/**
 *  This method clears the servers database, leaving blank the servers table
 */
function clearServersTable(){
	return new Promise(
	  function (resolve, reject) {
		Server.destroy({
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

module.exports.clearServersTable = clearServersTable;