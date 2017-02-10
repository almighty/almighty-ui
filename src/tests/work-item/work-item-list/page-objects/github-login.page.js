/**
 * AlMighty page object example module for Fabric8 start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * Fabric8 Start Page Definition
 */

let testSupport = require('../testSupport');
let constants = require("../constants");
let until = protractor.ExpectedConditions;
let CompleteRegistrationPage = require ("./complete-registration.page");
let Fabric8MainPage = require ("./fabric8-main.page");

class GithubLoginPage {

  constructor() {
  };

  get githubLoginField () {
     return element(by.id("login_field"));
  }

  clickGithubLoginField () {
     return this.githubLoginField.click();
  }

  typeGithubLoginField (usernameString) {
     return this.githubLoginField.sendKeys(usernameString);
  }

  get githubPassword () {
     return element(by.id("password"));
  }

  clickGithubPassword () {
     return this.githubPassword.click();
  }

  typeGithubPassword (passwordString) {
     return this.githubPassword.sendKeys(passwordString);
  }

  get githubLoginButton () {
     return element(by.css(".btn.btn-primary.btn-block"));
  }

  clickGithubLoginButton () {
    browser.wait(until.presenceOf(this.githubLoginButton), constants.WAIT, 'Failed to find github login');
    this.githubLoginButton.click();
//    return new CompleteRegistrationPage();
    return new Fabric8MainPage();
  }

}

module.exports = GithubLoginPage;
