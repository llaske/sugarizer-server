/* eslint-disable indent */
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require("../../sugarizer.js");
const chai = require('chai');
const chaiHttp = require('chai-http');
var timestamp = + new Date();

//fake user for testing authentication
var fake = {
    'student1': '{"name":"Sugarizer_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}',
    'student2': '{"name":"Sugarizer_2' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"word","language":"en"}',
    'admin': '{"name":"admin' + (timestamp.toString()) + '","password":"password","language":"en","role":"admin"}',
    'classroom1': '{"name":"group_a_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":[]}',
    'classroom2': '{"name":"group_b_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":[]}',
    'classroom3': '{"name":"group_a_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":[]}',
    'teacher1': '{"name":"SugarizerTeach_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"teacher","password":"bulbasaur","language":"fr"}',
    'teacher2': '{"name":"SugarizerTeach_2' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"teacher","password":"bulbasaur","language":"fr"}',
    'assignment1': '{"name":"assignment_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"instructions":"Draw a bulbasaur","lateTurnIn":"false","classrooms":[], "dueDate":"' + (timestamp.toString()) + '"}',
    'assignment2': '{"name":"assignment_2' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"instructions":"Draw a pikachu","lateTurnIn":"true","classrooms":[], "dueDate":"' + (timestamp.toString()) + '"}',
    'assignment3': '{"name":"assignment_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"instructions":"Draw a bulbasaur","lateTurnIn":"false","classrooms":[], "dueDate":"' + (timestamp.toString()) + '"}',
};

//init server
chai.use(chaiHttp);
chai.should();

describe('Assignments', () => {

    //create & login user and store access key
    before((done) => {

        //delay for db connection for establish
        setTimeout(() => {
            chai.request(server)
                .post('/auth/signup')
                .send({
                    "user": fake.admin
                })
                .end(() => {

                    //login user
                    chai.request(server)
                        .post('/auth/login')
                        .send({
                            "user": fake.admin
                        })
                        .end((err, res) => {
                            //store user data
                            fake.admin = res.body;

                            //create fake user
                            chai.request(server)
                                .post('/api/v1/users/')
                                .set('x-access-token', fake.admin.token)
                                .set('x-key', fake.admin.user._id)
                                .send({
                                    "user": fake.student1
                                })
                                .end((err, res) => {
                                    fake.student1 = res.body;
                                    chai.request(server)
                                        .post('/api/v1/users/')
                                        .set('x-access-token', fake.admin.token)
                                        .set('x-key', fake.admin.user._id)
                                        .send({
                                            "user": fake.student2
                                        })
                                        .end((err, res) => {
                                            fake.student2 = res.body;
                                            done();
                                        });
                                });
                        });
                });
        }, 300);

    });

    //create fake assignment ---POST---
    describe('/POST assignment', () => {
        before((done) => {
            fake.assignment1 = JSON.parse(fake.assignment1);
            fake.assignment1.classrooms = [fake.classroom1._id, fake.classroom2._id];
            fake.assignment1 = JSON.stringify(fake.assignment1);
            done();
        });
        it('it should create an assignment', (done) => {
            chai.request(server)
                .post('/api/v1/assignments/')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .send({
                    "assignment": fake.assignment1
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    fake.assignment1 = res.body;
                    res.body.should.be.an('object');
                    res.body.should.have.property('_id').not.eql(undefined);
                    res.body.should.have.property('name').eql("assignment_1" + (timestamp.toString()));
                    res.body.should.have.property('instructions').eql("Draw a bulbasaur");
                    // res.body.should.have.property('lateTurnIn').deepEqual(false);
                    done();
                });

        });

        it('it should not add an assignment with existing name ', (done) => {
            chai.request(server)
                .post('/api/v1/assignments/')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .send({
                    "assignment": fake.assignment3
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(34);
                    done();
                });
        });


    });

    //get assignment ---GET/:id---
    describe('/GET/:id assignment', () => {
        it('it should return nothing on invalid', (done) => {

            chai.request(server)
                .get('/api/v1/assignments/' + 'xxx')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(35);
                    done();
                });
        });

        before((done) => {
            setTimeout(() => {
                chai.request(server)
                    .post('/api/login')
                    .send({
                        "user": fake.teacher1
                    })
                    .end((err, res) => {
                        fake.teacher1 = res.body;
                        done();
                    });
            }, 300);
        });


        it('it should return nothing on inexisting id', (done) => {

            chai.request(server)
                .get('/api/v1/assignments/' + 'ffffffffffffffffffffffff')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.eql({});
                    done();
                });
        });

        it('it should return an assignment', (done) => {

            chai.request(server)
                .get('/api/v1/assignments/' + fake.assignment1._id)
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('_id').eql(fake.assignment1._id);
                    res.body.should.have.property('name').eql("assignment_1" + (timestamp.toString()));
                    res.body.should.have.property('instructions').eql("Draw a bulbasaur");
                    res.body.should.have.property('lateTurnIn').eql(true);
                    res.body.should.have.property('classrooms').be.an('array');
                    done();
                });
        });
    });

    //get all assignments ---GET---
    describe('/GET assignments', () => {
        it('it should return all the assignments', (done) => {

            chai.request(server)
                .get('/api/v1/assignments')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.assignments.should.be.an('array');
                    res.body.assignments.length.should.be.above(0);
                    done();
                });
        });

        it('it should return all the fields for assignments', (done) => {

            chai.request(server)
                .get('/api/v1/assignments')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    for (var i = 0; i < res.body.assignments.length; i++) {
                        res.body.assignments[i].should.be.an('object');
                        res.body.assignments[i].should.have.property('_id').not.eql(undefined);
                        res.body.assignments[i].should.have.property('name').not.eql(undefined);
                        res.body.assignments[i].should.have.property('instructions').not.eql(undefined);
                        res.body.assignments[i].should.have.property('lateTurnIn').not.eql(undefined);
                        res.body.assignments[i].should.have.property('dueDate').not.eql(undefined);
                        res.body.assignments[i].should.have.property('classrooms').be.an('array');
                    }
                    done();
                });
        });
    });

    //update assignment ---PUT/:id---
    describe('/PUT/:id assignments', () => {
        before((done) => {
            chai.request(server)
                .post('/api/v1/assignments/')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .send({
                    "assignment": fake.assignment2
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    fake.assignment2 = res.body;
                    res.body.should.be.an('object');
                    res.body.should.have.property('_id').not.eql(undefined);
                    res.body.should.have.property('name').eql("assignment_2" + (timestamp.toString()));
                    done();
                });
        });

        it('it should do nothing on invalid assignment', (done) => {

            chai.request(server)
                .put('/api/v1/assignments/' + 'invalid')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .send({
                    assignment: '{ "name": "assignment_2' + (timestamp.toString()) + '"}'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(35);
                    done();
                });
        });

        it('it should do nothing on inexisting assignment', (done) => {

            chai.request(server)
                .put('/api/v1/assignments/' + 'ffffffffffffffffffffffff')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .send({
                    assignment: '{ "name": "assignment_new_a_' + (timestamp.toString()) + '"}'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(23);
                    done();
                });
        });

        it('it should update the valid assignment', (done) => {

            chai.request(server)
                .put('/api/v1/assignments/' + fake.assignment1._id)
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .send({
                    assignment: '{ "name": "assignment_new_1' + (timestamp.toString()) + '"}'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    //delete assignment ---DELETE/:id---
    describe('/DELETE/:id assignments', () => {
        it('it should do nothing on invalid assignment', (done) => {

            chai.request(server)
                .delete('/api/v1/assignments/' + 'invalid')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(35);
                    done();
                });
        });

        it('it should do nothing on inexisting assignment', (done) => {

            chai.request(server)
                .delete('/api/v1/assignments/' + 'ffffffffffffffffffffffff')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(23);
                    done();
                });
        });

        it('it should delete the valid assignment', (done) => {

            chai.request(server)
                .delete('/api/v1/assignments/' + fake.assignment1._id)
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

    });

    //lauch assignment ---POST/:id/launch---
    describe('/GET/:id launch assignment ', () => {

        it('it should do nothing on invalid assignment', (done) => {

            chai.request(server)
                .get('/api/v1/assignments/launch' + 'invalid')
                .set('x-access-token', fake.admin.token)
                .set('x-key', fake.admin.user._id)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.code.should.be.eql(35);
                    done();
                });
        });


    });

});
