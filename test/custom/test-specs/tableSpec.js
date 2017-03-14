var chai = require('chai');
var testRequest = require('supertest');
var expect = require('chai').expect;
var app = require('../../../index');
chai.use(require('chai-things'));
var fs = require('fs');
var path = require('path');
var settings = require('../../../settings');

module.exports = function (token) {

    describe('Custom API TABLE endpoint suit', function () {

        // get user view
        describe('GET /custom/tables/vw_omk_users', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                testRequest(app)
                    .get('/custom/tables/vw_omk_users')
                    .set('Authorization', 'Bearer ' + token)
                    .end(function (err, res) {
                        // console.log(err);
                        // console.log(res.body);

                        // Test that the endpoint exists and responds
                        expect(res).to.have.property('status', 200);


                        expect(res.body[0]).to.be.an("object");
                        expect(res.body[0]).to.have.property("id");
                        expect(res.body[0]).to.have.property("username");
                        expect(res.body[0]).to.have.property("first_name");
                        expect(res.body[0]).to.have.property("last_name");
                        expect(res.body[0]).to.have.property("email");
                        expect(res.body[0]).to.have.property("role");
                        expect(res.body[0]).to.have.property("admin").that.is.an("boolean");
                        expect(res.body[0]).to.have.property("read").that.is.an("boolean");
                        expect(res.body[0]).to.have.property("write").that.is.an("boolean");
                        expect(res.body[0]).to.have.property("num_forms").that.is.an("number");

                        done();
                    });
            });
        });

        // get user details view
        describe('GET /custom/tables/vw_omk_user_details', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                testRequest(app)
                    .get('/custom/tables/vw_omk_user_details')
                    .set('Authorization', 'Bearer ' + token)
                    .end(function (err, res) {
                        // console.log(err);

                        // Test that the endpoint exists and responds
                        expect(res).to.have.property('status', 200);


                        expect(res.body[0]).to.be.an("object");
                        expect(res.body[0]).to.have.property("id");
                        expect(res.body[0]).to.have.property("username");
                        expect(res.body[0]).to.have.property("first_name");
                        expect(res.body[0]).to.have.property("last_name");
                        expect(res.body[0]).to.have.property("email");
                        expect(res.body[0]).to.have.property("role");
                        expect(res.body[0]).to.have.property("admin").that.is.an("boolean");
                        expect(res.body[0]).to.have.property("read").that.is.an("boolean");
                        expect(res.body[0]).to.have.property("write").that.is.an("boolean");
                        expect(res.body[0]).to.have.property("formPermissions").that.is.an("array");

                        done();
                    });
            });
        });

        // get user view
        describe('GET /custom/tables/omk_forms', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                testRequest(app)
                    .get('/custom/tables/omk_forms')
                    .set('Authorization', 'Bearer ' + token)
                    .end(function (err, res) {
                        // console.log(err);
                        // console.log(res.body);

                        // Test that the endpoint exists and responds
                        expect(res).to.have.property('status', 200);


                        expect(res.body[0]).to.be.an("object");
                        expect(res.body[0]).to.have.property("id");
                        expect(res.body[0]).to.have.property("form_id");
                        expect(res.body[0]).to.have.property("name");
                        expect(res.body[0]).to.have.property("label");

                        done();
                    });
            });
        });

        // get user view
        describe('GET /custom/tables/omk_roles', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                testRequest(app)
                    .get('/custom/tables/omk_roles')
                    .set('Authorization', 'Bearer ' + token)
                    .end(function (err, res) {
                        // console.log(err);
                        // console.log(res.body);

                        // Test that the endpoint exists and responds
                        expect(res).to.have.property('status', 200);
                        expect(res.body[0]).to.be.an("object");

                        // admin user
                        expect(res.body[0]).to.have.property("id");
                        expect(res.body[0]).to.have.property("name").to.equal("admin");
                        expect(res.body[0]).to.have.property("description");
                        expect(res.body[0]).to.have.property("read").to.be.an("boolean").to.equal(true);
                        expect(res.body[0]).to.have.property("write").to.be.an("boolean").to.equal(true);
                        expect(res.body[0]).to.have.property("admin").to.be.an("boolean").to.equal(true);

                        // write user
                        expect(res.body[1]).to.have.property("name").to.equal("write");
                        expect(res.body[1]).to.have.property("read").to.be.an("boolean").to.equal(true);
                        expect(res.body[1]).to.have.property("write").to.be.an("boolean").to.equal(true);
                        expect(res.body[1]).to.have.property("admin").to.be.an("boolean").to.equal(false);

                        // read user
                        expect(res.body[2]).to.have.property("name").to.equal("read");
                        expect(res.body[2]).to.have.property("read").to.be.an("boolean").to.equal(true);
                        expect(res.body[2]).to.have.property("write").to.be.an("boolean").to.equal(false);
                        expect(res.body[2]).to.have.property("admin").to.be.an("boolean").to.equal(false);


                        done();
                    });
            });
        });

    });

}
