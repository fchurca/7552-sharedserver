//! @file users.js
//! Describes endpoints for users

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var models = require('../models/db'); // loads db.js
var User = models.user;
var Car = models.car;

var Verify = require('./verify');
var api = require('./api');

const request = require('request-promise'); // to hit facebook api

// CREATE TABLE users(id SERIAL PRIMARY KEY, _ref VARCHAR(20), applicationowner VARCHAR(20), type VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40), country VARCHAR(40), email VARCHAR(40), birthdate VARCHAR(20));

/**
 * Test method to empty the users database and create a dummy user in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development'
 * 
 * PRE: process.env.ENV_NODE has 'development' value
 */
router.get('/initAndWriteDummyUser', function(request, response) {
	// Test code: dummy register and table initialization:
	// force: true will drop the table if it already exists
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
		User.sync({force: true}).then(() => {
		  // Table created

      var dummyUser = {
        _ref: 'aaa',
        applicationowner: 'hi',
        type: 'conductor',
        username: 'johnny',
        password: 'aaa',
		facebookUserId: '',
        name: 'John',
        surname: 'Hancock',
        country: 'Argentina',
        email: 'johnny123@gmail.com',
        birthdate: '24/05/1992'
      };
		  User.create(dummyUser)
      .then(() => {
        return response.status(200).json(dummyUser);
      })
      .catch(error => {
        return response.status(500).json({code: 0, message: "Unexpected error while trying to create new dummy user for testing."});
      // mhhh, wth!
      })
		})
	}
	else {
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
	}
});

router.get('/dropUserTable', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    User.sync({force: true}).then(() => {
      return response.status(200).json({});
    }).catch(function (error) {
      /* istanbul ignore next  */
      return response.status(500).json({code: 0, message: "Unexpected error"});
    });
  }
});

router.get('/dropCarTable', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    Car.sync({force: true}).then(() => {
      return response.status(200).json({});
    }).catch(function (error) {
      /* istanbul ignore next  */
      return response.status(500).json({code: 0, message: "Unexpected error"});
    });
  }
});

/**
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */ 
router.get('/', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
	User.findAll({
    attributes: ['id', '_ref', 'applicationowner', 'type', 'username', 'name', 'surname', 'country', 'email', 'birthdate']
  }, { include: [ Car ]
  }).then(users => {
    /* istanbul ignore if  */
    if (!users) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    var userArray = [];
    users.forEach(function(item) {
      var jsonUser = {
        id: item.id,
        _ref: item._ref,
        applicationowner: item.applicationowner,
        type: item.type,
        username: item.username,
		facebookUserId: item.facebookUserId,
        name: item.name,
        surname: item.surname,
        country: item.country,
        email: item.email,
        birthdate: item.birthdate
      }
        userArray.push(jsonUser);
    });

    var jsonInResponse = {
      metadata: {
        version: api.apiVersion // falta completar
      },
      users: userArray
    };

		return response.status(200).json(jsonInResponse);
	})
});

/**
 *  Da de alta un usuario.
 *
 */
router.post('/', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  // si hay algún parámetro faltante
  /*
  if (api.isEmpty(request.body._ref) || api.isEmpty(request.body.type) || api.isEmpty(request.body.username)
    || api.isEmpty(request.body.password) || api.isEmpty(request.body.firstName) || api.isEmpty(request.body.lastName)
    || api.isEmpty(request.body.country) || api.isEmpty(request.body.email) || api.isEmpty(request.body.birthdate)) {
    return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
  }
  */
  
  // request has USERNAME && PASSWORD (local user)
  if (!api.isEmpty(request.body._ref) && !api.isEmpty(request.body.type) && !api.isEmpty(request.body.username) && !api.isEmpty(request.body.password)){
	  User.create({
		_ref: request.body._ref,
		type: request.body.type,
		username: request.body.username,
		password: request.body.password,
		facebookUserId: '',
		name: '', // request.body.firstName,
		surname: '', // request.body.lastName,
		country: '', // request.body.country,
		email: '', // request.body.email,
		birthdate: '', // request.body.birthdate
	  }).then(user => {
		/* istanbul ignore if  */
		if (!user) {
		  return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		var jsonInResponse = {
		  metadata: {
			version: api.apiVersion 
		  },
		  user: {
			id: user.id,
			_ref: user._ref,
			applicationowner: user.applicationowner,
			type: user.type,
			username: user.username,
			password: user.password,
			facebookUserId: '',
			name: '', // user.name,
			surname: '', // user.surname,
			country: '', // user.country,
			email: '', // user.email,
			birthdate: '', // user.birthdate
		  }
		};
		return response.status(201).json(jsonInResponse);
	  });
  }
  // request has FACEBOOK USER ID && FACEBOOK TOKEN (facebook user)
  else if (!api.isEmpty(request.body._ref) && !api.isEmpty(request.body.type) && !api.isEmpty(request.body.fb.userId) && !api.isEmpty(request.body.fb.authToken)) {
	  User.create({
		_ref: request.body._ref,
		type: request.body.type,
		username: '',
		password: '',
		facebookUserId: request.body.fb.userId,
		name: request.body.firstName,
		surname: request.body.lastName,
		country: request.body.country,
		email: request.body.email,
		birthdate: request.body.birthdate
	  }).then(user => {
		/* istanbul ignore if  */
		if (!user) {
		  return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		var jsonInResponse = {
		  metadata: {
			version: api.apiVersion 
		  },
		  user: {
			id: user.id,
			_ref: user._ref,
			applicationowner: user.applicationowner,
			type: user.type,
			username: '',
			password: '',
			facebookUserId: request.body.fb.userId,
			name: user.name,
			surname: user.surname,
			country: user.country,
			email: user.email,
			birthdate: user.birthdate
		  }
		};
		return response.status(201).json(jsonInResponse);
	  });
  }
  else {
	  return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes username/password ó fbUserId/fbToken)"});
  }
});

/**
 *  Valida las credenciales de un usuario de aplicación.   
 *
 */
router.post('/validate', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	if (!request.body.facebookAuthToken){
		// local username and password validation
		User.find({
			where: {
			  username: request.body.username,
			  password: request.body.password
			}
		}).then(userFound => {
			if (!userFound) {
				return response.status(400).json({code: 0, message: "Faltan parámetros o validación fallida de username/password"});
			}

			var jsonInResponse = {
			  metadata: {
				version: api.apiVersion
			  },
			  user: {
				id: userFound.id,
				_ref: userFound._ref,
				applicationowner: userFound.applicationowner,
				type: userFound.type,
				username: userFound.username,
				facebookUserId: userFound.facebookUserId,
				name: userFound.name,
				surname: userFound.surname,
				country: userFound.country,
				email: userFound.email,
				birthdate: userFound.birthdate
			  }
			};
			return response.status(200).json(jsonInResponse);
		})
		.catch(function (error) {
			return response.status(500).json({code: 0, message: "Unexpected error"});
		});
	} else {
		// Facebook user validation
		// 1st get Facebook User ID from Facebook Token
		// Check doc here: https://developers.facebook.com/docs/graph-api/reference/v2.10/debug_token/
		const options = {
			method: 'GET',
			uri: `https://graph.facebook.com/v2.10/debug_token?input_token==request.body.facebookAuthToken`,
			qs: {
			  access_token: request.body.facebookAuthToken // user_access_token
			}
		};
		request(options)
			.then(fbRes => {
				res.json(fbRes); // get user ID from here
				
				var facebookUserId = res.data.user_id;
				
				// const userFieldSet = 'id, name, about, email, accounts, link, is_verified, significant_other, relationship_status, website, picture, photos, feed';
				const userFieldSet = 'id, name, email';

				const options = {
					method: 'GET',
					uri: `https://graph.facebook.com/v2.10/facebookUserId`,
					qs: {
						access_token: request.body.facebookAuthToken, // user_access_token,
						fields: userFieldSet
					}
				};
				request(options)
				.then(fbRes => {
					res.json(fbRes);
				  
					var responseFacebookUserId = res.id;
					var responsefacebookName = res.name;
					var responsefacebookEmail = res.email;
				  
					User.find({
						where: {
							// username: facebookEmail
							facebookUserId: responseFacebookUserId
						}
					}).then(userFound => {
							if (!userFound) {
								return response.status(401).json({code: 0, message: "Facebook user was not registered in the system, create user account with this token"});
							}
							else {
								var jsonInResponse = {
									metadata: {
										version: api.apiVersion
									},
									user: {
										id: userFound.id,
										_ref: userFound._ref,
										applicationowner: userFound.applicationowner,
										type: userFound.type,
										username: userFound.username,
										facebookUserId: userFound.facebookUserId,
										name: userFound.name,
										surname: userFound.surname,
										country: userFound.country,
										email: userFound.email,
										birthdate: userFound.birthdate
									}
								};
								return response.status(200).json(jsonInResponse);
							}
						})
						.catch(function (error) {
							return response.status(401).json({code: 0, message: "Facebook Token provided was Unaothorized"});
						});
				})
				.catch(function (error) {
					return response.status(401).json({code: 0, message: "Facebook Token provided was Unaothorized"});
				});
				
				
			})
			.catch(function (error) {
				return response.status(401).json({code: 0, message: "Facebook Token provided was Unaothorized"});
			});
	}
});

/**
 *  Da de baja un usuario.
 *
 */
router.delete('/:userId', Verify.verifyToken, Verify.verifyManagerOrAppRole, function(request, response) {
  User.destroy({
    where: {
      id: request.params.userId
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
 *  Devuelve toda la información del usuario.
 *
 */
router.get('/:userId', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (!user) {
      return response.status(404).json({code: 0, message: "User inexistente"});
    }

    return response.status(200).json(user);
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Modifica los datos de un usuario.
 *
 */
router.put('/:userId', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  // si hay algún parámetro faltante
  if (api.isEmpty(request.body._ref) || api.isEmpty(request.body.type) || api.isEmpty(request.body.username)
    || api.isEmpty(request.body.password) || api.isEmpty(request.body.firstName) || api.isEmpty(request.body.lastName)
    || api.isEmpty(request.body.country) || api.isEmpty(request.body.email) || api.isEmpty(request.body.birthdate)) {
    return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
  }
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (user) {
      user.updateAttributes({
        _ref: request.body._ref,
        applicationowner: request.body.applicationowner,
        type: request.body.type,
        username: request.body.username,
        password: request.body.password,
		facebookUserId: request.body.facebookUserId,
        name: request.body.firstName,
        surname: request.body.lastName,
        country: request.body.country,
        email: request.body.email,
        birthdate: request.body.birthdate
      }).then(updatedUser => {
        return response.status(200).json(updatedUser);
      });
    } else {
      return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
    }
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

//CREATE TABLE cars(id SERIAL PRIMARY KEY, _ref VARCHAR(20), owner INT, properties jsonb[]);

/**
 *  Devuelve toda la información acerca de todos los autos del usuario.
 *
 */
router.get('/:userId/cars', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  Car.findAll({
    where: {
      owner: request.params.userId
    }
  }).then(carsFound => {
    var carArray = [];
    carsFound.forEach(function(item) {
      var jsonCar = {
        id: item.id,
        _ref: item._ref,
        owner: item.owner,
        properties: item.properties
      }
      carArray.push(jsonCar);
    });

    var jsonInResponse = {
      metadata: {
        version: api.apiVersion // falta completar
      },
      cars: carArray
    };
    return response.status(200).json(jsonInResponse); 
  }).catch(function (error) {
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Da de alta un auto de un usuario.
 *
 */
router.post('/:userId/cars', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  // TODO Verificar acá que cada json tenga name y value nada más, antes de meterlo a la base de datos
  // si hay algún parámetro faltante
  if (api.isEmpty(request.body.id) || api.isEmpty(request.body._ref) || api.isEmpty(request.body.owner)
    || api.isEmpty(request.body.properties)) {
    return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
  }

  Car.create({
    id: request.body.id,
    _ref: request.body._ref,
    owner: request.params.userId,
    properties: request.body.properties
  }).then(newCar => {
    var jsonInResponse = {
      metadata: {
        version: api.apiVersion
      },
      car: {
        id: newCar.id,
        _ref: newCar._ref,
        owner: newCar.owner,
        properties: newCar.properties
      }
    };
    return response.status(201).json(jsonInResponse);
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Da de baja un auto.
 *
 */
router.delete('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyManagerOrAppRole, function(request, response) {
  Car.destroy({
    where: {
      id: request.params.carId,
      owner: request.params.userId
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
 *  Devuelve toda la información del auto.
 *
 */
router.get('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  Car.find({
    where: {
      owner: request.params.userId,
      id: request.params.carId
    }
  }).then(carFound => {
    if (carFound) {
      var jsonInResponse = {
        metadata: {
          version: api.apiVersion
        },
        car: {
          id: carFound.id,
          _ref: carFound._ref,
          owner: carFound.owner,
          properties: carFound.properties
        }
      };
      return response.status(200).json(jsonInResponse); 
    } else {
      return response.status(404).json({code: 0, message: "Auto inexistente"});
    }
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Modifica los datos del auto.
 *
 */
router.put('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  // si hay algún parámetro faltante
  if (api.isEmpty(request.body.id) || api.isEmpty(request.body._ref) || api.isEmpty(request.body.owner)
    || api.isEmpty(request.body.properties)) {
    return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
  }

  Car.find({
    where: {
      owner: request.params.userId,
      id: request.params.carId
    }
  }).then(carFound => {
    if (carFound) {
      carFound.updateAttributes({
        _ref: request.body._ref,
        owner: request.body.owner,
        properties: request.body.properties
      }).then(updatedCar => {

        var jsonInResponse = {
          metadata: {
            version: api.apiVersion
          },
          car: {
            id: updatedCar.id,
            _ref: updatedCar._ref,
            owner: updatedCar.owner,
            properties: updatedCar.properties
          }
        };
        return response.status(200).json(jsonInResponse);
      });
    } else {
      return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
    }
  }).catch(function (error) {
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

module.exports = router;

/**
 *  This method clears the application users database, leaving blank the users table
 */
function clearUsersTable(){
	return new Promise(
		function (resolve, reject) {
		  User.destroy({
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
	})
};

module.exports.clearUsersTable = clearUsersTable;

/**
 *  This method clears the application cars database, leaving blank the cars table
 */
function clearCarsTable(){
  return new Promise(
    function (resolve, reject) {
      Car.destroy({
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
  })
};

module.exports.clearCarsTable = clearCarsTable;