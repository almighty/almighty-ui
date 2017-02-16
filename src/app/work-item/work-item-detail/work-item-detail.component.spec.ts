import { AlmUserName } from './../../pipes/alm-user-name.pipe';
import {
  async,
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  tick
} from '@angular/core/testing';

import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'ng2-dropdown';
import { Ng2CompleterModule } from 'ng2-completer';
import { TooltipModule } from 'ng2-bootstrap/components/tooltip';

import { AlmAvatarSize } from './../../pipes/alm-avatar-size.pipe';
import { AlmLinkTarget } from './../../pipes/alm-link-target.pipe';
import { AlmMomentTime } from './../../pipes/alm-moment-time.pipe';
import { AlmSearchHighlight } from './../../pipes/alm-search-highlight.pipe';
import { AlmTrim } from './../../pipes/alm-trim';
import { Broadcaster } from './../../shared/broadcaster.service';
import { Logger } from './../../shared/logger.service';

import { Dialog } from './../../shared-component/dialog/dialog';


import { AlmIconModule } from './../../shared-component/icon/almicon.module';
import { AlmEditableModule } from './../../shared-component/editable/almeditable.module';
import { AlmValidLinkTypes } from './../../pipes/alm-valid-link-types.pipe';
import { AuthenticationService } from './../../auth/authentication.service';
import { IterationModel } from './../../models/iteration.model';
import { IterationService } from './../../iteration/iteration.service';
import { LinkType } from './../../models/link-type';
import { User } from './../../models/user';
import { UserService } from './../../user/user.service';
import { WorkItem } from './../../models/work-item';
import { WorkItemType } from './../work-item-type';
import { WorkItemService } from './../work-item.service';

import { WorkItemLinkComponent } from './work-item-link/work-item-link.component';
import { WorkItemCommentComponent } from './work-item-comment/work-item-comment.component';
import { WorkItemDetailComponent } from './work-item-detail.component';
import { WorkItemLinkTypeFilterByTypeName, WorkItemLinkFilterByTypeName } from './work-item-detail-pipes/work-item-link-filters.pipe';
import { CollapseModule } from 'ng2-bootstrap/components/collapse';

describe('Detailed view and edit a selected work item - ', () => {
  let comp: WorkItemDetailComponent;
  let fixture: ComponentFixture<WorkItemDetailComponent>;
  let el: DebugElement;
  let el1: DebugElement;
  let logger: Logger;
  let fakeWorkItem: WorkItem;
  let fakeWorkItems: WorkItem[] = [];
  let fakeIteration: IterationModel;
  let fakeIterationList: IterationModel[] = [];
  let fakeIterationService: any;
  let fakeUser: User;
  let fakeUserList: User[];
  let fakeWorkItemService: any;
  let fakeAuthService: any;
  let fakeUserService: any;
  let fakeWorkItemTypes: WorkItemType[];
  let fakeWorkItemStates: Object[];
  let fakeWorkItemLinkTypes: LinkType[];

  beforeEach(() => {

    fakeUserList = [
      {
        attributes: {
          fullName: 'WIDCT Example User 0',
          imageURL: 'https://avatars.githubusercontent.com/u/000?v=3'
        },
        id: 'widct-user0'
      }, {
        attributes: {
          fullName: 'WIDCT Example User 1',
          imageURL: 'https://avatars.githubusercontent.com/u/001?v=3'
        },
        id: 'widct-user1'
      }, {
        attributes: {
          fullName: 'WIDCT Example User 2',
          imageURL: 'https://avatars.githubusercontent.com/u/002?v=3'
        },
        id: 'widct-user2'
      }
    ] as User[];

    fakeWorkItem = {
      'attributes': {
        'system.created_at': null,
        'system.description': null,
        'system.remote_item_id': null,
        'system.state': 'new',
        'system.title': 'test1',
        'version': 0
      },
      'id': '1',
      'relationships': {
        'assignees': {
          'data': [{
            'id': 'widct-user2',
            'type': 'identities'
          }]
        },
        'baseType': {
          'data': {
            'id': 'system.userstory',
            'type': 'workitemtypes'
          }
        },
        'creator': {
          'data': {
            'id': 'widct-user2',
            'type': 'identities'
          }
        },
        'comments': {
          'links': {
            'self': '',
            'related': ''
          }
        }
      },
      'type': 'workitems',
      'relationalData': {
        'creator': fakeUserList[0],
        'assignees': [fakeUserList[2]]
      }
    } as WorkItem;

    fakeWorkItems.push(fakeWorkItem);

    fakeIteration = {
      'attributes': {
        'name': 'Iteration 1'
      },
      'type': 'iterations'

    } as IterationModel;

    fakeIterationList.push(fakeIteration);

    fakeWorkItemStates = [
      { option: 'new' },
      { option: 'open' },
      { option: 'in progress' },
      { option: 'resolved' },
      { option: 'closed' }
    ];

    fakeUser = {
      attributes: {
        'fullName': 'WIDCT Example User 2',
        'imageURL': 'https://avatars.githubusercontent.com/u/002?v=3'
      },
      id: 'widct-user2'
    } as User;

    fakeWorkItemTypes = [
      { name: 'system.userstory' },
      { name: 'system.valueproposition' },
      { name: 'system.fundamental' },
      { name: 'system.experience' },
      { name: 'system.feature' },
      { name: 'system.bug' }
    ] as WorkItemType[];

    fakeWorkItemLinkTypes = [
        {
         'id': '4f8d8e8c-ab1c-4396-b725-105aa69a789c',
         'type': 'workitemlinktypes',
         'attributes': {
          'description': 'A test work item can if a the code in a pull request passes the tests.',
          'forward_name': 'story-story',
          'name': 'story-story',
          'reverse_name': 'story by',
          'topology': 'network',
          'version': 0
        },
        // 'id': '40bbdd3d-8b5d-4fd6-ac90-7236b669af04',
        'relationships': {
          'link_category': {
            'data': {
              'id': 'c08d244f-ca36-4943-b12c-1cdab3525f12',
              'type': 'workitemlinkcategories'
            }
          },
          'source_type': {
            'data': {
              'id': 'system.userstory',
              'type': 'workitemtypes'
            }
          },
          'target_type': {
            'data': {
              'id': 'system.userstory',
              'type': 'workitemtypes'
            }
          }
      }
    },
      {
         'id': '9cd02068-d76e-4733-9df8-f18bc39002ee',
         'type': 'workitemlinktypes',
         'attributes': {
          'description': 'A test work item can if a the code in a pull request passes the tests.',
          'forward_name': 'abc-abc',
          'name': 'abc-abc',
          'reverse_name': 'story by',
          'topology': 'network',
          'version': 0
        },
        // 'id': '40bbdd3d-8b5d-4fd6-ac90-7236b669af04',
        'relationships': {
          'link_category': {
            'data': {
              'id': 'c08d244f-ca36-4943-b12c-1cdab3525f12',
              'type': 'workitemlinkcategories'
            }
          },
          'source_type': {
            'data': {
              'id': 'system.userstory',
              'type': 'workitemtypes'
            }
          },
          'target_type': {
            'data': {
              'id': 'system.userstory',
              'type': 'workitemtypes'
            }
          }
      }
    }];


    fakeAuthService = {
      loggedIn: false,

      getToken: function () {
        return '';
      },
      isLoggedIn: function () {
        return this.loggedIn;
      },
      login: function () {
        this.loggedIn = true;
      },

      logout: function () {
        this.loggedIn = false;
      }
    };

    fakeIterationService = {
      getIterations: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeIterationList);
        });
      },
      getSpaces: function () {
        let spaces = [{
          'attributes': {
            'name': 'Project 1'
          },
          'type': 'spaces'
        }];
        return spaces;
      }
    };

    fakeWorkItemService = {
      create: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItem);
        });
      },
      update: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItem);
        });
      },
      getWorkItemTypes: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItemTypes);
        });
      },

      getStatusOptions: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItemStates);
        });
      },

      getWorkItems: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItems);
        });
      },

      getLocallySavedWorkItems: function() {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItems);
        });
      },

      getLinkTypes: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeWorkItemLinkTypes);
        });
      }
    };

    fakeUserService = {
      getUser: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeUser);
        });
      },

      getAllUsers: function () {
        return new Promise((resolve, reject) => {
          resolve(fakeUserList);
        });
      }
    };

  });



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'work-item/list/detail/1', component: WorkItemDetailComponent }
        ]),
        CollapseModule,
        CommonModule,
        TooltipModule,
        DropdownModule,
        Ng2CompleterModule,
        AlmIconModule,
        AlmEditableModule
      ],

      declarations: [
        AlmAvatarSize,
        AlmLinkTarget,
        AlmMomentTime,
        AlmSearchHighlight,
        AlmTrim,
        AlmValidLinkTypes,
        AlmUserName,
        WorkItemCommentComponent,
        WorkItemDetailComponent,
        WorkItemLinkComponent,
        WorkItemLinkTypeFilterByTypeName,
        WorkItemLinkFilterByTypeName
      ],
      providers: [
        Broadcaster,
        Logger,
        Location,
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        {
          provide: IterationService,
          useValue: fakeIterationService
        },
        {
          provide: UserService,
          useValue: fakeUserService
        },
        {
          provide: WorkItemService,
          useValue: fakeWorkItemService
        }
      ]
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(WorkItemDetailComponent);
        comp = fixture.componentInstance;
        comp.users = fakeUserList;
      });
  }));

  it('Page should display work item ID when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-id'));
    expect(el.nativeElement.textContent).toContain(fakeWorkItem.id);
  });

  it('Page should display work item ID when not logged in', () => {
    fakeAuthService.logout();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-id'));
    expect(el.nativeElement.textContent).toContain(fakeWorkItem.id);
  });

  it('Work item ID cannot be edited (change model) ', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-id'));
    comp.workItem.id = 'New ID';
    comp.save();
    expect(el.nativeElement.textContent).not.toEqual(comp.workItem.id);
  });

  it('Work item ID cannot be edited (change html) ', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-id'));
    el.nativeElement.textContent = 'New ID';
    comp.save();
    expect(comp.workItem.id).not.toEqual(el.nativeElement.textContent);
  });

  it('Page should display page title when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-title-click'));
    expect(el.nativeElement.textContent).toContain(fakeWorkItem.attributes['system.title']);
  });

  it('Page should display page title when not logged in', () => {
    fakeAuthService.logout();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-title-ne'));
    expect(el.nativeElement.textContent).toContain(fakeWorkItem.attributes['system.title']);
  });

  it('Edit icon displayed when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('.pficon-edit'));
    expect(el.attributes['id']).toBeDefined();
  });

  it('Edit icon to be undefined when not logged in', () => {
    fakeAuthService.logout();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('.pficon-edit'));
    expect(el).toBeNull();
  });

  it('Page should display non-editable work item title when not logged in', () => {
    fakeAuthService.logout();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-title-ne'));
    expect(el.nativeElement.textContent).toContain(fakeWorkItem.attributes['system.title']);
  });

  it('Page should display clickable work item title when looged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-title-click'));
    expect(el.nativeElement.textContent).toContain(fakeWorkItem.attributes['system.title']);
  });

  it('Page should display editable work item title when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    comp.openHeader();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-title'));
    expect(el.nativeElement.innerText).toContain(fakeWorkItem.attributes['system.title']);
  });

  it('Work item title can be edited when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    comp.openHeader();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-title'));
    comp.workItem.attributes['system.title'] = 'User entered valid work item title';
    fixture.detectChanges();
    comp.save();
    expect(comp.workItem.attributes['system.title']).toContain(el.nativeElement.innerText);
  });

  it('Save should be enabled if a valid work item title has been entered', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    comp.openHeader();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#workItemTitle_btn_save'));
    comp.workItem.attributes['system.title'] = 'Valid work item title';
    fixture.detectChanges();
    comp.save();
    expect(el.classes['disabled']).toBeFalsy();
  });

  it('Save should be disabled if the work item title is blank', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    comp.openHeader();
    fixture.detectChanges();
    comp.titleText = '';
    comp.isValid(comp.titleText);
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#workItemTitle_btn_save'));
    fixture.detectChanges();
    expect(el.classes['disabled']).toBeTruthy();
  });

  it('Work item description can be edited when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    comp.openDescription();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#detail-desc-value'));
    comp.workItem.attributes['system.description'] = 'User entered work item description';
    fixture.detectChanges();
    comp.save();
    expect(comp.workItem.attributes['system.description']).toContain(el.nativeElement.innerHTML);
  });

  it('Work item description cannot be edited when logged out', () => {
    fakeAuthService.logout();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-desc'));
    expect(el.attributes['disabled']);
  });

  // Commenting this out because no type text in the new design

  // it('Work item type can be edited when logged in', () => {
  //   fakeAuthService.login();
  //   fixture.detectChanges();
  //   comp.workItem = fakeWorkItem;
  //   comp.loggedIn = fakeAuthService.isLoggedIn();
  //   fixture.detectChanges();
  //   el = fixture.debugElement.query(By.css('#wi-detail-type'));
  //   comp.workItem.type = 'system.experience';
  //   fixture.detectChanges();
  //   expect(comp.workItem.type).toContain(el.nativeElement.value);
  // });

  it('Work item state can be edited when logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#wi-detail-state'));
    comp.workItem.type = 'resolved';
    fixture.detectChanges();
    expect(comp.workItem.attributes['system.state']).toContain(el.nativeElement.value);
  });

  it('should not open the user list if not logged in', () => {
    comp.activeSearchAssignee();
    fixture.detectChanges();
    expect(comp.searchAssignee).toBeFalsy();
  });

  it('should open the user list if logged in', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    comp.activeSearchAssignee();
    fixture.detectChanges();
    expect(comp.searchAssignee).toBeTruthy();
  });

  it('Page should display correct assignee', () => {
    fakeAuthService.login();
    fixture.detectChanges();
    comp.workItem = fakeWorkItem;
    comp.loggedIn = fakeAuthService.isLoggedIn();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('#WI_details_assigned_user'));
    expect(el.nativeElement.textContent).toContain('WIDCT Example User 2');
  });

   it('page should display correct reporter', () => {
      fakeAuthService.login();
      fixture.detectChanges();
      comp.workItem = fakeWorkItem;
      comp.loggedIn = fakeAuthService.isLoggedIn();
      fixture.detectChanges();
      el = fixture.debugElement.query(By.css('#WI_details_reporter_user'));
      expect(el.nativeElement.textContent).toContain('Example User 0');
  });

   it('Should have a comment section', () => {
      fakeAuthService.login();
      fixture.detectChanges();
      comp.workItem = fakeWorkItem;
      comp.loggedIn = fakeAuthService.isLoggedIn();
      fixture.detectChanges();
      el = fixture.debugElement.query(By.css('#wi-comment'));
      expect(el.nativeElement).toBeTruthy();
  });

});
