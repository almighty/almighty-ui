/**Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 *
 * beforeEach will set the mode to Desktop. Any tests requiring a different resolution will must set explicitly.
 *
 * @author naina-verma
 */

var WorkItemListPage = require('./page-objects/work-item-list.page'),
  testSupport = require('./testSupport'),
  constants = require("./constants"),
  OpenShiftIoRHDLoginPage = require('./page-objects/openshift-io-RHD-login.page');


describe('Iteration CRUD tests :: ', function () {
  var page, AUTH_TOKEN, REFRESH_TOKEN;
  var until = protractor.ExpectedConditions,
    expectedForceActiveLabel = 'Force Active:',    
    updateIterationTitle = 'Update Iteration',
    updateIterationDescription = 'Update Iteration Description',
    childIterationTitle = 'New Child Iteration',
    childIterationDescription = 'New Child Iteration Description';

  beforeEach(function () {
    browser.ignoreSynchronization = false;
    testSupport.setBrowserMode('desktop');
    if (AUTH_TOKEN && REFRESH_TOKEN){
      console.log("AUTH and REFRESH tokens found. Skipping login.")
      page = new WorkItemListPage(this.AUTH_TOKEN, this.REFRESH_TOKEN);
    } else {
      page = new WorkItemListPage()
    }
  });

  /* Simple test for registered user */
  it("should perform - LOGIN", function() {
    /* Login to SUT */
    page.clickLoginButton();
    browser.ignoreSynchronization = true;
    var RHDpage = new OpenShiftIoRHDLoginPage();
    RHDpage.doLogin(browser);
    browser.executeScript("return window.localStorage.getItem('auth_token');").then(function(val) {
      this.AUTH_TOKEN = val;
    });
    browser.executeScript("return window.localStorage.getItem('refresh_token');").then(function(val) {
      this.REFRESH_TOKEN = val
    });
  });

  /* Verify the UI buttons are present */
  it('Verify Iteration add button and label are clickable + dialog label is present', function() {
    expect(page.iterationAddButton().isPresent()).toBe(true);
    page.clickIterationAddButton();
    expect(page.getIterationDialogTitle()).toBe('Create Iteration');
    page.clickCancelIteration();
  });

  /* Verify the helpful message */
 it('Verify Iteration helpbox is showing', function() {
    page.clickIterationAddButton();
    expect(page.getIterationDialogTitle()).toBe('Create Iteration');
    page.clickCreateIteration();
    expect(page.getHelpBoxIteration()).toBe('This field is required.');
  });

  /* Verify setting the fields in a new iteration*/
  it('Verify setting the Iteration title and description fields', function() {
    /* Create a new iteration */ 
    page.clickIterationAddButton();
    page.setIterationTitle(constants.NEW_ITERATION_TITLE, false);
    page.setIterationDescription(constants.NEW_ITERATION_DESCRIPTION, false);

    page.clickCreateIteration();

    /* Verify that the new iteration was successfully added */
    browser.wait(until.presenceOf(page.IterationByName(constants.NEW_ITERATION_TITLE)),
      constants.WAIT,
      'Failed to find iteration with title: ' + constants.NEW_ITERATION_TITLE);
    page.clickIterationKebabByIndex("5");
    page.clickEditIterationKebab();
    expect(page.iterationTitleFromModal.getAttribute('value')).toBe(constants.NEW_ITERATION_TITLE);
    expect(page.iterationDescription.getAttribute('value')).toBe(constants.NEW_ITERATION_DESCRIPTION);
  });

  it('Verify force active button label exists', function() {
    page.clickIterationAddButton();
    expect(page.forceActiveLabel.getText()).toBe(expectedForceActiveLabel);
  });

  it('Verify force active button exists', function(){
    page.clickIterationAddButton();
    expect(page.activeIterationButton.isPresent()).toBe(true);
  });

  it('Verify force active button is clickable', function() {
    page.clickIterationAddButton();
    let old_status = page.activeIterationButtonStatus();
    page.clickActiveIterationButton();
    expect(page.activeIterationButtonStatus()).not.toBe(old_status);
  })

  it('Verify force active button default state is false', function(){
    page.clickIterationAddButton();
    expect(page.activeIterationButtonStatus()).toBeFalsy();
  })

  it('Verify force active button state(true) is preserved', function(){
    page.clickIterationAddButton();
    page.setIterationTitle(constants.NEW_ITERATION_TITLE, false);
    page.setIterationDescription(constants.NEW_ITERATION_DESCRIPTION, false);
    page.clickParentIterationDropDown();
    page.selectParentIterationByName("Iteration_3");

    // Enable active iteration
    page.clickActiveIterationButton();
    // Save iteration
    page.clickCreateIteration();

    /* TODO - Mocking is blocking the creation of new iterations */
    // Reopen the same iteration
//    page.clickIterationKebab(newIteration.Index);
//    page.clickEditIterationKebab();

    // Force active iteration button should be in true state
 //   expect(page.activeIterationButtonStatus()).toBeTruthy();
  })

//  it('Verify force active button state(false) is preserved', function(){
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickEditIterationKebab();
//
//    // Disable active iteration
//    page.clickActiveIterationButton();
//    page.clickCreateIteration();
//
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickEditIterationKebab();
//
//    // Force active iteration button should be in false state
//    expect(page.activeIterationButtonStatus()).toBeFalsy();
//  });

//  /* Query and edit an interation */
//  it('Query/Edit iteration', function() {
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickEditIterationKebab();
//    page.setIterationTitle(updateIterationTitle, false);
//    page.setIterationDescription(updateIterationDescription, false);
//    page.clickCreateIteration();
//    browser.wait(until.presenceOf(page.IterationByName(updateIterationTitle)), constants.WAIT, 'Failed to find iteration with name: ' + updateIterationTitle);
//  });

  it('Associate Workitem from detail page', function() {
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    browser.wait(until.elementToBeClickable(detailPage.workItemStateDropDownButton), constants.WAIT, 'Failed to find workItemStateDropDownButton');
    detailPage.IterationOndetailPage().click();
    detailPage.associateIterationByName("Iteration_3");
    detailPage.saveIteration();
    expect(detailPage.getAssociatedIteration()).toContain("Iteration_3");
    detailPage.clickWorkItemDetailCloseButton();

    // Reopen the same detail page and check changes are saved
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    browser.wait(until.elementToBeClickable(detailPage.workItemStateDropDownButton), constants.WAIT, 'Failed to find workItemStateDropDownButton');
    expect(detailPage.getAssociatedIteration()).toContain("Iteration_3");
    detailPage.clickWorkItemDetailCloseButton();
  });

  it('Re-Associate Workitem from detail page', function() {
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.IterationOndetailPage().click();
    detailPage.associateIterationByName("Iteration_2");
    detailPage.saveIteration();

    // Re - associate
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.IterationOndetailPage().click();
    detailPage.associateIterationByName("Iteration_3");
    detailPage.saveIteration();
    expect(detailPage.getAssociatedIteration()).toContain("Iteration_3");
    detailPage.clickWorkItemDetailCloseButton();
  });

  it('Verify Parent Iteration dropdown is clickable', function() {
    page.clickIterationAddButton();
    expect(page.parentIterationDropDown().isPresent()).toBe(true);
  });

  it('Verify Parent Iteration state preserved', function(){
    page.clickIterationAddButton();
    page.setIterationTitle(constants.NEW_ITERATION_TITLE, false);
    page.clickParentIterationDropDown();
    page.clickCreateIteration();

    /* TODO - Mocking is blocking the creation of new iterations */
    // Re-open
//    page.clickIterationKebab(newIteration.Index);
//    page.clickEditIterationKebab();
//    expect(page.parentIterationDropDown().getAttribute('value')).toBe(firstIteration.shortPath);
  });

//  it('Create a child Iteration', function() {
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickChildIterationKebab();
//    page.setIterationTitle(childIterationTitle, false);
//    page.setIterationDescription(childIterationDescription, false);
//    expect(page.parentIterationDropDown().isPresent()).toBe(true);
//    page.clickParentIterationDropDown();
//    page.selectParentIterationById(firstIteration.ID);
//    page.clickCreateIteration();
//
//    // Verify child iteration exists
//    expect(page.IterationByName(childIterationTitle).isPresent()).toBe(true);
//    // Reopen and verify parent iteration
//    page.clickIterationKebab(newIteration.Index);
//    page.clickEditIterationKebab();
//    expect(page.parentIterationDropDown().getAttribute('value')).toBe(firstIteration.shortPath);
//  });

//  it('Close an active iteration', function(){
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickEditIterationKebab();
//
//    // Verify second iteration is active
//    expect(page.activeIterationButtonStatus()).toBeTruthy();
//    page.clickCancelIteration();
//    // Close the iteration
//    page.clickCloseIterationKebab();
//    page.clickCloseIterationConfirmation();
//
//    // Reopen and verify iteration is closed
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickEditIterationKebab();
//    expect(page.activeIterationButtonStatus()).toBeFalsy();
//  })

//  it('Close an active child Iteration', function() {
//    // Create a child iteration
//    page.clickIterationKebab(firstIteration.Index);
//    page.clickChildIterationKebab();
//    page.setIterationTitle(childIterationTitle, false);
//    page.setIterationDescription(childIterationDescription, false);
//    expect(page.parentIterationDropDown().isPresent()).toBe(true);
//    page.clickParentIterationDropDown();
//    page.selectParentIterationById(firstIteration.ID);
//    page.clickActiveIterationButton()
//    page.clickCreateIteration();
//
//    // Verify child iteration exists
//    expect(page.IterationByName(childIterationTitle).isPresent()).toBe(true);
//    page.clickIterationKebab(newIteration.Index);
//    page.clickCloseIterationKebab();
//    page.clickCloseIterationConfirmation();
//
//    // Reopen and verify child iteration is not active
//    page.clickIterationKebab(newIteration.Index);
//    page.clickEditIterationKebab();
//    expect(page.activeIterationButtonStatus()).toBeFalsy();
//});

//  it('Edit child Iteration', function() {
//    // Create a child iteration
//    page.clickIterationKebab(secondIteration.Index);
//    page.clickChildIterationKebab();
//    page.setIterationTitle(childIterationTitle, false);
//    page.setIterationDescription(childIterationDescription, false);
//    page.clickParentIterationDropDown();
//    page.selectParentIterationById(firstIteration.ID);
//    page.clickCreateIteration();
//
//    // Edit
//    page.clickIterationKebab(newIteration.Index);
//    page.clickEditIterationKebab();
//
//    // Set new title and description
//    page.setIterationTitle(newIteration.Title, false);
//    page.setIterationDescription(newIteration.Description, false);
//    expect(page.parentIterationDropDown().getAttribute('value')).toBe(firstIteration.shortPath);
//    page.clickCreateIteration();
//
//    // Confirm changes are saved
//    page.clickIterationKebab(newIteration.Index);
//    page.clickEditIterationKebab();
//    expect(page.iterationTitleFromModal.getAttribute('value')).toBe(newIteration.Title);
//    expect(page.iterationDescription.getAttribute('value')).toBe(newIteration.Description)
//  });

  /* Verify iteration displays the correct workitem totals as workitems transition new->closed */
  // it( 'Verify counters for workitems within iteration', function() {

  //   /* TODO - Resolve Protractor issue with Angular auto-refresh/synch */
  //   browser.ignoreSynchronization = true;

  //   /* Verify that the iteration has zero workitems associated */
  //   page.clickExpandFutureIterationIcon();
  //   expect(page.getIterationCounter(page.lastFutureIteration).getText()).toBe('0');

  //   /* Associate workitems with an iteration */
  //   associateWithIteration (page, "Title Text 3", "Iteration 4");

  //   /* It was necessary to add this statement as Protractor is not able to
  //      reliably handle screen element refreshing */
  //   page.lastFutureIteration.click();

  //   expect(page.getIterationCounter(page.lastFutureIteration).getText()).toBe('1');

  //   /* Start the iteration */
  //   page.clickIterationKebab("5");
  //   page.clickStartIterationKebab();
  //   page.clickCreateIteration();
    
  //   expect(page.iterationCount.getText()).toBe('0 of 1 completed');
    
  //   setWorkItemStatus (page, "Title Text 3", workitemStatus.Closed);
  //   page.lastFutureIteration.click();
  //   expect(page.iterationCount.getText()).toBe('1 of 1 completed');

  //   /* Start the iteration */
  //   page.clickIterationKebab("1");
  //   page.clickCloseIterationKebab();
  //   page.clickCreateIteration();

  //   /* Verify that the iteration is now considered past */
  //   page.clickExpandPastIterationIcon();
  //   expect(page.firstPastIteration.getText()).toContain("Iteration 4");
  //   expect(page.getIterationCounter(page.lastPastIteration).getText()).toBe('1');   

  // });

  //it('Re-Associate WI with Iteration from Kebab menu', function() {
  //   associateWithIteration (page, "Title Text 3", "Iteration 0");
  //   associateWithIteration (page, "Title Text 3", "Iteration 1");
  //   var detailPage = page.clickWorkItemTitle(page.workItemByTitle('Title Text 3'), 'id2');
  //   expect(detailPage.getAssociatedIteration()).toContain('Iteration 1');
  // });

});

  /* Associate a work item aith an iteration */
  var associateWithIteration = function (thePage, theWorkItemTitle, theIterationTitle) {
    var until = protractor.ExpectedConditions;
    browser.wait(until.elementToBeClickable(thePage.workItemKebabButton(thePage.workItemByTitle(theWorkItemTitle))), constants.WAIT, 'Failed to find workItemKebabButton');
    thePage.clickWorkItemKebabButton(thePage.workItemByTitle(theWorkItemTitle));
    thePage.clickWorkItemKebabAssociateIterationButton(thePage.workItemByTitle(theWorkItemTitle));
    thePage.clickDropDownAssociateIteration(theIterationTitle);
    thePage.clickAssociateSave();
  }

  /* Set the status of a workitem */
  var setWorkItemStatus = function (thePage, theWorkItemTitle, theWorkItemStatus) {
    var until = protractor.ExpectedConditions;
    thePage.workItemViewId(thePage.workItemByTitle(theWorkItemTitle)).getText().then(function (text) {
      var detailPage = thePage.clickWorkItemTitle(theWorkItemTitle);
      browser.wait(until.elementToBeClickable(detailPage.workItemStateDropDownButton), constants.WAIT, 'Failed to find workItemStateDropDownButton');   
      detailPage.clickWorkItemStateDropDownButton();
      browser.wait(until.elementToBeClickable(detailPage.WorkItemStateDropDownList().get(theWorkItemStatus)), constants.WAIT, 'Failed to find workItemStateDropDownButton');   
      detailPage.WorkItemStateDropDownList().get(theWorkItemStatus).click();
      detailPage.clickWorkItemDetailCloseButton();
    });
  }

