/**
 * AlMighty page object example module for work item list page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 * TODO - Complete the page object model pending completion of UI at: http://demo.almighty.io/
 */

'use strict';

/*
 * Work Item List Page Definition
 */

var WorkItemListPage = function (login) {
  if(login==true){
  browser.get("http://localhost:8088/?token=justarandomtokenfortest");}
  else{
    browser.get("http://localhost:8088/");
  }
};

var testSupport = require('./testSupport'),
  WorkItemDetailPage = require('./work-item-detail.page'),
  WorkItemBoardPage = require('./work-item-board.page'),
  CommonPage = require('./common.page'),
  constants = require("./constants");

var until = protractor.ExpectedConditions;

WorkItemListPage.prototype  = Object.create({}, {

/* Page elements - top of the page */

  workItemListButton:  {
    get: function ()
    { return element(by.id("header_menuWorkItemList")); }
  },

  clickWorkItemListButton:   {
    value: function ()
    {
      browser.wait(until.presenceOf(this.workItemListButton), constants.WAIT, 'Failed to find workItemListButton');
      return this.workItemListButton.click(); }
  },

  boardButton:  {
    get: function ()
    { return element(by.id("header_menuBoard")); }
  },

  clickBoardButton:   {
    value: function ()
    {
      this.boardButton.click();
      return new WorkItemBoardPage();
    }
  },

  userToggle:  {
    get: function ()
    { return element(by.id("header_dropdownToggle")); }
  },

  clickUserToggle:   {
    value: function ()
    { return this.userToggle.click(); }
  },

/* Page elements - bottom of the page - work item quick add */

  workItemQuickAddTitle:  {
    get: function ()
    { return element(by.id("exampleInput")); }
  },

  typeQuickAddWorkItemTitle:  {
     value: function (keys)
     {
       browser.wait(until.presenceOf(this.workItemQuickAddTitle), constants.WAIT, 'Failed to find workItemQuickAddTitle');
       return this.workItemQuickAddTitle.sendKeys(keys); }
   },

  workItemQuickAddDesc:  {
    get: function ()
    { return element(by.id("exampleDesc")); }
  },

  typeQuickAddWorkItemDesc:  {
     value: function (keys)
     {
       browser.wait(until.presenceOf(this.workItemQuickAddDesc), constants.WAIT, 'Failed to find workItemQuickAddDesc');
       return this.workItemQuickAddDesc.sendKeys(keys); }
   },

  /* Access the Kebab element relative to its parent workitem */
   clickWorkItemKebabButton:  {
    value: function (parentElement)
    {
      browser.wait(until.presenceOf(parentElement.element(by.id("dropdownKebabRight"))), constants.WAIT, 'Failed to find clickWorkItemKebabButton');
      return parentElement.element(by.id("dropdownKebabRight")).click(); }
  },
  KebabButtonById:  {
    value: function ()
    {
       return element(by.id("dropdownKebabRight")); }
  },
  /*
  Login functions
  */
  clickLoginButton:  {
      value: function ()
      { return element(By.id('header_rightDropdown')).all(By.tagName('a')).get(0).click(); }
    },
  clickLogoutButton:{
    value: function()
    {
      return element(By.xpath('.//*[@id="header_rightDropdown"]/li[5]/a'));
    }
  },
  signInGithub: {
    value: function (gitusername,gitpassword)
    {

       element(By.css('.fa.fa-github')).click();
       browser.ignoreSynchronization = true;
       var until = protractor.ExpectedConditions;
       browser.wait(until.presenceOf(element(by.xpath('.//*[@id="login"]/form/div[3]/div/p'))), 80000, 'Sign into');

       element(By.id('login_field')).sendKeys(gitusername);
       element(By.id('password')).sendKeys(gitpassword);
       return  element(By.css('.btn.btn-primary.btn-block')).click();

     }
  },
 /* Access the Kebab element relative to its parent workitem */
   clickWorkItemKebabDeleteButton:   {
    value: function (parentElement)
    {
      browser.wait(until.presenceOf(parentElement.element(by.css('.workItemList_Delete'))), constants.WAIT, 'Failed to find clickWorkItemKebabButton');
      return parentElement.element(by.css('.workItemList_Delete')).click(); }
  },

  workItemPopUpDeleteConfirmButton:   {
    get: function ()
    { return element(by.buttonText('Confirm')); }
  },

  clickWorkItemPopUpDeleteConfirmButton:   {
    value: function ()
    {
      browser.wait(until.presenceOf(this.workItemPopUpDeleteConfirmButton), constants.WAIT, 'Failed to find workItemPopUpDeleteConfirmButton');
      return this.workItemPopUpDeleteConfirmButton.click(); }
  },

  workItemPopUpDeleteCancelConfirmButton:   {
    get: function ()
    { return element(by.buttonText('Cancel')); }
  },

  clickWorkItemPopUpDeleteCancelConfirmButton:   {
    value: function ()
    {
      browser.wait(until.presenceOf(this.workItemPopUpDeleteCancelConfirmButton), constants.WAIT, 'Failed to find clickWorkItemPopUpDeleteCancelConfirmButton');
      return this.workItemPopUpDeleteCancelConfirmButton.click(); }
  },

//  typeQuickAddWorkItemDescription:  {
//    value: function (keys)
//    {
//      browser.wait(until.presenceOf(this.workItemQuickAddDescription), constants.WAIT, 'Failed to find workItemQuickAddDescription');
//      return this.workItemQuickAddDescription.sendKeys(keys); }
//  },

  openButton:  {
    get: function ()
    { return element(by.css(".workItemQuickAdd_saveBtn")); }
  },
  quickAddbuttonById:   {
    value: function()
    {
      return element(by.id("workItemQuickAdd_container"));
    }
  },
  clickWorkItemQuickAdd:   {
    value: function ()
    {
      browser.wait(until.presenceOf(this.openButton), constants.WAIT, 'Failed to find the open button');
      return this.openButton.click(); }
  },

 saveButton:  {
    get: function ()
    { return element(by.css(".workItemQuickAdd_Add")); }
  },

  clickQuickAddSave:   {
    value: function ()
    {
      browser.wait(until.presenceOf(this.saveButton), constants.WAIT, 'Failed to find the saveButton');
      return this.saveButton.click(); }
  },

  cancelButton:  {
    get: function ()
    { return element(by.id(".workItemQuickAdd_goBackBtn")); }
  },

  clickQuickAddCancel:   {
    value: function ()
    {
      browser.wait(until.presenceOf(this.cancelButton), constants.WAIT, 'Failed to find the cancelButton');
      return this.cancelButton.click(); }
  },

/* Page elements - work item list */

  allWorkItems:  {
    get: function ()
    { return element.all(by.css(".work-item-list-entry")); }
  },

/* xpath = //alm-work-item-list-entry[.//text()[contains(.,'Some Title 6')]]   */
workItemByTitle:  {
    value: function (titleString)
    { return element(by.xpath("//alm-work-item-list-entry[.//text()[contains(.,'" + titleString + "')]]")); }
  },

  firstWorkItem:  {
    get: function ()
    { return element.all(by.css(".work-item-list-entry")).first(); }
  },

  lastWorkItem:  {
    get: function ()
    { return element.all(by.css(".work-item-list-entry")).last(); }
  },

  /* Title element relative to a workitem */
   workItemTitle:  {
    value: function (workItemElement)
    { return workItemElement.element(by.css(".workItemList_title")).getText(); }
  },

  clickWorkItemTitle:   {
    value: function (workItemElement, idText)
    {
      workItemElement.element(by.css(".workItemList_title")).click();
      var theDetailPage = new WorkItemDetailPage (idText);
      var until = protractor.ExpectedConditions;
      //browser.wait(until.presenceOf(theDetailPage.workItemDetailPageTitle), constants.WAIT, 'Detail page title taking too long to appear in the DOM');
      browser.wait(testSupport.waitForText(theDetailPage.clickWorkItemDetailTitle), constants.WAIT, "Title text is still not present");
      return theDetailPage;
    }
  },

  /* Description element relative to a workitem */
  workItemDescription:  {
    value: function (workItemElement)
    { return workItemElement.element(by.css(".workItemList_description")).getText(); }
  },

  workItemByIndex:  {
    value: function (itemNumber)
    { return element.all(by.css(".work-item-list-entry")).get(itemNumber); }
  },

  workItemByNumber:  {
    value: function (itemNumber)
    {
      var xPathString = "workItemList_OuterWrap_" + itemNumber;
      return element(by.id(xPathString));
    }
  },

  kebabByNumber:{
  value: function (itemNumber)
  {
    var XPathString = "workItemList_OuterWrap_" + itemNumber +"/div/div[2]/div";
    return element(by.id(XPathString));
  }
},

  /*
   * To access a work item's view/delete buttons and related fields - example code:
   *
    var parentElement = page.firstWorkItem;
    page.workItemViewButton(parentElement).getText().then(function (text) {
      console.log("text = " + text);
    });
    page.clickWorkItemViewButton(page.workItemViewButton(parentElement));
   *
   */

  workItemViewButton:  {
    value: function (parentElement)
    { return parentElement.element(By.css( ".list-view-pf-main-info" )); }
  },

  workItemViewId:  {
    value: function (parentElement)
    { return parentElement.element(By.css( ".list-view-pf-left.type.workItemList_workItemType" )); }
  },

  workItemViewTitle:  {
    value: function (parentElement)
    { return parentElement.element(By.css( ".list-group-item-heading.workItemList_title" )); }
  },

  workItemViewDescription:  {
    value: function (parentElement)
    { return parentElement.element(By.css( ".list-group-item-text.workItemList_description" )); }
  },

  /*
   * When the Work Item 'View Detail' page is opened, there can be a delay of a few seconds before
   * the page contents are displayed - the browser.wait statement covers this wait for the title
   * of the page - there is a further delay before the values of the elements on the page are displayed.
   */
  clickWorkItemViewButton:   {
    value: function (button, idValue)
    {
      button.click();
      var theDetailPage = new WorkItemDetailPage (idValue);
      var until = protractor.ExpectedConditions;
      browser.wait(until.presenceOf(theDetailPage.workItemDetailPageTitle), constants.WAIT, 'Detail page title taking too long to appear in the DOM');
      browser.wait(testSupport.waitForText(theDetailPage.workItemDetailTitle), constants.WAIT, "Title text is still not present");
      return theDetailPage;
    }
  },

  workItemDeleteButton:  {
    value: function (parentElement)
    { return parentElement.element(By.css( ".btn.btn-default.delete-button.workItemList_deleteListItemBtn" )); }
  },

  clickWorkItemDeleteButton:   {
    value: function (button)
    {
      browser.wait(until.presenceOf(button), constants.WAIT, 'Failed to find the button');
      return button.click(); }
  },

});

module.exports = WorkItemListPage;
