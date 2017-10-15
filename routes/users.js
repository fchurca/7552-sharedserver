//! @file users.js
//! Describes endpoints for users

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
//var User = require('../models/user.js');
//var Car = require('../models/car.js');

var models = require('../models/db'); // loads db.js
var User = models.user;       // the model keyed by its name
var Car = models.car;

var Verify = require('./verify');
var api = require('./api');

// CREATE TABLE users(id INT PRIMARY KEY, username VARCHAR(40), name VARCHAR(40), surname VARCHAR(40), country VARCHAR(40), email VARCHAR(40), birthdate VARCHAR(20));


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
        id: 0,
        username: 'johnny',
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

/**
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */ 
router.get('/', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
	User.findAll({
    attributes: ['id', 'username', 'name', 'surname', 'country', 'email', 'birthdate']
  }).then(users => {
    if (!users) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
		return response.status(200).json(users);
	})
});

/**
 *  Da de alta un usuario.
 *
 */
router.post('/', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  User.create({
    id: request.body.id,
    username: request.body.username,
    password: request.body.password,
    name: request.body.name,
    surname: request.body.surname,
    country: request.body.country,
    email: request.body.email,
    birthdate: request.body.birthdate
  }).then(user => {
    if (!user) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    return response.status(201).json(user);
  });
});

/**
 *  Valida las credenciales de un usuario de aplicación.   
 *
 */
router.post('/validate', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  User.find({
    where: {
      username: request.body.username,
      password: request.body.password // TODO add facebookAuthToken
    }
  }).then(user => {
    if (!user) {
      return response.status(400).json({code: 0, message: "Faltan parámetros o validación fallida"});
    }
    var responseJson = JSON.stringify({
      metadata: {version: api.apiVersion},
      user: {
        id: user.id,
        _ref: user._ref,
        username: user.username,
        name: user.name,
        surname: user.surname,
        country: user.country,
        email: user.email,
        birthdate: user.birthdate
      }
    });
    return response.status(200).json(responseJson);
  }).catch(function (error) {
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });

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
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Modifica los datos de un usuario.
 *
 */
router.put('/:userId', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (user) {
      user.updateAttributes({
        id: request.body.id,
        username: request.body.username,
        name: request.body.name,
        surname: request.body.surname,
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
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

//CREATE TABLE cars(id INT PRIMARY KEY, _ref VARCHAR(20), owner VARCHAR(40), properties jsonb[]);

/**
 *  Devuelve toda la información acerca de todos los autos del usuario.
 *
 */
router.get('/:userId/cars', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  Car.findAll({
    where: {
      owner: request.params.userId
    }
  }).then(function(cars) {
    console.log(cars);
    return response.status(200).json(cars); 
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
  Car.create({
    id: request.body.id,
    _ref: request.body._ref,
    owner: request.params.userId, 
    properties: request.body.properties
  }).then(car => {
    if (!car) {
      console.log('Car couldn\'t be created\n\n');
      return;
    }
    return response.status(201).json(car);
  }).catch(function (error) {
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
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Devuelve toda la información del auto.
 *
 */
 /*
router.get('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  
});
*/

/**
 *  Modifica los datos del auto.
 *
 */
 /*
router.put('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  
});
*/

module.exports = router;

/**
 *  This method clears the application users database, leaving blank the servers table
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
 *  This method clears the application users database, leaving blank the servers table
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