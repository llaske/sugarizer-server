//During the test the env variable is set to test
process.env.NODE_ENV = 'test';


const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const { beforeEach, afterEach } = require('mocha');
const {getAPIUrl} = require('../helper/common');
var driver;
beforeEach(async()=>{
    driver = await new Builder().forBrowser(Browser.CHROME).build();
})
afterEach(async()=>{
    await driver.quit();
})
describe('login',async function(){
    it('should login with correct credentials',async function(){
        
        await driver.get(`http:localhost:8080/dashboard/login`);
        await driver.findElement(By.name('username')).sendKeys('teacher1');
        await driver.findElement(By.name('password')).sendKeys('teacher1');
        await driver.findElement(By.className('btn pull-right')).click();
    })

})

