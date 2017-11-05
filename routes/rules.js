//! @file rules.js
//! Describes endpoints for rules

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var api = require('./api.js');

var models = require('../models/db'); // loads db.js
var Rule = models.rule; 

var Verify = require('./verify');
var RulesEngine = require('./rulesEngine');

// CREATE TABLE rules(id SERIAL PRIMARY KEY, _ref VARCHAR(20), language VARCHAR(40), blob VARCHAR(40), active BOOLEAN);

router.get('/dropRuleTable', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    Rule.sync({force: true}).then(() => {
      return response.status(200).json({});
    }).catch(function (error) {
      /* istanbul ignore next  */
      return response.status(500).json({code: 0, message: "Unexpected error"});
    });
  }
});

/**
 *  Devuelve toda la información acerca de todas las reglas indicadas.
 *
 */ 
router.get('/', /*Verify.verifyToken, Verify.verifyUserRole,*/ function(request, response) {
	Rule.findAll({
		attributes: ['id', '_ref', 'language', 'blob', 'active']
	}).then(rulesFound => {
		/* istanbul ignore if  */
	    if (!rulesFound) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }

		var ruleArray = [];
		rulesFound.forEach(function(item) {
			var jsonRule = {
				id: item.id,
			    _ref: item._ref,
			    language: item.language,
			    blob: item.blob,
			    active: item.active
			}
		    ruleArray.push(jsonRule);
		});

	    var jsonInResponse = {
			metadata: {
				version: api.apiVersion // falta completar
			},
			rules: ruleArray
		};
		/**
		 * Define facts the engine will use to evaluate the conditions above.
		 */
		let facts = {
		  costoMinimo: 51
		}

		// Run the engine to evaluate
		RulesEngine
		  .run(facts)
		  .then(events => { // run() returns events with truthy conditions
		    events.map(event => console.log(event.params.message))
		});

		return response.status(200).json(jsonInResponse);
	});
});

module.exports = router;
