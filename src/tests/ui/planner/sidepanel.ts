import { $, browser, by, ElementFinder } from 'protractor';
import * as support from '../../support';
import  *  as ui from './../../ui';
import { WorkItemList } from './workitem-list';

/* restricting workItemGroup values */
type workItemGroup = 'Scenarios' | 'Experiences' | 'Requirements' | 'Work Items';

export class SidePanel extends ui.BaseElement {
  showHideSidePanelButton = new ui.Button(this.$('.f8-planner-sidepanel__toggle'), 'show/hide side panel button');
  scenarioButton = new ui.Clickable(this.element(by.cssContainingText('.f8-planner-group-filter__type', ' Scenarios')), 'Side panel Scenario button');
  experienceButton = new ui.Clickable(this.element(by.cssContainingText('.f8-planner-group-filter__type', ' Experiences')), 'Side panel Experiences button');
  requirementsButton = new ui.Clickable(this.element(by.cssContainingText('.f8-planner-group-filter__type .dib', ' Requirements')), 'Side panel Requirements button');
  workItemsGroupAgile = new ui.Clickable(this.element(by.cssContainingText('.f8-planner-group-filter__type', ' Work Items ')), 'Side panel WorkItem button');
  iterationDiv = new ui.BaseElement(this.$('.f8-planner-itr'), 'Iteration div');
  createIterationButton = new ui.Button(this.iterationDiv.$('#add-iteration-icon'), 'Side panel Add Iteration Button');
  iterationList = new ui.BaseElementArray(this.$$('.f8-planner-itr__tree .f8-planner-itr__name'), 'Iteration list');
  iterationKebab = new ui.Button(this.$('.dropdown-toggle'), 'Side panel Iteration Kebab Dropdown');
  editIteration = new ui.Clickable(this.element(by.cssContainingText('.f8-planner-itr .dropdown.open ul>li', 'Edit')), 'Iteration Dropdown Edit Option');
  iterationHeader = new ui.BaseElementArray(this.$$('.f8-planner-itr-entry__header'), 'iteration header');
  customQuery = new ui.BaseElement(this.$('custom-query'), 'My filters');
  customQueryList = new ui.BaseElementArray(this.$$('.f8-planner-custom-query__list'), ' My filters list');
  deleteCustomQuery = new ui.Clickable(this.element(by.cssContainingText('.f8-palnner-custom-query__kebab.dropdown.open ul>li', 'Delete')), 'Custom query Dropdown Delete Option');
  infotipIconExperience = new ui.Clickable(this.$('.infotip-group-type-44795662-db7a-44f7-a4e7-c6d41d3eff27'));
  infotipIconRequirement = new ui.Clickable(this.$('.infotip-group-type-6d254168-6937-447f-a093-0c38404bd072'));
  infotipPopover =  new ui.BaseElementArray(this.$$('.pficon-close'));
  workItemList = new WorkItemList($('alm-work-item-list'));

  constructor(ele: ElementFinder, name: string = 'WorkItem List page Side Panel') {
    super(ele, name);
  }

  async ready() {
    support.debug('... check if Side panel is Ready');
    await super.ready();
    await this.showHideSidePanelButton.ready();
    if ((browser.browserName) === 'browserSDD') {
      await this.scenarioButton.ready();
      await this.experienceButton.ready();
      await this.requirementsButton.ready();
    } else if ((browser.browserName) === 'browserAgile') {
      await this.workItemsGroupAgile.ready();
    }
    await this.createIterationButton.ready();
    support.debug('... check if Side panel is Ready - OK');
  }

  async clickWorkItemGroup(group: workItemGroup) {
    switch (group) {
      case 'Scenarios' :
        await this.scenarioButton.clickWhenReady(); break;
      case 'Experiences':
        await this.experienceButton.clickWhenReady(); break;
      case 'Requirements':
        await this.requirementsButton.clickWhenReady(); break;
      case 'Work Items':
        await this.workItemsGroupAgile.clickWhenReady(); break;
      default:
        support.debug('Work Item group not defined'); break;
    }
    await this.workItemList.overlay.untilHidden();
  }

  async createNewIteration() {
    await this.createIterationButton.clickWhenReady();
  }

  async getIterationList(): Promise<String[]> {
    await this.ready();
    let iterationString = await this.iterationList.getTextWhenReady();
    let iterationList = iterationString.toString().split(',');
    this.debug('iterationList : ' + iterationList);
    return iterationList;
  }

  async selectIterationKebab(iterationName: string) {
    return this.element(by.xpath("//iteration-list-entry[.//span[text()='" + iterationName + "']]")).$('.dropdown-toggle').click();
  }

  async openIterationDialogue() {
    await this.editIteration.clickWhenReady();
  }

  async getIterationDate(): Promise<String> {
    await this.ready();
    let iterationList = await this.iterationHeader.getTextWhenReady();
    let iterationList1 = iterationList.toString().replace('\n', '');
    return iterationList1;
  }

  async clickExpander(iterationName: string) {
    await this.element(by.xpath("//iteration-list-entry[.//span[text()='" + iterationName + "']]")).$('.fa-angle-right').click();
  }

  async getMyFiltersList(): Promise<String[]> {
    await this.customQuery.ready();
    let myFilterString = await this.customQueryList.getTextWhenReady();
    let myFilterList = myFilterString.toString().split(',');
    await this.debug('My Query list : ' + myFilterList);
    return myFilterList;
  }

  async selectcustomFilterKebab(queryName: string) {
    return this.element(by.xpath("//li[contains(@class,'f8-planner-custom-query__list')][.//span[text()='" + queryName + "']]")).$('.dropdown-toggle').click();
  }

  async clickIteration(iterationName: string) {
    let iteration = new ui.BaseElement(this.element(by.xpath("//iteration-list-entry[.//span[text()='" + iterationName + "']]")));
    await iteration.clickWhenReady();
  }
}
