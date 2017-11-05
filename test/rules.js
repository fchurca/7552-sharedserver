//! @package test
//! @file rules.js

process.env.DATABASE_URL = 'postgres://nvvgpxztxxdugy:794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281@ec2-23-23-234-118.compute-1.amazonaws.com:5432/de2pgllaiv55c3';

process.env.DATABASE_USER='nvvgpxztxxdugy';
process.env.DATABASE_HOST='ec2-23-23-234-118.compute-1.amazonaws.com';
process.env.DATABASE='de2pgllaiv55c3';
process.env.DATABASE_PASS='794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281';

var chai = require('chai');
var chaiHttp = require('chai-http');
var baseUrl = 'http://localhost:5000/api';
var api = require('../routes/api');
var should = chai.should();
var expect = chai.expect;
var util = require('util');
var token_header_flag = 'x-access-token';

chai.use(chaiHttp);

var jwt = require('jsonwebtoken');

/**
 *  Test methods for rules endpoints
 *
 */
describe('Rules', function()  {

	var rulesAPI = require('../routes/rules');

	describe('/GET rules', function() {
	  	it('it shouldn\'t GET rules from empty database table', function(done) {
			this.timeout(15000);

			chai.request(baseUrl)
			.get('/rules/dropRuleTable')
			.end((err, res) => {
				console.log('HOLA');
				res.should.have.status(200);
				chai.request(baseUrl)
				.get('/rules/')
				.end((err,res) => {
					res.should.have.status(200);
					res.body.rules.length.should.be.eql(0);
					done();
				});
			});
	    });
	});
});
