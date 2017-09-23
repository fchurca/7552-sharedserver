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

var usersAPI = require('../routes/users');

chai.use(chaiHttp);

describe('Users', function()  {

	describe('/GET users', function() {
	  	it('it should GET no users from empty database', function(done) {
		    this.timeout(15000);
		    usersAPI.clearUsersTable.
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
	  		usersAPI.clearUsersTable.
			then( function(fulfilled){

				var newUser = {
					id: 0,
					username: 'johnny',
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

	describe('/DELETE user', function() {
	  	it('it should DELETE a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable.
			then( function(fulfilled){

				var userToDelete = {
					id: 15,
					username: 'testUsername',
					name: 'testName',
					surname: 'testSurname',
					country: 'Argentina',
					email: 'testEmail@gmail.com',
					birthdate: '24/05/1992'
				};
				

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
			
			usersAPI.clearUsersTable.
			then( function(fulfilled){

				var userToGet = {
					id: 10,
					username: 'testUsername10',
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

	describe('/PUT user', function() {
	  	it('it should PUT a modified user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable.
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
