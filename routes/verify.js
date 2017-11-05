var BusinessUser = require('../models/businessuser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('../config.js');

/**
 * Variable to track manually invalidated tokens
 * In javascript / nodeJS we can't initialize here statically these variables
**/
var invalidatedTokens;

/**
 * Method for token generation. It consumes token secret and token expiration time from env configuration.
**/
exports.getToken = function (payload) {
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	
    return jwt.sign(payload, process.env.TOKEN_SECRET_KEY,{
        expiresIn: parseInt(process.env.TOKEN_LIFETIME_IN_SECONDS) // 3600
    });
};

function isTokenInvalidated(token){
	
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	
	try {
		var decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		var username = decoded.username;
		console.log(Array.from(invalidatedTokens));
		console.log(username);
		if (invalidatedTokens.has(username)){
			var token_was_invalidated_before = false;
			var invalidTokensFromUser = invalidatedTokens.get(username);
			for (var aTokenIndex in invalidTokensFromUser) {
				// console.log('A token'+aToken);
				// console.log('A real token'+invalidTokensFromUser[aTokenIndex]);
				// console.log('Given token'+token);
				if (invalidTokensFromUser[aTokenIndex] === token){
					token_was_invalidated_before = true; // token is listed as invalid
				}
			}
			return token_was_invalidated_before;
		}
		else {
			return false; // username has no invalidated tokens
		} 
	} catch(err) {
		// console.log('############################################# TOKEN INVALID RIGHT AWAY!! #############################################');
		return true; // token is not valid right away
	}
};

exports.invalidateToken = function(token){
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	jwt.verify(token, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
            if (err) {
				// token is not valid right away
			}
			else {
				console.log('INVALIDATING TOKEN: ' + token);
				// invalidatedTokens.set(decoded.username, token);
				if (invalidatedTokens.has(decoded.username)){
					invalidatedTokens.get(decoded.username).push(token);
				}
				else{
					invalidatedTokens.set(decoded.username, new Array(token));
				}
			}
	});
};

/**
 * Verifies the token existance in the request body, the request query or the request header
 * The information from the token is extracted and saved in the request itself, in the field decoded, to pass the request to the next middleware calls
**/
exports.verifyToken = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers[process.env.TOKEN_HEADER_FLAG];

	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	
    // decode token
    if (token) {
		
		// Has the token been previously excluded?
		if (isTokenInvalidated(token)){
			var err = new Error('Token was invalidated or is not valid!');
			err.status = 401; // in this cases 403 is also used, API specified 401
			return next(err);
		}
		else {
			// verifies secret and checks exp
			jwt.verify(token, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
				if (err) {
					console.log('TOKEN VERIFICATION ERROR: '+JSON.stringify(err));
					var errorMessage = JSON.stringify(err);
					var err = new Error('You are not authenticated! '+errorMessage);
					err.status = 401;
					return next(err);
				} else {
					// if everything is good, save to request for use in other routes
					// this method assures that TOKEN exists and it's signature is from this server
					// ... and stores the info from the token in the decoded variable 
					req.decoded = decoded;
					next();
				}
			});
		}
    } else {
        // if there is no token or the signature is not from this application or token has been adulterated
        // return an error
        var err = new Error('No token provided!');
        err.status = 401; // in this cases 403 is also used, API specified 401
        return next(err);
    }
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable userOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyUserRole = function (req, res, next) {
	var userOk = req.decoded.userOk;
	
	if (userOk){
		return next();
	}
	else{
		var err = new Error('No BUSINESS USER privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable appOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	if (appOk){
		return next();
	}
	else{
		var err = new Error('No APP privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable mangerOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyManagerRole = function (req, res, next) {
	var managerOk = req.decoded.managerOk;
	
	if (managerOk){
		return next();
	}
	else{
		var err = new Error('No MANAGER privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable adminOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyAdminRole = function (req, res, next) {
	var adminOk = req.decoded.adminOk;
	
	if (adminOk){
		return next();
	}
	else{
		var err = new Error('No ADMIN privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable userOk OR the variable appOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyUserOrAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	var userOk = req.decoded.userOk;
	
	if (appOk || userOk){
		return next();
	}
	else{
		var err = new Error('No USER or APP privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

exports.verifyManagerOrAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	var managerOk = req.decoded.managerOk;
	
	if (appOk || managerOk){
		return next();
	}
	else{
		var err = new Error('No MANAGER or APP privileges for this user!');
		err.status = 401;
		return next(err);
	}
};