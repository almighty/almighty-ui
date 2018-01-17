let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

// Validate test config.
function validate_config(){
  if(process.env.NODE_ENV != 'inmemory'){
    // Mysteriously, NODE_ENV is set to "test". NODE_ENV should not have been set to "test"
    // Unset NODE_ENV variable.
    process.env.NODE_ENV = '';
    process.env.SPACE_NAME || throwErr("SPACE_NAME variable not set");
    process.env.USER_NAME || throwErr("USER_NAME variable not set")
    process.env.USER_FULLNAME || throwErr("USER_FULLNAME variable not set")
    process.env.TOKEN || throwErr("TOKEN (Auth token) variable not set");
    process.env.OFFLINE_TOKEN || throwErr("OFFLINE_TOKEN (Refresh token) variable not set");
  }
}

function throwErr(msg){
  throw new Error(msg);
}

validate_config();

exports.config = {
  allScriptsTimeout: 30000,
  useAllAngular2AppRoots: true,
  getPageTimeout: 30000,
  directConnect: process.env.DIRECT_CONNECT === 'true',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./../src/tests/**/*.spec.js'],
  exclude: ['./../src/tests/**/EXCLUDED/*.spec.js'],
  suites: {
      smokeTest: './../src/tests/**/smokeTest.spec.js',
      fullTest:  './../src/tests/**/*.spec.js'
  },
  jasmineNodeOpts: {
      isVerbose: true,
      showColors: true,
      includeStackTrace: true,
      defaultTimeoutInterval: 300000,
      print: function () {
      }
  },
  troubleshoot: true,
  capabilities: {
    'browserName': 'chrome',
    'shardTestFiles': true,
    'maxInstances': 4,
    'loggingPrefs': {
      'driver': 'WARNING',
      'server': 'WARNING',
      'browser': 'INFO'
    },
    'chromeOptions': {
      'args': process.env.HEADLESS_MODE === 'true'? ['--no-sandbox', '--headless'] : ['--no-sandbox']
    }
  },
  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
          displayStacktrace: true,
          displayDuration: true,
      },
      summary: {
          displayDuration: true
      }
    }));
    if (process.env.NODE_ENV == "inmemory") {
      global.PLANNER_URL = browser.baseUrl + '/plan/list'
    } else {
      global.PLANNER_URL = browser.baseUrl + '/' + process.env.USER_NAME + '/' + process.env.SPACE_NAME + '/plan';
    }
    token = encodeURIComponent(JSON.stringify({
      access_token: process.env.TOKEN  || "somerandomtoken",
      expires_in: 1800,
      refresh_token: process.env.OFFLINE_TOKEN || "somerandomtoken",
      token_type: "bearer"
    }));
    global.TOKEN=token;
    // Bypass login by supplying auth and refresh token
    browser.get(browser.baseUrl + "/?token_json=" + token);
  }
};
