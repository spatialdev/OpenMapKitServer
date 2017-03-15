var chai = require('chai');
var testRequest = require('supertest');
var expect = require('chai').expect;
var app = require('../../../index');
chai.use(require('chai-things'));
var fs = require('fs');
var path = require('path');
var settings = require('../../../settings');

module.exports = function (token) {

    describe('Custom API endpoint suit', function () {

        // create user
        describe('POST /custom/users/user', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                testRequest(app)
                    .post('/custom/users/user')
                    .set('Authorization', 'Bearer ' + token)
                    .send({
                        "username":"apitestuser" + Date.now(),
                        "password":"apitestpassword",
                        "first_name": "tom",
                        "last_name": "perry",
                        "email": "tomperry@gmail.com",
                        "role": "write"
                    })
                    .end(function (err, res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.property('status', 200);
                        expect(res.body).to.have.property('message', 'success');
                        expect(res.body).to.have.property('id').that.is.an("number");

                        // save id to pass over for delete
                        var id = res.body.id;

                        // delete record
                        testRequest(app)
                            .delete('/custom/users/user/'+id)
                            .set('Authorization', 'Bearer ' + token)
                            .end(function (err, res){

                                // Test that the endpoint exists and responds
                                expect(res).to.have.property('status', 200);
                                expect(res.body).to.have.property('message', 'success');

                                done();

                            })


                    });
            });
        });

    });

}
