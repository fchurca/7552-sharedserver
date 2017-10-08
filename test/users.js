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

describe('Users', function()  {

	var usersAPI = require('../routes/users');

	describe('/GET users', function() {
	  	it('it should GET no users from empty database', function(done) {
		    this.timeout(15000);
		    usersAPI.clearUsersTable().
			then( function(fulfilled){

				chai.request(baseUrl)
					.get('/users/')
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('array');
						res.body.length.should.be.eql(0);
						done();
					});
			});
	    });
	  });

	describe('/POST user', function() {
	  	it('it should POST a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){

				var newUser = {
					id: 0,
					username: 'johnny',
					password: 'aaaa',
					name: 'John',
					surname: 'Hancock',
					country: 'Argentina',
					email: 'johnny123@gmail.com',
					birthdate: '24/05/1992'
				};

				chai.request(baseUrl)
					.post('/users/')
					.send(newUser)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.should.have.property('surname');
						res.body.should.have.property('id');
					  done();
					});
			});
	    });
	 });

	var userToDelete = {
		id: 15,
		username: 'testUsername',
		password: 'fakepasswd',
		name: 'testName',
		surname: 'testSurname',
		country: 'Argentina',
		email: 'testEmail@gmail.com',
		birthdate: '24/05/1992'
	};

	describe('/DELETE user', function() {
		it('it shouldnt DELETE a user that doesnt exist', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				chai.request(baseUrl)
					.delete('/users/' + userToDelete.id)
					.send(userToDelete)
					.end((err, res) => {
						res.should.have.status(404);
						done();
					});
			});
		});

	  	it('it should DELETE a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				chai.request(baseUrl)
					.post('/users/')
					.send(userToDelete)
					.end((err, res) => {
						chai.request(baseUrl)
							.delete('/users/' + userToDelete.id)
							.send(userToDelete)
							.end((err, res) => {
								res.should.have.status(204);
								done();
							});
					});
			})
	    });
	 });

	describe('/GET user', function() {
	  	it('it should GET an existing user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToGet = {
					id: 10,
					username: 'testUsername10',
					password: 'aaa',
					name: 'testName10',
					surname: 'testSurname10',
					country: 'Argentina10',
					email: 'testEmail10@gmail.com',
					birthdate: '24/05/1992'
				};
				

				chai.request(baseUrl)
					.post('/users/')
					.send(userToGet)
					.end((err, res) => {
						chai.request(baseUrl)
							.get('/users/' + userToGet.id)
							.end((err, res) => {
								res.should.have.status(200);
								done();
							});
					});
			});
	    });
	 });

	var userToModify = {
		id: 11,
		username: 'testUsername11',
		password: 'aaa',
		name: 'testName11',
		surname: 'testSurname11',
		country: 'Argentina11',
		email: 'testEmail11@gmail.com',
		birthdate: '24/05/1992'
	};

	describe('/PUT user', function() {

		it('it shouldnt PUT a user that doesnt exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){
				chai.request(baseUrl)
					.put('/users/' + userToModify.id)
					.send(userToModify)
					.end((err, res) => {
						res.should.have.status(404);
						done();
					});
			});
	    });

	  	it('it should PUT a modified user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToModify = {
					id: 11,
					username: 'testUsername11',
					name: 'testName11',
					surname: 'testSurname11',
					country: 'Argentina11',
					email: 'testEmail11@gmail.com',
					birthdate: '24/05/1992'
				};
				

				chai.request(baseUrl)
					.post('/users/')
					.send(userToModify)
					.end((err, res) => {
						userToModify = {
							id: 11,
							username: 'modifiedUsername',
							name: 'testName11',
							surname: 'testSurname11',
							country: 'Argentina11',
							email: 'testEmail11@gmail.com',
							birthdate: '24/05/1992'
						};			

						chai.request(baseUrl)
							.put('/users/' + userToModify.id)
							.send(userToModify)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.username.should.equal('modifiedUsername');
								done();
							});
					});
			});
	    });
	 });

});

describe('Servers', function()  {

	var serversAPI = require('../routes/servers');

	describe('/GET servers', function() {
	  	it('it should GET no servers from empty database', function(done) {
		    this.timeout(15000);
		    serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
					.get('/servers/')
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a('array');
						res.body.length.should.be.eql(0);
						done();
					});
			});
	    });
	  });

	describe('/POST server', function() {
	  	it('it should POST a server', function(done) {
			this.timeout(15000);

	  		serversAPI.clearServersTable()
			.then( function(fulfilled){

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
					.send(newServer)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.should.have.property('createdBy');
						res.body.should.have.property('id');
					  done();
					});
			});
	    });
	 });

	describe('/DELETE server', function() {
	  	it('it should DELETE a server', function(done) {
	  		this.timeout(15000);
	  		serversAPI.clearServersTable()
			.then( function(fulfilled){

				var serverToDelete = {
				    id: 11,
				    _ref: 'abc11',
				    createdBy: 11,
				    createdTime: 'testTime11',
				    name: 'Test11',
				    lastConnection: 11,
					username: 'myAppServer'
				};

				chai.request(baseUrl)
					.post('/servers/')
					.send(serverToDelete)
					.end((err, res) => {
						chai.request(baseUrl)
							.delete('/servers/' + serverToDelete.id)
							.send(serverToDelete)
							.end((err, res) => {
								res.should.have.status(204);
								done();
							});
					});
			});
	    });
	 });

	describe('/GET server', function() {
	  	it('it should GET a server', function(done) {
			this.timeout(15000);

			serversAPI.clearServersTable()
			.then( function(fulfilled){

				var serverToGet = {
				    id: 12,
				    _ref: 'abc12',
				    createdBy: 12,
				    createdTime: 'testTime12',
				    name: 'Test12',
				    lastConnection: 12,
					username: 'myAppServer',
					password: 'aa'
				};

				chai.request(baseUrl)
					.post('/servers/')
					.send(serverToGet)
					.end((err, res) => {
						chai.request(baseUrl)
							.get('/servers/' + serverToGet.id)
							.end((err, res) => {
								res.should.have.status(200);
								done();
							});
					});
			});
	    });
	 });

});

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
					console.log('1st res: ', res.body);
					if(err){console.log('***** ASDFASDFASF ****** ')};

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
								res.body.should.be.a('array');
								res.body.length.should.be.eql(1);
								done();
							});

					});				
				})
				
			});
	    });
	  });

	describe('/POST business user', function() {
	  	it('it should POST a business user', function(done) {
			this.timeout(15000);

	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var newBusinessUser = {
				    id: 2,
				    _ref: 'a2',
				    username: 'carlossanchez',
				    password: 'carlos123',
				    name: 'Carlos',
				    surname: 'Sanchez',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
					.post('/business-users/')
					.send(newBusinessUser)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.should.have.property('username');
						res.body.should.have.property('surname');
					  done();
					});
			});
	    });
	 });

	describe('/DELETE business user', function() {
	  	it('it should DELETE a business user', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var businessUserToDelete = {
				    id: 3,
				    _ref: 'a3',
				    username: 'johnBlack',
				    name: 'John',
				    surname: 'Black',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
					.post('/business-users/')
					.send(businessUserToDelete)
					.end((err, res) => {
						chai.request(baseUrl)
							.delete('/business-users/' + businessUserToDelete.id)
							.send(businessUserToDelete)
							.end((err, res) => {
								res.should.have.status(204);
								done();
							});
					});
			});
	    });
	 });
});