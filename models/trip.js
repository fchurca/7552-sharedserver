'use strict';
/*istanbul ignore next*/

var Sequelize = require("sequelize");

/**
 *  Define estructura de datos de un viaje (trip)
 *  Un viaje tiene los siguientes atributos
 *  - id
 *  - applicationOwner
 *  - driverId
 *  - passangerId
 *  - startAddressStreet (string)
 *  - startAddressLocationLat
 *  - startAddressLocationLong
 *  - startTimestamp (epoch)
 *  - endAddressStreet (string)
 *  - endAddressLocationLat
 *  - endAddressLocationLong
 *  - endTimestamp (epoch)
 *  - totalTime (seconds)
 *  - waitTime (seconds)
 *  - travelTime (seconds)
 *  - distance (meters, if available)
 *  - route (optional)
 *  - costCurrency 
 *  - costValue // aka amount
 *
 */

module.exports = function(sequelize, DataTypes) {
	var Trip = sequelize.define("trip", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			unique: true,
			autoIncrement: true // from 1 onwards
		},
		_ref: {
			type: Sequelize.STRING
		},
		applicationOwner: {
			type: Sequelize.STRING
		},
		driverId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		passangerId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		startAddressStreet: {
			type: Sequelize.STRING
		},
		startAddressLocationLat: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		startAddressLocationLon: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		startTimestamp: {
			type: Sequelize.INTEGER // epoch time
		},
		endAddressStreet: {
			type: Sequelize.STRING // Street Address (optional)
		},
		endAddressLocationLat: {
			type: Sequelize.INTEGER, // Latitude
			allowNull: false
		},
		endAddressLocationLon: {
			type: Sequelize.INTEGER, // Longitude
			allowNull: false
		},
		endTimestamp: {
			type: Sequelize.INTEGER // epoch time
		},
		totalTime: {
			type: Sequelize.INTEGER // seconds
		},
		waitTime: {
			type: Sequelize.INTEGER // seconds
		},
		travelTime: {
			type: Sequelize.INTEGER // seconds
		},
		distance: {
			type: Sequelize.INTEGER // meters
		},
		route: {
			type: Sequelize.STRING // to be defined...
		},
		costCurrency: {
			type: Sequelize.STRING, // $AR, $USD, US DOLLARS, etc
			allowNull: false
		},
		costValue: {
			type: Sequelize.INTEGER, // currency amount, ie 10.45; 11,57
			allowNull: false
		}
	
	}, {
		timestamps: false
	});
	return Trip;
};