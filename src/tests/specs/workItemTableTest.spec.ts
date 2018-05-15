import { browser } from 'protractor';
import { PlannerPage } from '../page_objects/planner';
import { SidePanel } from './../ui/planner/sidepanel';
import * as support from '../support';


describe('Work Item datatable list: ', () => {
  let planner: PlannerPage;
  let c = new support.Constants();

  beforeAll( async () => {
    await support.desktopTestSetup();
    planner = new PlannerPage(browser.baseUrl);
    await planner.openInBrowser();
    await planner.waitUntilUrlContains('typegroup');
    await planner.ready();
  });

  beforeEach( async () => {
    await planner.resetState();
  });

  it('should open settings button and hide columns', async () => {
    expect(await planner.workItemList.getDataTableHeaderCellCount()).toBe(9);
    await planner.settings.clickSettings();
    await planner.settings.selectAttribute(c.attribute1);
    await planner.settings.moveToAvailableAttribute();
    expect(await planner.workItemList.getDataTableHeaderCellCount()).toBe(8);
    await planner.settings.clickSettings();    
    await planner.settings.selectAttribute(c.attribute1);
    await planner.settings.moveToDisplayedAttribute();
    expect(await planner.workItemList.getDataTableHeaderCellCount()).toBe(9);
  });

  it('quick add should be disable for flat view', async() => {
    await planner.header.clickShowTree();
    await browser.sleep(2000);
    await planner.workItemList.overlay.untilHidden();
    expect(await planner.workItemList.getInlineQuickAddClass(c.workItemTitle1)).toContain('disable');
    await planner.header.clickShowTree();
    await planner.workItemList.overlay.untilHidden();    
  });

  // This test doesn't work on mock data. Hence, skip it.
  // It should work against real database. 
  xit('should filter work item by type', async() => {
    await planner.header.selectFilter(c.attribute2, c.label2);
  });

  it('hideTree and create a work item then work item should be displayed when show tree is selected', async () => {
    let newWorkItem1 = {"title" : 'New WorkItem'};

    await planner.header.clickShowTree();
    await planner.workItemList.overlay.untilHidden();    
    await planner.createWorkItem(newWorkItem1);
    expect(await planner.workItemList.hasWorkItem(newWorkItem1.title)).toBeTruthy();
    await planner.quickPreview.notificationToast.untilHidden();
    await planner.header.clickShowTree();
    expect(await planner.workItemList.hasWorkItem(newWorkItem1.title)).toBeTruthy();
  });

  it('check show completed and create a work item then update status to closed and uncheck show completed then work item should not visible in list', async() => {
    await planner.header.clickShowCompleted();
    await planner.workItemList.overlay.untilHidden();
    let newWorkItem = {
      title: 'Check for show complete work item'
    };
    await planner.createWorkItem(newWorkItem);
    expect(await planner.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
    await planner.workItemList.clickWorkItem(newWorkItem.title);
    await planner.quickPreview.changeStateTo('closed');
    await planner.quickPreview.notificationToast.untilHidden();    
    await planner.quickPreview.close();
    await planner.header.clickShowCompleted();
    await planner.workItemList.overlay.untilHidden();
    expect(await planner.workItemList.hasWorkItem(newWorkItem.title)).toBeFalsy();
  });

  it('work item should show updated title when switching from flat to tree view', async() => {
    let updatedWorkItem = {
      title: 'test show updated work item'
    };
    
    await planner.workItemList.ready();    
    await planner.header.clickShowTree();
    await planner.workItemList.clickWorkItem(c.workItemTitle1);
    await planner.quickPreview.updateTitle(updatedWorkItem.title);
    await planner.quickPreview.notificationToast.untilHidden();    
    await planner.quickPreview.close();
    expect(await planner.workItemList.hasWorkItem(updatedWorkItem.title)).toBeTruthy();    
    await planner.header.clickShowTree();
    await planner.workItemList.overlay.untilHidden();
    expect(await planner.workItemList.hasWorkItem(updatedWorkItem.title)).toBeTruthy();
  });

  it('list should not update when new label is added', async() => {
    await planner.workItemList.workItem(c.workItemTitle7).clickExpandWorkItem();
    await browser.sleep(3000);
    expect(await planner.workItemList.hasWorkItem(c.workItemTitle13)).toBeTruthy();
    await planner.workItemList.clickWorkItem(c.workItemTitle7);
    await planner.quickPreview.createNewLabel(c.newLabel1);
    await planner.quickPreview.close();    
    await browser.sleep(3000);
    expect(await planner.workItemList.hasWorkItem(c.workItemTitle13)).toBeTruthy();
    await planner.workItemList.workItem(c.workItemTitle7).clickExpandWorkItem();    
  });

  it('list should not update when new iteration is added', async() => {
    await planner.workItemList.workItem(c.workItemTitle7).clickExpandWorkItem();
    await browser.sleep(3000);
    expect(await planner.workItemList.hasWorkItem(c.workItemTitle13)).toBeTruthy();
    await planner.sidePanel.createNewIteration();
    await planner.iteration.addNewIteration(c.newIteration1, c.iteration3);
    await planner.iteration.clickCreateIteration();    
    expect(await planner.workItemList.hasWorkItem(c.workItemTitle13)).toBeTruthy();
  });
  
  it('matching child should be expanded initially', async() => {
    let workitemname = {"title": "child", "type": 'Bug'};
    await planner.sidePanel.clickRequirement();
    await planner.workItemList.workItem(c.workItemTitle17).clickInlineQuickAdd();
    await planner.createInlineWorkItem(workitemname);
    await planner.quickPreview.notificationToast.untilHidden();
    await planner.sidePanel.clickScenarios();
    await planner.waitUntilUrlContains('typegroup.name:Scenarios');
    await planner.sidePanel.clickRequirement();
    await planner.waitUntilUrlContains('typegroup.name:Requirements');
    await planner.workItemList.overlay.untilAbsent();
    expect(await planner.workItemList.hasWorkItem(workitemname.title)).toBeTruthy();
  });

  it('clicking on label should filter the workitem list by label', async() => {
    let labelFilter = 'label: '+c.label2;
    await planner.workItemList.clickWorkItemLabel(c.workItemTitle7);
    expect(await planner.header.getFilterConditions()).toContain(labelFilter);
    await planner.header.clickShowTree();
    expect(await planner.header.getFilterConditions()).toContain(labelFilter);
  });

  it('should update the workitem List on workitem edit', async() => {
    let workitem = {'title': 'TITLE_TEXT'};
    await planner.header.selectFilter('State', 'new');
    await planner.createWorkItem(workitem);
    await planner.workItemList.clickWorkItem(workitem.title);
    await planner.quickPreview.changeStateTo('open');
    await planner.quickPreview.notificationToast.untilCount(1);
    await planner.quickPreview.notificationToast.untilHidden();
    await planner.quickPreview.close();
    expect(await planner.workItemList.isTitleTextBold(workitem.title)).not.toContain('bold');
  });

  it('should make the title bold based on filter when adding a new workitem', async() => {
    let workitem = {'title': 'Scenario'};
    await planner.header.selectFilter('State', 'new');
    await planner.createWorkItem(workitem);
    expect(await planner.workItemList.hasWorkItem(workitem.title)).toBeTruthy();
    expect(await planner.workItemList.isTitleTextBold(workitem.title)).toContain('bold');
  });

  it('should filter the workitem list by Assignee', async() => {
    let labelFilter = 'assignee: Unassigned';
    await planner.workItemList.overlay.untilHidden();
    let countUnassignedWorkItem = await planner.workItemList.getUnassignedWorkItemCount(' Unassigned ');
    await planner.header.selectFilter('Assignee', 'Unassigned');
    await planner.workItemList.overlay.untilHidden();
    await browser.sleep(1000);
    expect(await planner.header.getFilterConditions()).toContain(labelFilter);
    expect(await planner.workItemList.datatableRow.count()).toEqual(countUnassignedWorkItem);
  });
});
