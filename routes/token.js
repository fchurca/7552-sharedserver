var express = require('express');
var router = express.Router();
var verify = require('./verify');
var api = require('./api');

var BusinessUsers = require('../models/businessuser');
/** 
 * This endpoint creates a new token and sends it to the user if the username and password provided are valid
**/
router.post('/', function (request, response){
	var localUsername = request.body.BusinessUserCredentials.username;
	var localPassword = request.body.BusinessUserCredentials.password;
	var token_lifetime = process.env.TOKEN_LIFETIME_IN_SECONDS;
	
	BusinessUsers.find({
		where: {
			username: localUsername
		}
	})
	.then( function(businessUser){
		if (!businessUser){
			
			/// \todo
			// **************************************************************************************
			// Here we should check if the username corresponds to a SERVER instead of a businessuser
			// Copié este código de abajo, fijate si te sirve de referencia... no pude con mi genio, lo vi que era igual al de abajo.
			/*
			BusinessUsers.find({
				where: {
					username: localUsername
				}
			})
			.then( function(appUserName){
				var payload = {
					 username: appUserName,
					 userOk: false,
					 appOk: true,
					 managerOk: false,
					 adminOk: false
				};
				var localToken = verify.getToken(payload);
				response.writeHead(201, {"Content-Type": "application/json"});
				var responseJson = JSON.stringify({
					metadata: {version: api.apiVersion},
					token: {
						expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
						token: localToken
					}
				});
				return response.end(responseJson);
			})
			.catch( function(error){
				return response.status(404).json({code: 0, message: "Username does not exist in the database or missing username to get token: " + error});
				console.log('Username wich does not exist was used to attem log in');
			});
			*/
			// **************************************************************************************
			
			
		}
		else {
			// console.log(businessUser);
			if (businessUser.password != localPassword){
				return response.status(401).json({code: 0, message: "Username's password is incorrect"});
				console.log('Incorrect password at user log in attemp');
			}
			else {
				// console.log('User ', businessUser.username, 'logged successfully');
				// This attributes are read from local database, not from incoming data from the user
				var adminOk = businessUser.roles.indexOf(process.env.TAG_ADMIN) !== -1;
				var managerOk = businessUser.roles.indexOf(process.env.TAG_MANAGER) !== -1;
				var appOk = businessUser.roles.indexOf(process.env.TAG_APP) !== -1;
				var userOk = businessUser.roles.indexOf(process.env.TAG_USER) !== -1;
				var payload = {
					 username: businessUser.username,
					 userOk: userOk,
					 appOk: appOk, // normally it would be false to business users
					 managerOk: managerOk,
					 adminOk: adminOk
				};
				var localToken = verify.getToken(payload);
				response.writeHead(201, {"Content-Type": "application/json"});
				var responseJson = JSON.stringify({
					metadata: {version: api.apiVersion},
					token: {
						expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
						token: localToken
					}
				});
				return response.end(responseJson);
			}
		}
	});
});

module.exports = router;