import { browser } from 'protractor';
import { PlannerPage } from '../page_objects/planner';
import * as support from '../support';


describe('Quick preview tests: ', () => {
  let planner: PlannerPage;
  let c = new support.Constants();
  let testData;

  beforeAll(async () => {
    await support.desktopTestSetup();
    planner = new PlannerPage(browser.baseUrl);
    await planner.openInBrowser();
    await planner.waitUntilUrlContains('typegroup');
    testData = await c.browserName[browser.browserName];
  });

  beforeEach(async () => {
    await planner.ready();
    await planner.workItemList.overlay.untilHidden();
  });

  afterEach(async () => {
    await planner.resetState();
  });

  it('should open quickpreview and apply label', async () => {
    let title = await planner.createUniqueWorkItem(),
      label = 'sample_label_1';
    await planner.workItemList.clickWorkItem(title);
    await planner.quickPreview.addLabel(label);
    await planner.detailPage.labelListDiv.untilCount(1);
    expect(await planner.quickPreview.getLabels()).toContain(label);
  });

  it('should open quickpreview and create new label', async () => {
    let workitemname = {'title': 'test labels'},
      newLabel = 'new label';
    await planner.createWorkItem(workitemname);
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.createNewLabel(newLabel);
    await planner.detailPage.labelListDiv.untilCount(1);
    expect(await planner.quickPreview.getLabels()).toContain(newLabel);
  });

  it('should open quickpreview and create new label using Enter Key', async () => {
    let workitemname = {'title': 'text labels'};
    let newLabel = 'Enter Key Label';
    await planner.createWorkItem(workitemname);
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.createNewLabel(newLabel, true);
    expect(await planner.quickPreview.getLabels()).toContain(newLabel);
  });

  it('should link a workitem', async () => {
    let workitemname = {'title': 'link test'},
      linkType = 'blocks';
    await planner.createWorkItem(workitemname);
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.addLink(linkType, testData.searchWorkItem4, testData.Workitem_Title_4);
    await planner.quickPreview.linklistItem.untilTextIsPresent(testData.Workitem_Title_4);
    expect(await planner.quickPreview.getLinkedItems()).toContain(testData.Workitem_Title_4);
  });

  it('should open quick preview and edit the title', async () => {
    let title = await planner.createUniqueWorkItem(),
      editWorkItemTitle1 = 'Title Text "<0>"';
    await planner.workItemList.clickWorkItem(title);
    await planner.quickPreview.updateTitle(editWorkItemTitle1);
    expect(await planner.quickPreview.titleInput.getAttribute('value')).toBe('Title Text "<0>"');
  });

  it('description box should not be open for wis', async () => {
    let workitemname = {'title': 'quickpreview test'},
      workItemTitle2 = 'Workitem_Title_2';
    await planner.createWorkItem(workitemname);
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.openDescriptionBox();
    expect(await planner.quickPreview.isSaveButtonDisplayed()).toBeTruthy();

    // Open another WI(Note: the description box is still in edit mode)
    await planner.workItemList.clickWorkItem(workItemTitle2);
    // The description box should not be in edit mode
    expect(await planner.quickPreview.isSaveButtonDisplayed()).toBeFalsy();
  });

  it('should close assignee dropdown when clicked outside', async () => {
    await planner.workItemList.clickWorkItem('Workitem_Title_2');
    await planner.quickPreview.assigneeDropdown.clickWhenReady();
    expect(await planner.quickPreview.assigneeDropdownMenu.getAttribute('className')).toContain('show');
    await planner.quickPreview.titleInput.clickWhenReady();
    expect(await planner.quickPreview.assigneeDropdownMenu.getAttribute('className')).not.toContain('show');
  });
});
