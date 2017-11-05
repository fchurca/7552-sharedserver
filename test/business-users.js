//! @package test
//! @file users.js

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
 *  Test methods for business users management endpoints
 *
 * Business users are the persons that manage the system with different levels of authorization
 * These methods test endpoints for business users management
 */
describe('BusinessUsers', function()  {

	var businessUsersAPI = require('../routes/business-users');

	describe('/GET business user', function() {
	  	it('it should GET business users from database', function(done) {
		    this.timeout(15000);
		    businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/business-users/')
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.have.property('metadata');
							res.body.should.have.property('businessUser');
							res.body.businessUser.length.should.be.eql(1);
							res.body.businessUser.should.be.a('array');
							res.body.businessUser[0].should.have.property('username');
							res.body.businessUser[0].id.should.be.eql(1);
							done();
						});
					});				
				});
			});
	    });

	  	it('it should GET two business users from database', function(done) {
		    this.timeout(15000);
		    businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						var newBusinessUser = {
						    _ref: 'a2',
						    username: 'carlossanchez',
						    password: 'carlos123',
						    name: 'Carlos',
						    surname: 'Sanchez',
							roles: ['admin', 'user']
						};

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(newBusinessUser)
						.end((err, res) => {

							chai.request(baseUrl)
							.get('/business-users/')
							.set(token_header_flag, token)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.should.have.property('metadata');
								res.body.should.have.property('businessUser');
								res.body.businessUser.length.should.be.eql(2);
								res.body.businessUser.should.be.a('array');
								res.body.businessUser[1].should.have.property('username'); // [0] is the Dummy BusinessUser
								res.body.businessUser[1].id.should.be.eql(2);
								done();
							});
						});
					});				
				});
			});
	    });
	});

	describe('/POST business user', function() {
	  	it('it should POST a business user', function(done) {
			this.timeout(15000);

	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var newBusinessUser = {
				    _ref: 'a2',
				    username: 'carlossanchez',
				    password: 'carlos123',
				    name: 'Carlos',
				    surname: 'Sanchez',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(newBusinessUser)
						.end((err, res) => {
							res.should.have.status(201);
							res.body.should.have.property('metadata');
							res.body.should.have.property('businessUser');
							res.body.businessUser.id.should.be.eql(2);
							done();
						});
					});				
				});
			});
	    });

	  	it('it shouldn\'t POST a business user when there\'s already one that has that username', function(done) {
			this.timeout(15000);

	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var newBusinessUser = {
				    _ref: 'a2',
				    username: 'johnny',
				    password: 'carlos123',
				    name: 'Carlos',
				    surname: 'Sanchez',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(newBusinessUser)
						.end((err, res) => {
							res.should.have.status(500);
							res.body.should.have.property('code');
							res.body.should.have.property('message');
							done();
						});

					});				
				});
			});
	    });

	  	it('it shouldn\'t POST a business user that has parameters missing', function(done) {
			this.timeout(15000);

	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var newBusinessUser = {
				    _ref: 'a2',
				    username: '',
				    password: '',
				    name: 'Carlos',
				    surname: 'Sanchez',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(newBusinessUser)
						.end((err, res) => {
							res.should.have.status(400);
							res.body.should.have.property('code');
							res.body.should.have.property('message');
							done();
						});

					});				
				});
			});
	    });
	});

	describe('/DELETE business user', function() {

		var businessUserToDelete = {
		    _ref: 'a3',
		    username: 'johnBlack',
		    password: 'aaa',
		    name: 'John',
		    surname: 'Black',
			roles: ['admin', 'user']
		};

		var businessUserToDeleteId = 2; // Id 1 is the Dummy

	  	it('it should DELETE a business user', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						var token = res.body.token.token;
						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(businessUserToDelete)
						.end((err, res) => {
							chai.request(baseUrl)
							.delete('/business-users/' + businessUserToDeleteId)
							.set(token_header_flag, token)
							.end((err, res) => {
								res.should.have.status(204);
								done();
							});
						});
					});				
				});
			});
	    });

	  	it('it shouldn\'t DELETE a missing business user', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						var token = res.body.token.token;
						chai.request(baseUrl)
						.delete('/business-users/' + businessUserToDeleteId)
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(404);
							done();
						});
					});				
				});
			});
	    });
	});

	describe('/PUT business user', function() {

		var businessuserToModify = {
		    _ref: 'a3',
		    username: 'johnBlack',
		    password: 'abc',
		    name: 'John',
		    surname: 'Black',
			roles: ['user']
		};

		var businessUserToModifyId = 2; // Id 1 is the Dummy

		it('it should PUT a business user that exists', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(businessuserToModify)
						.end((err, res) => {

							businessuserToModify = {
							    _ref: 'a3',
							    username: 'johnBlack',
							    password: 'abc',
							    name: 'Tom', // name changed
							    surname: 'White', // surname changed
								roles: ['user']
							};

							chai.request(baseUrl)
							.put('/business-users/' + businessUserToModifyId)
							.set(token_header_flag, token)
							.send(businessuserToModify)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.should.have.property('metadata');
								res.body.should.have.property('businessUser');
								res.body.businessUser.name.should.equal(businessuserToModify.name);
								res.body.businessUser.surname.should.equal(businessuserToModify.surname);
								done();
							});
						});
					});				
				});
			});
	    });

		it('it shouldn\'t PUT a business user that doesn\'t exist', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;
					
						var businessUserToModifyId = 3;
						businessuserToModify = {
						    _ref: 'a3',
						    username: 'johnBlack',
						    password: 'abc',
						    name: 'Tom',
						    surname: 'White',
							roles: ['user']
						};

						chai.request(baseUrl)
						.put('/business-users/' + businessUserToModifyId)
						.set(token_header_flag, token)
						.send(businessuserToModify)
						.end((err, res) => {
							res.should.have.status(404);
							done();
						});
					});				
				});
			});
	    });

		it('it shouldn\'t PUT a business user that has missing parameters', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(businessuserToModify)
						.end((err, res) => {
							var businessUserToModifyId = 3;
							businessuserToModify = {
							    _ref: 'a3',
							    username: '',
							    password: 'abc',
							    name: 'Tom',
							    surname: 'White',
								roles: ['user']
							};

							chai.request(baseUrl)
							.put('/business-users/' + businessUserToModifyId)
							.set(token_header_flag, token)
							.send(businessuserToModify)
							.end((err, res) => {
								res.should.have.status(400);
								res.body.should.have.property('code');
								res.body.should.have.property('message');
								done();
							});
						});
					});				
				});
			});
	    });
	});

	describe('/GET a specific business user', function() {

		var businessuserToGet = {
		    _ref: 'a3',
		    username: 'johnBlack',
		    password: 'abc',
		    name: 'John',
		    surname: 'Black',
			roles: ['user']
		};

		var businessuserToGetId = 2; // Id 1 is the Dummy

		it('it should GET a business user that exists', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(businessuserToGet)
						.end((err, res) => {

							chai.request(baseUrl)
							.get('/business-users/' + businessuserToGetId)
							.set(token_header_flag, token)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.should.have.property('metadata');
								res.body.should.have.property('businessUser');
								res.body.businessUser.name.should.equal(businessuserToGet.name);
								res.body.businessUser.id.should.equal(businessuserToGetId);
								done();
							});
						});
					});				
				});
			});
	    });

		it('it shouldn\'t GET a specific business user that doesn\'t exist', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/business-users/' + businessuserToGetId)
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(404);
							done();
						});
					});				
				});
			});
	    });
	});

	describe('/POST token', function() {
	  	it('it shouldn\'t POST token for missing business user username', function(done) {
		    this.timeout(15000);
		    businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"pedro", "password":"aaa"}})
					.end((err, res) => {
						res.should.have.status(404);
						res.body.should.have.property('code');
						done();
					});				
				});
			});
	    });

	    it('it shouldn\'t POST token for wrong business user password', function(done) {
		    this.timeout(15000);
		    businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"bbb"}})
					.end((err, res) => {
						res.should.have.status(401);
						res.body.should.have.property('code');
						done();
					});				
				});
			});
	    });
	});
/*
	describe('/GET ME business user', function() {
	  	it('it should GET ME business users from database', function(done) {
		    this.timeout(15000);
		    businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/business-users/me')
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							done();
						});
					});				
				});
			});
	    });
	});
*/
});