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
 *  Test methods for application users endpoints
 *
 * Application users are the drivers or passangers that use the system and have a profile in this database
 */
describe('Users', function()  {

	var usersAPI = require('../routes/users');
	var serversAPI = require('../routes/servers');
	var businessUsersAPI = require('../routes/business-users');

	describe('/GET users', function() {
	  	it('it should\'t GET users from empty database', function(done) {
		    this.timeout(20000);
		    usersAPI.clearUsersTable()
			.then( function(fulfilled){

				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {

						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/') 
						.end((err, res) => {
							var token = res.body.serverToken;

							chai.request(baseUrl)
							.get('/users/')
							.set(token_header_flag, token)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.should.have.property('metadata');
								res.body.should.have.property('users');
								res.body.users.length.should.be.eql(0);
								res.body.users.should.be.a('array');
								done();
							});
						});
					});
				});	
			});
	    });	

	    it('it should GET two users', function(done) {
		    this.timeout(20000);
		    usersAPI.clearUsersTable()
			.then( function(fulfilled){

				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/') 
						.end((err, res) => {
							var token = res.body.serverToken;

							var firstUser = {
								_ref: 'aaa',
								type: 'conductor',
								username: 'johnny',
								password: 'aaaa',
								fb: {
									userId: '',
									authToken: ''
								},
								firstName: 'John',
								lastName: 'Hancock',
								country: 'Argentina',
								email: 'johnny123@gmail.com',
								birthdate: '24/05/1992'
							};
							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, token)
							.send(firstUser)
							.end((err, res) => {
								res.should.have.status(201);
								var secondUser = {
									_ref: 'bbb',
									type: 'pasajero',
									username: 'tommy',
									password: 'bbbb',
									fb: {
										userId: '',
										authToken: ''
									},
									firstName: 'Tom',
									lastName: 'Smith',
									country: 'EEUU',
									email: 'tommy@gmail.com',
									birthdate: '29/01/1989'
								};
								chai.request(baseUrl)
								.post('/users/')
								.set(token_header_flag, token)
								.send(secondUser)
								.end((err, res) => {
									chai.request(baseUrl)
									.get('/users/')
									.set(token_header_flag, token)
									.end((err, res) => {
										res.should.have.status(200);
										res.body.should.have.property('users');
										res.body.users.length.should.be.eql(2);
										res.body.users[0].id.should.be.eql(1);
										res.body.users[1].id.should.be.eql(2);
										done();
									});
								});
							});
						});
					});
				});
			});
	    });
	});

	describe('/POST user', function() {
	  	it('it should POST a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/') 
						.end((err, res) => {
							var token = res.body.serverToken;

							var newUser = {
								_ref: '0',
								type: 'pasajero',
								username: 'johnny',
								password: 'aaaa',
								fb: {
									userId: '',
									authToken: ''
								},
								firstName: 'John',
								lastName: 'Hancock',
								country: 'Argentina',
								email: 'johnny123@gmail.com',
								birthdate: '24/05/1992'
							};

							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, token)
							.send(newUser)
							.end((err, res) => {
								res.should.have.status(201);
								res.body.should.have.property('metadata');
								res.body.should.have.property('user');
								res.body.user.id.should.be.eql(1);
							    done();
							});
						});
					});
				});
			});
	    });

	    it('it shouldn\'t POST a user with missing parameters', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					var newUser = {
						_ref: '0',
						type: '',
						username: 'johnny',
						password: 'aaaa',
						firstName: 'John',
						country: 'Argentina',
						email: 'johnny123@gmail.com',
						birthdate: '24/05/1992'
					};

					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/') 
					.end((err, res) => {
						var token = res.body.serverToken;

						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(newUser)
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

	var userToDelete = {
		_ref: 'aaa',
		type: 'pasajero',
		username: 'testUsername',
		password: 'fakepasswd',
		fb: {
			userId: '',
			authToken: ''
		},
		firstName: 'testName',
		lastName: 'testSurname',
		country: 'Argentina',
		email: 'testEmail@gmail.com',
		birthdate: '24/05/1992'
	};

	var userToDeleteId = 1; // it's the first user in the table

	describe('/DELETE user', function() {
		it('it shouldn\'t DELETE a user that doesn\'t exist', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/')
						.end((err,res) => {
							var serverToken = res.body.serverToken;

							chai.request(baseUrl)
							.delete('/users/' + userToDeleteId)
							.set(token_header_flag, serverToken)
							.send(userToDelete)
							.end((err, res) => {
								res.should.have.status(404);
								done();
							});
						});
					});
				});
			});
		});

	  	it('it should DELETE a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/')
						.end((err,res) => {
							var token = res.body.serverToken;

							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, token)
							.send(userToDelete)
							.end((err, res) => {
								chai.request(baseUrl)
								.delete('/users/' + userToDeleteId)
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
	    });
	});

	describe('/GET specific user', function() {
	  	it('it should GET a specific existing user', function(done) {
			this.timeout(15000);
			usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						var userToGet = {
							_ref: 'aaa',
							applicationowner: 'hi',
							type: 'conductor',
							username: 'testUsername10',
							password: 'aaa',
							fb: {
								userId: '',
								authToken: ''
							},
							firstName: 'testName10',
							lastName: 'testSurname10',
							country: 'Argentina10',
							email: 'testEmail10@gmail.com',
							birthdate: '24/05/1992'
						};
						
						var userToGetId = 1; // it's the first user in the table	
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer')
						.end((err,res) => {
							var serverToken = res.body.serverToken;
							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, serverToken)
							.send(userToGet)
							.end((err, res) => {
								chai.request(baseUrl)
								.get('/users/' + userToGetId)
								.set(token_header_flag, serverToken)
								.end((err, res) => {
									res.should.have.status(200);
									done();
								});
							});
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t GET a user that doesn\'t exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						var userToGetId = 10;
						
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer')
						.end((err,res) => {
							var serverToken = res.body.serverToken;
			
							chai.request(baseUrl)
							.get('/users/' + userToGetId)
							.set(token_header_flag, serverToken)
							.end((err, res) => {
								res.should.have.status(404);
								res.body.should.have.property('code');
								done();
							});						
						});
					});
				});
			});
	    });
	});

	var userToModify = {
		_ref: 'aaa',
		applicationowner: 'aaa',
		type: 'conductor',
		username: 'testUsername11',
		password: 'aaa',
		firstName: 'testName11',
		lastName: 'testSurname11',
		country: 'Argentina11',
		email: 'testEmail11@gmail.com',
		birthdate: '24/05/1992'
	};

	var userToModifyId = 1;

	describe('/PUT user', function() {

		it('it shouldn\'t PUT a user that doesn\'t exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/')
						.end((err,res) => {
						
							console.log('Is this body w token?: ', res.body);
							var serverToken = res.body.serverToken;

							chai.request(baseUrl)
							.put('/users/' + userToModifyId)
							.set(token_header_flag, serverToken)
							.send(userToModify)
							.end((err, res) => {
								res.should.have.status(404);
								done();
							});	
						});
					});
				});
			});
	    });

	  	it('it should PUT a modified user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						var userToModify = {
							_ref: 'aaa',
							applicationowner: 'aaa',
							type: 'conductor',
							username: 'testUsername11',
							password: 'aaa',
							fb: {
								userId: '',
								authToken: ''
							},
							firstName: 'testName11',
							lastName: 'testSurname11',
							country: 'Argentina11',
							email: 'testEmail11@gmail.com',
							birthdate: '24/05/1992'
						};

						var userToModifyId = 1;
						
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/')
						.end((err,res) => {

							console.log('Is this body w token?: ', res.body);
							var token = res.body.serverToken;

							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, token)
							.send(userToModify)
							.end((err, res) => {
								res.body.should.have.property('user');
								res.should.have.status(201);
								userToModify = {
									_ref: 'aaa',
									applicationowner: 'aaa',
									type: 'conductor',
									username: 'modifiedUsername',
									password: 'bbb',
									fb: {
										userId: '',
										authToken: ''
									},
									firstName: 'testName11',
									lastName: 'testSurname11',
									country: 'Argentina11',
									email: 'testEmail11@gmail.com',
									birthdate: '24/05/1992'
								};			

								chai.request(baseUrl)
								.put('/users/' + userToModifyId)
								.set(token_header_flag, token)
								.send(userToModify)
								.end((err, res) => {
									res.should.have.status(200);
									res.body.username.should.equal('modifiedUsername');
									res.body.password.should.equal('bbb');
									done();
								});
							});
						});
					});
				});
			});
	    });
	});

	describe('/VALIDATE user', function() {
	  	it('it should VALIDATE an existing user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {	
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/')
						.end((err,res) => {
							var userToValidate = {
								_ref: 'aaa',
								applicationowner: 'aaa',
								type: 'conductor',
								username: 'testUsername11',
								password: 'aaa',
								fb: {
									userId: '',
									authToken: ''
								},
								firstName: 'testName11',
								lastName: 'testSurname11',
								country: 'Argentina11',
								email: 'testEmail11@gmail.com',
								birthdate: '24/05/1992'
							};	

							var token = res.body.serverToken;

							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, token)
							.send(userToValidate)
							.end((err, res) => {
								res.body.should.have.property('user');
								console.log('Server has been created\n');
								chai.request(baseUrl)
								.post('/users/validate')
								.set(token_header_flag, token)
								.send({"username":"testUsername11", "password":"aaa"})
								.end((err, res) => {
									res.should.have.status(200);
									done();
								});
							});
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t VALIDATE an user that doesn\'t exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/users/dropUserTable')
					.end((err, res) => {
						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer/')
						.end((err,res) => {
							
							console.log('Is this body w token?: ', res.body);
							var token = res.body.serverToken;

							chai.request(baseUrl)
							.post('/users/validate')
							.set(token_header_flag, token)
							.send({"username":"testUsername10", "password":"aaa"})
							.end((err, res) => {
								res.should.have.status(400);
								done();
							});
						});
					});
				});
			});
	    });
	});

	describe('/GET user with INVALIDATED TOKEN', function() {
	  	it('it should NOT GET an existing user with INVALIDATED TOKEN', function(done) {
			this.timeout(20000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToGet = {
					_ref: 'aaa',
					applicationowner: 'hi',
					type: 'conductor',
					username: 'testUsername10',
					password: 'aaa',
					fb: {
						userId: '',
						authToken: ''
					},
					firstName: 'testName10',
					lastName: 'testSurname10',
					country: 'Argentina10',
					email: 'testEmail10@gmail.com',
					birthdate: '24/05/1992'
				};

				var userToGetId = 1;

				businessUsersAPI.clearBusinessUsersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/business-users/initAndWriteDummyBusinessUser/')
					.end((err,res) => {
						res.should.have.status(200);
						serversAPI.clearServersTable()
						.then(function(fulfilled) {
						
							chai.request(baseUrl)
							.get('/servers/initAndWriteDummyServer/')
							.end((err,res) => {
								var oldAppToken = res.body.serverToken;

								chai.request(baseUrl)
								.get('/users/dropUserTable')
								.end((err, res) => {
									res.should.have.status(200);
									//console.log('Is this body OLD APP TOKEN inside JSON?: ', res.body);
									chai.request(baseUrl)
									.post('/token/')
									.set('content-type', 'application/json')
									.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
									.end((err, res) => {
										res.should.have.status(201);
										var businessUserToken = res.body.token.token;
										chai.request(baseUrl)
										.post('/users/')
										.set(token_header_flag, oldAppToken)
										.send(userToGet)
										.end((err, res) => {
											res.should.have.status(201);
											
											// Taking a small nap to let newToken and oldToken be different in time
											console.log('Freezing for 2 senconds to make tokens differ in end time...');
											var milliseconds = 2000;
											var start = new Date().getTime();
											for (var i = 0; i < 1e7; i++) {
												if ((new Date().getTime() - start) > milliseconds){
												  break;
												}
											}
											console.log('TOKENNN: ' + oldAppToken);
											chai.request(baseUrl)
											.post('/servers/ping/')
											// .set('authorization', 'Bearer ' + oldAppToken)
											.set(token_header_flag, oldAppToken) // here still oldAppToken is OK
											.end((err, res) => {
												/// \todo averiguar por que a veces salta 401 unaothorized acá...
												/// El error que leemos del token es que está vencido
												/// Podría ser un tema de la definición de tiempo en chai mocha testing
												/// Autenticación por token es usado en todos los demás tests y no anda mal
												/// En este test lo que queremos probar es otra cosa:
												/// Si para este método el token aún es válido (en un escenario real debería serlo)
												/// La anulación del token funciona correctamente. Si en cambio el token expira
												/// como se mencionó este test llega hasta acá y termina con error 401
												// done();
												
												res.should.have.status(200);
												var newAppToken = res.body.ping.token.token;
												jwt.verify(newAppToken, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
													// console.log('TOKEN DECODED: '+JSON.stringify(decoded));
													chai.request(baseUrl)
													.get('/users/' + userToGetId)
													.set(token_header_flag, oldAppToken) // oldAppToken has been invalidated
													.end((err, res) => {
														console.log('TOKENNN: ' + oldAppToken);
														res.should.have.status(401); // unauthorized
														chai.request(baseUrl)
														.get('/users/' + userToGetId)
														.set(token_header_flag, newAppToken) // newAppToken should be ok
														.end((err, res) => {
															res.should.have.status(200);
															done();
														});
													});
												});
												
											});
										});
									});
								});
							});
						});
					});
				});
			});
	    });
	});
});
