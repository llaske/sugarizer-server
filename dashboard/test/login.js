//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const expect  = require('chai').expect;
var seleniumDriver = require('selenium-webdriver'),
	mocha = require('mocha');
var Builder = seleniumDriver.Builder,
	By = seleniumDriver.By,
	Browser = seleniumDriver.Browser;
var beforeEach = mocha.beforeEach,
	afterEach = mocha.afterEach;

var driver;
beforeEach(function(){
	driver = new Builder().forBrowser(Browser.CHROME).build();
});
afterEach(function(){
	driver.quit();
});
describe('login', function(){
	it('should login with correct credentials',async function() {
        
		await driver.get('http:localhost:8080/dashboard/login');
		await driver.findElement(By.name('username')).sendKeys('teacher1');
		await driver.findElement(By.name('password')).sendKeys('teacher1');
		await driver.findElement(By.className('btn pull-right')).click();
		expect(await driver.findElement(By.id('navbar-xo-icon'))).not.to.be.null;
	});
	it('should not login with incorrect credentials',async function() {
        
		await driver.get('http:localhost:8080/dashboard/login');
		await driver.findElement(By.name('username')).sendKeys('teacher');
		await driver.findElement(By.name('password')).sendKeys('teacher');
		await driver.findElement(By.className('btn pull-right')).click();
		expect(await driver.findElement(By.id('navbar-xo-icon'))).not.to.be.null;
	});

});

