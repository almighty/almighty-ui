import { browser } from 'protractor';
import { PlannerPage } from '../page_objects/planner';
import * as support from '../support';
import { SidePanel } from './../ui/planner/sidepanel';


describe('Work Item list: ', () => {
  let planner: PlannerPage;
  let planner1: PlannerPage;
  let c = new support.Constants();

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
    await planner1.workItemList.overlay.untilHidden();
    await planner1.sidePanel.workItemsGroupAgile.clickWhenReady();
  });

  it('Should Quick create UnicodeSymbols workitems', async () => {
    let newWorkItem = {
      title: 'Ω≈ç√∫˜µ≤≥÷åß∂ƒ©˙∆˚¬…æœ∑´®†¥¨ˆøπ“‘¡™£¢∞§¶•ªº–≠¸˛Ç◊ı˜Â¯˘¿ÅÍÎÏ˝ÓÔÒÚÆ☃Œ„´‰ˇÁ¨ˆØ∏”’`⁄€‹›ﬁﬂ‡°·‚—±⅛⅜⅝⅞ЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя٠١٢٣٤٥٦٧٨٩'
    };
    await planner1.createWorkItem(newWorkItem);
    expect(await planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
  });

  it('Should Quick Create TwoByteCharacters workitems', async () => {
    let newWorkItem = {
      title: '田中さんにあげて下さいパーティーへ行かないか和製漢語部落格사회과학원 어학연구소찦차를 타고 온 펲시맨과 쑛다리 똠방각하社會科學院語學研'
    };
    await planner1.createWorkItem(newWorkItem);
    expect(await planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
  });

  it('Should Quick Create JapaneseEmoticons workitems', async () => {
    let newWorkItem = {
      title: 'ヽ༼ຈل͜ຈ༽ﾉ ヽ༼ຈل͜ຈ༽ﾉ(｡◕ ∀ ◕｡)｀ｨ(´∀｀∩__ﾛ(,_,*)・(￣∀￣)・:*:ﾟ･✿ヾ╲(｡◕‿◕｡)╱✿･ﾟ,。・:*:・゜’( ☻ ω ☻ )。・:*:・゜’(╯°□°）╯︵ ┻━┻)(ﾉಥ益ಥ）ﾉ﻿ ┻━┻┬─┬ノ( º _ ºノ)( ͡° ͜ʖ ͡°)'
    };
    await planner1.createWorkItem(newWorkItem);
    expect(await planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
  });

  it('Should Quick Create RightToLeftStrings workitems', async () => {
    let newWorkItem = {
      title: 'בְּרֵאשִׁית, בָּרָא אֱלֹהִים, אֵת הַשָּׁמַיִם, וְאֵת הָאָרֶץم نفس سقطت وبالتحديد،, جزيرتي باستخدام أن دنو. إذ هنا؟ الستار وتنصيب كان. أهّل ايطاليا، بريطانيا-فرنسا قد أخذ. سليمان، إتفاقية بين ما'
    };
    await planner1.createWorkItem(newWorkItem);
    expect(await planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
  });

  it('Should Quick Create ScriptInjection workitems', async () => {
    let newWorkItem = {
      title: '<script>alert(123)</script> &lt;script&gt;alert(&#39;123&#39;);&lt;/script&gt; <img src=x onerror=alert(123) /> <svg><script>123<1>alert(123)</script>'
    };
    await planner1.createWorkItem(newWorkItem);
    expect(await planner1.workItemList.hasWorkItem(newWorkItem.title)).toBeTruthy();
  });
});
