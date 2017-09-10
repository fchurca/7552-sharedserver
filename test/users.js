//! @package test
//! @file users.js

process.env.DATABASE_URL = 'postgres://nvvgpxztxxdugy:794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281@ec2-23-23-234-118.compute-1.amazonaws.com:5432/de2pgllaiv55c3';

var chai = require('chai');
var chaiHttp = require('chai-http');
var baseUrl = 'http://localhost:5000/api';
var api = require('../routes/api');
var should = chai.should();
var util = require('util');

var usersAPI = require('../routes/users');

chai.use(chaiHttp);

describe('Users', function()  {

	describe('/GET users', function() {
	  	it('it should GET no users from empty database', function(done) {
		    this.timeout(15000);
		    usersAPI.clearUsersTable();

		    chai.request(baseUrl)
		        .get('/users/')
		        .end((err, res) => {
			        res.should.have.status(200);
			        res.body.should.be.a('array');
			        //res.body.length.should.be.eql(0);
			        done();
		        });
	    });
	  });

	describe('/POST user', function() {
	  	it('it should POST a user', function(done) {
	  		usersAPI.clearUsersTable();

	  		var newUser = {
		    	id: 95,
		        name: 'testName',
		        surname: 'testSurname',
		        complete: false
		    };
		    this.timeout(15000);

	        chai.request(baseUrl)
	            .post('/users/')
	            .send(newUser)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.length.should.be.eql(1);
	              done();
	            });
	    });
	 });

	describe('/DELETE user', function() {
	  	it('it should DELETE a user', function(done) {
	  		usersAPI.clearUsersTable();

	  		var userToDelete = {
		    	id: 15,
		        name: 'testName',
		        surname: 'testSurname',
		        complete: false
		    };
		    this.timeout(15000);

	        chai.request(baseUrl)
	            .post('/users/')
	            .send(userToDelete)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.length.should.be.eql(1);
	            });
	        chai.request(baseUrl)
	            .delete('/users/15')
	            .send(userToDelete)
	            .end((err, res) => {
	                res.should.have.status(204);
	              done();
	            });
	    });
	 });

	describe('/GET user', function() {
	  	it('it should GET a user', function(done) {
			usersAPI.clearUsersTable();

	  		var userToGet = {
		    	id: 95,
		        name: 'testName',
		        surname: 'testSurname',
		        complete: false
		    };
		    this.timeout(15000);

	        chai.request(baseUrl)
	            .post('/users/')
	            .send(userToGet)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.length.should.be.eql(1);
	            });
	        chai.request(baseUrl)
	            .get('/users/95')
	            .send(userToGet)
	            .end((err, res) => {
	                res.should.have.status(200);
	                //res.body.length.should.be.eql(1);
	              done();
	            });
	    });
	 });
});
