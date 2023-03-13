//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var server = require('../../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var timestamp = +new Date();

//fake user for testing auth
var fakeUser = {
	"user": '{"name":"TarunFake' + (timestamp.toString()) + '","password":"pokemon","language":"en","role":"admin"}'
};

//init server
chai.use(chaiHttp);
chai.should();
const expect = require('chai').expect;
var seleniumDriver = require('selenium-webdriver'),
	mocha = require('mocha');
var Builder = seleniumDriver.Builder,
	By = seleniumDriver.By,
	Browser = seleniumDriver.Browser;
var beforeEach = mocha.beforeEach,
	afterEach = mocha.afterEach;

var driver;
chai.request(server)
	.post('/auth/signup')
	.send(fakeUser);
beforeEach(function () {
	driver = new Builder().forBrowser(Browser.CHROME).build();
});
afterEach(function () {
	driver.quit();
});
describe('login', function () {
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/auth/signup')
				.send(fakeUser)
				.end(() => {
					done();
				});
		}, 300);
	});
	it('should login with correct credentials', async function () {

		await driver.get('http:localhost:8080/dashboard/login');
		await driver.findElement(By.name('username')).sendKeys('TarunFake'+timestamp.toString());
		await driver.findElement(By.name('password')).sendKeys('pokemon');
		await driver.findElement(By.className('btn pull-right')).click();
		expect(await driver.findElement(By.id('navbar-xo-icon'))).not.to.be.null;
	});
	it('should not login with incorrect credentials', async function () {

		await driver.get('http:localhost:8080/dashboard/login');
		await driver.findElement(By.name('username')).sendKeys('TarunFake');
		await driver.findElement(By.name('password')).sendKeys('wrongpassword');
		await driver.findElement(By.className('btn pull-right')).click();
		expect(await driver.findElement(By.id('navbar-xo-icon'))).not.to.be.null;
	});

	after((done) => {

		chai.request(server)
			.delete('/api/v1/users/' + fakeUser.user._id)
			.set('x-access-token', fakeUser.token)
			.set('x-key', fakeUser.user._id)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});

});

