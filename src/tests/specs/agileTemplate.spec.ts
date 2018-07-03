import { browser } from 'protractor';
import { PlannerPage } from '../page_objects/planner';
import * as support from '../support';


describe('Agile template tests: ', () => {
  let planner: PlannerPage;
  let planner1: PlannerPage;

  beforeAll(async () => {
    await support.desktopTestSetup();
    planner = new PlannerPage(browser.baseUrl);
    await planner.openInBrowser();
    let url = await browser.getCurrentUrl();
    let urlPathName: any = await browser.executeScript('return document.location.pathname');
    let URL = url.replace(urlPathName, '/' + process.env.USER_NAME + '/' + process.env.SPACE_NAME_SCRUM + '/plan');
    planner1 = new PlannerPage(URL);
    await browser.get(URL);
    await planner1.waitUntilUrlContains('typegroup');
  });

  beforeEach(async () => {
    await planner1.sidePanel.workItemsGroupAgile.clickWhenReady();
  });

  it('should have workitem types', async () => {
    let wiTypes = await planner1.quickAdd.workItemTypes();
    expect(wiTypes.length).toBe(6);
    expect(wiTypes[0]).toBe('Theme');
    expect(wiTypes[1]).toBe('Epic');
    expect(wiTypes[2]).toBe('Story');
    expect(wiTypes[3]).toBe('Task');
    expect(wiTypes[4]).toBe('Defect');
    expect(wiTypes[5]).toBe('Impediment');
  });

  it('should create a workitem of type defect and update Effort', async () => {
    let newWorkItem = { title: 'Workitem of type Defect', type : 'Defect'};
    await planner1.createWorkItem(newWorkItem);
    expect(planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
    /* Update Effort */
    await planner1.workItemList.clickWorkItem(newWorkItem.title);
    await planner1.quickPreview.updateEffort('3');
    await planner1.quickPreview.effortTextArea.untilTextIsPresentInValue('3');
    expect(await planner1.quickPreview.effortTextArea.getAttribute('value')).toBe('3');
    await planner1.quickPreview.close();
  });

  it('should create a workitem of type Theme and update Business value', async () => {
    let newWorkItem = { title: 'Workitem of type Theme', type : 'Theme'};
    await planner1.createWorkItem(newWorkItem);
    expect(planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
    /* Update Business Value */
    await planner1.workItemList.clickWorkItem(newWorkItem.title);
    await planner1.quickPreview.updateBusinessValue('Business value for this Theme');
    await planner1.quickPreview.businessValue.untilTextIsPresentInValue('Business value for this Theme');
    expect(await planner1.quickPreview.businessValue.getAttribute('value')).toBe('Business value for this Theme');
  });
});
