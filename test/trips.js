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
 *  Test methods for trips management endpoints
 */
describe('Trips', function()  {

	var serversAPI = require('../routes/trips');

	describe('/GET Trips', function() {
		it('it should have no permission to access servers without token', function(done) {
			this.timeout(15000);
			chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/') 
				.end((err, res) => {
					// serversAPI.clearTripsTable()
					//.then( function(fulfilled){
					chai.request(baseUrl)
						.get('/trips/')
						.end((err, res) => {
							res.should.have.status(401);
							done();
						});
				});
		});
/*
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
		*/
	});
});