//! @package test
//! @file servers.js

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
 *  Test methods for application servers management endpoints
 *
 * Servers or application servers are the programs that run the system and operate with the client applications run by application users
 * These methods test endpoints for servers management
 */
describe('Servers', function()  {

	var serversAPI = require('../routes/servers');

	describe('/GET servers', function() {
	  	it('it should have no permission to access servers without token', function(done) {
		    this.timeout(15000);
		    serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/servers/')
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
			});
	    });

	    it('it should GET a specific server', function(done) {
			this.timeout(15000);

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					var serverToGet = {
						id: 12,
						_ref: 'abc12',
						createdBy: 12,
						createdTime: 'testTime12',
						name: 'Test12',
						lastConnection: 12
					};

					chai.request(baseUrl)
					.post('/servers/')
					.set(token_header_flag, token)
					.send(serverToGet)
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/' + serverToGet.id)
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.have.property('metadata');
							res.body.should.have.property('server');
							res.body.server.name.should.equal(serverToGet.name);
							done();
						});
					});
				});
			});
	    });

	    it('it shouldn\'t GET a specific missing server', function(done) {
			this.timeout(15000);

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					chai.request(baseUrl)
					.get('/servers/' + '3')
					.set(token_header_flag, token)
					.end((err, res) => {
						res.should.have.status(404);
						res.body.should.have.property('code');
						res.body.should.have.property('message');
						done();
					});
				});
			});
	    });
	});

	describe('/POST server', function() {
	  	it('it should POST a server', function(done) {
			this.timeout(15000);

	  		serversAPI.clearServersTable()
			.then( function(fulfilled) {

				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					var newServer = {
						id: 10,
						_ref: 'abc10',
						createdBy: 10,
						createdTime: 'abc10',
						name: 'Dummy10',
						lastConnection: 10,
						username: 'myAppServer'
					};

					chai.request(baseUrl)
					.post('/servers/')
					.set(token_header_flag, token)
					.send(newServer)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.should.have.property('metadata');
						res.body.should.have.property('server');
						res.body.server.should.have.property('server');
						res.body.server.should.have.property('token');
					  done();
					});
				});
			});
	    });

		it('it shouldn\'t POST a server with missing parameters', function(done) {
			this.timeout(15000);

	  		serversAPI.clearServersTable()
			.then( function(fulfilled) {

				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					var token = res.body.token.token;

					var newServer = {
						id: 10,
						_ref: '',
						createdBy: 10,
						createdTime: 'abc10',
						name: '',
						lastConnection: 10,
						username: 'myAppServer'
					};

					chai.request(baseUrl)
					.post('/servers/')
					.set(token_header_flag, token)
					.send(newServer)
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

	describe('/DELETE server', function() {

		var serverToDelete = {
			id: 11,
			_ref: 'abc11',
			createdBy: 11,
			createdTime: 'testTime11',
			name: 'Test11',
			lastConnection: 11,
			username: 'myAppServer'
		};

	  	it('it should DELETE a server', function(done) {
	  		this.timeout(15000);
	  		serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					chai.request(baseUrl)
					.post('/servers/')
					.set(token_header_flag, token)
					.send(serverToDelete)
					.end((err, res) => {
						chai.request(baseUrl)
						.delete('/servers/' + serverToDelete.id)
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(204);
							done();
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t DELETE a server that doesn\'t exist', function(done) {
	  		this.timeout(15000);
	  		serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					chai.request(baseUrl)
					.delete('/servers/' + serverToDelete.id)
					.set(token_header_flag, token)
					.end((err, res) => {
						res.should.have.status(404);
						done();
					});
				});
			});
	    });
	});

	describe('/POST specific server', function() {

		var serverToPost = {
			id: 11,
			_ref: 'abc11',
			createdBy: 11,
			createdTime: 'testTime11',
			name: 'Test11',
			lastConnection: 11,
			username: 'myAppServer'
		};

	  	it('it should POST a server', function(done) {
	  		this.timeout(15000);
	  		serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					chai.request(baseUrl)
					.post('/servers/')
					.set(token_header_flag, token)
					.send(serverToPost)
					.end((err, res) => {
						chai.request(baseUrl)
						.post('/servers/' + serverToPost.id)
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.have.property('metadata');
							res.body.should.have.property('server');
							res.body.server.token.should.have.property('token');
							res.body.server.token.should.not.equal(token);
							done();
						});
					});
				});
			});
	    });
	});

	describe('/PUT server', function() {
	  	it('it should PUT a server', function(done) {
			this.timeout(15000);

			var serverToPost = {
				id: 12,
				_ref: 'abc12',
				createdBy: 12,
				createdTime: 'testTime12',
				name: 'Test12',
				lastConnection: 12,
				username: 'myAppServer',
				password: 'aa'
			};

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;
						chai.request(baseUrl)
						.post('/servers/')
						.set(token_header_flag, token)
						.send(serverToPost)
						.end((err, res) => {

							serverToPost = {
								id: 12,
								_ref: 'abc12',
								createdBy: 12,
								createdTime: 'testTime12',
								name: 'ModifiedName',
								lastConnection: 12,
								username: 'myAppServer',
								password: 'aa'
							};

							chai.request(baseUrl)
							.put('/servers/' + serverToPost.id)
							.set(token_header_flag, token)
							.send(serverToPost)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.should.have.property('server');
								res.body.server.name.should.equal(serverToPost.name);
								done();
							});
						});
					});
				});
			});
	    });

		it('it shouldn\'t PUT a missing server', function(done) {
			this.timeout(15000);

			var serverToPut = {
				id: 12,
				_ref: 'abc12',
				createdBy: 12,
				createdTime: 'testTime12',
				name: 'Test12',
				lastConnection: 12,
				username: 'myAppServer',
				password: 'aa'
			};

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.put('/servers/' + serverToPut.id)
						.set(token_header_flag, token)
						.send(serverToPut)
						.end((err, res) => {
							res.should.have.status(404);
							res.body.should.have.property('code');
							res.body.should.have.property('message');
							done();
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t PUT a server with missing parameters', function(done) {
			this.timeout(15000);

			var serverToPost = {
				id: 12,
				_ref: 'abc12',
				createdBy: 12,
				createdTime: 'testTime12',
				name: 'Test12',
				lastConnection: 12
			};

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;
						chai.request(baseUrl)
						.post('/servers/')
						.set(token_header_flag, token)
						.send(serverToPost)
						.end((err, res) => {

							serverToPost = {
								id: 12,
								_ref: 'abc12',
								createdBy: 12,
								createdTime: '',
								name: '',
								lastConnection: 12
							};

							chai.request(baseUrl)
							.put('/servers/' + serverToPost.id)
							.set(token_header_flag, token)
							.send(serverToPost)
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
});