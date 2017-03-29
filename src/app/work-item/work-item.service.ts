import { HttpService } from './../shared/http-service';
import { Injectable, Component, Inject } from '@angular/core';
import { Headers } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { cloneDeep } from 'lodash';
import { DropdownOption } from 'ngx-widgets';
import { Broadcaster, Logger } from 'ngx-base';
import {
  AuthenticationService,
  User,
  UserService
} from 'ngx-login-client';
import { Space, Spaces } from 'ngx-fabric8-wit';
import { WIT_API_URL } from 'ngx-fabric8-wit';

import {
  Comment,
  Comments,
  CommentPost
} from '../models/comment';

import { AreaModel } from '../models/area.model';
import { AreaService } from '../area/area.service';
import { IterationModel } from '../models/iteration.model';
import { IterationService } from '../iteration/iteration.service';
import { LinkType } from '../models/link-type';
import { Link } from '../models/link';
import {
  LinkDict,
  WorkItem,
  WorkItemAttributes
} from '../models/work-item';
import { WorkItemType } from './../models/work-item-type';

@Injectable()
export class WorkItemService {

  private workItemUrl: string = null;
  private workItemTypeUrl: string = null;
  private linkTypesUrl: string = null;
  private linksUrl: string = null;
  private reorderUrl: string = null;
  private baseSearchUrl: string = null;
  private renderUrl: string = null;

  private headers = new Headers({'Content-Type': 'application/json'});
  private availableStates: DropdownOption[] = [];
  public workItemTypes: WorkItemType[] = [];

  // FIXME: this is the live list of work items, held in this instance of
  // workItemService. This prevents us from displaying two different lists of WIs.
  // This might have to change in the future.
  private workItems: WorkItem[] = [];
  private nextLink: string = null;
  private initialWorkItemFetchDone = false;
  private userIdMap = {};
  private workItemIdIndexMap = {};
  private prevFilters: any = [];
  private iterations: IterationModel[] = [];
  public _currentSpace;

  constructor(private http: HttpService,
    private broadcaster: Broadcaster,
    private logger: Logger,
    private areaService: AreaService,
    private auth: AuthenticationService,
    private iterationService: IterationService,
    private userService: UserService,
    private spaces: Spaces,
    @Inject(WIT_API_URL) private baseApiUrl: string)
  {
    this.spaces.current.subscribe(val => this._currentSpace = val);
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
  }

  // switchSpace(space: Space) {
  //   this.logger.log('[WorkItemService] New Space selected: ' + space.name);
  //   this.workItemUrl = space.spaceBaseUrl + 'workitems';
  //   this.workItemTypeUrl = space.spaceBaseUrl + 'workitemtypes';
  //   this.linkTypesUrl = space.spaceBaseUrl + 'workitemlinktypes';
  //   this.linksUrl = space.spaceBaseUrl + 'workitemlinks';
  //   this.reorderUrl = space.spaceBaseUrl + 'workitems/reorder';
  //   this.baseSearchUrl = space.spaceBaseUrl + 'search?q=';
  //   this.renderUrl = space.spaceBaseUrl + 'render';
  //   this.logger.log('WorkItemService using url ' + this.workItemUrl);
  // }

  getChildren(parent: WorkItem): Observable<WorkItem[]> {
    if (parent.relationships.childs) {
      this.logger.log('Requesting children for work item ' + parent.id);
      let url = parent.relationships.childs.links.related;
      return this.http
        .get(url, { headers: this.headers })
        .map(response => {
          let wItems: WorkItem[];
          wItems = response.json().data as WorkItem[];
          wItems.forEach((item) => {
            // Resolve the assignee and creator
            this.resolveUsersForWorkItem(item);
            this.resolveIterationForWorkItem(item);
            this.resolveType(item);
            this.resolveAreaForWorkItem(item);
          });
          return wItems;
        });
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    } else {
      this.logger.log('Work item does not have child related link, skipping: ' + parent.id);
      return Observable.of([]);
    }
  }

  getWorkItems(pageSize: number = 20, filters: any[] = []): Observable<{workItems: WorkItem[], nextLink: string | null}> {
    if (this._currentSpace) {
      this.workItemUrl = this._currentSpace.links.self + '/workitems';
      let url = this.workItemUrl + '?page[limit]=' + pageSize;
      filters.forEach((item) => {
        if (item.active) {
          url += '&' + item.paramKey + '=' + item.value;
        }
      });
      return this.http.get(url)
        .map((resp) => {
          return {
            workItems: resp.json().data as WorkItem[],
            nextLink: resp.json().links.next
          };
        });
    } else {
      return Observable.of<{workItems: WorkItem[], nextLink: string | null}>( {workItems: [] as WorkItem[], nextLink: null} );
    }
  }

  /**
   * This function is called from next page onwards in the scroll
   * It does pretty much same as the getWorkItems function
   */
  getMoreWorkItems(url): Observable<{workItems: WorkItem[], nextLink: string | null}> {
    if (url) {
      return this.http.get(url)
        .map((resp) => {
          return {
            workItems: resp.json().data as WorkItem[],
            nextLink: resp.json().links.next
          };
        });
    } else {
      return Observable.throw('No more item found');
    }
  }


  resolveWorkItems(workItems, iterations, users, wiTypes): WorkItem[] {
    let resolvedWorkItems = workItems.map((item) => {
      // Resolve assignnees
      let assignees = item.relationships.assignees.data ? cloneDeep(item.relationships.assignees.data) : [];
      item.relationships.assignees.data = assignees.map((assignee) => {
        return users.find((user) => user.id === assignee.id) || assignee;
      });

      // Resolve creator
      let creator = cloneDeep(item.relationships.creator.data);
      item.relationships.creator.data = users.find((user) => user.id === creator.id) || creator;

      // Resolve iteration
      let iteration = cloneDeep(item.relationships.iteration.data);
      if (iteration) {
        item.relationships.iteration.data = iterations.find((it) => it.id === iteration.id) || iteration;
      }

      // Resolve work item types
      let wiType = cloneDeep(item.relationships.baseType.data);
      if (wiType) {
        item.relationships.baseType.data = wiTypes.find((type) => type.id === wiType.id) || wiType;
      }
      return item;
    });
    return resolvedWorkItems;
  }


  // Reset work item big list
  resetWorkItemList() {
    this.workItems = [];
    this.workItemIdIndexMap = {};
  }

  isListLoaded() {
    return !!this.workItems.length;
  }

  getNextLink(): string {
    return this.nextLink;
  }

  setNextLink(link: string): void {
    this.nextLink = link;
  }

  /**
   * Usage: This method gives a single work item by ID.
   * If the item is locally available then it just resolves the comments
   * else it fetches that item from the cloud and then resolves the comments
   * then update the big list of work WorkItem
   *
   * @param: number - id
   */
  getWorkItemById(id: string): Observable<WorkItem> {
    if (this._currentSpace) {
      return this.http.get(this._currentSpace.links.self + '/workitems/' + id)
        .map(item => item.json().data);
    } else {
      return Observable.of<WorkItem>( {} as WorkItem );
    }
  }

  /**
   * Usage: to check if the workitem match with current filter or not.
   * @param WorkItem - workItem
   * @returns Boolean
   */
  doesMatchCurrentFilter(workItem: WorkItem): Boolean {
    if (this.prevFilters.length) {
      for (let i = 0; i < this.prevFilters.length; i++) {
        // In case of assignee filter
        if (this.prevFilters[i].id === 1 && this.prevFilters[i].active) {
          if (!workItem.relationships.assignees.data // If un-assigned
              || workItem.relationships.assignees.data.findIndex(item => item.id == this.prevFilters[i].value) === -1 // If assignee is not current
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Usage: to update the big list of workItem with new data
   * Existing item will be updated only with attributes
   * New item will be added to the list
   */
  updateWorkItemBigList(wItems: WorkItem[]): void {
    wItems.forEach((wItem) => {
      if (wItem.id in this.workItemIdIndexMap) {
        this.workItems[this.workItemIdIndexMap[wItem.id]].attributes =
          cloneDeep(wItem.attributes);
      } else {
        this.workItems
          .splice(this.workItems.length, this.workItems.length, wItem);
      }
    });
    // Re-build the map once done updating the list
    this.buildWorkItemIdIndexMap();
  }

  /**
   * Usage: Build the workItem ID-Index map for the big list
   */
  buildWorkItemIdIndexMap() {
    this.workItemIdIndexMap = {};
    this.workItems.forEach((wItem, index) =>
      this.workItemIdIndexMap[wItem.id] = index);
  }


  /**
   * Usage: To resolve the users in eact WorkItem
   * For now it resolves assignne and creator
   */
  resolveUsersForWorkItem(workItem: WorkItem): void {
    if (!workItem.hasOwnProperty('relationalData')) {
      workItem.relationalData = {};
    }
    this.resolveAssignee(workItem);
    this.resolveCreator(workItem);
  }

  /**
   * Usage: Resolve the list of assignees for a WorkItem
   */
  resolveAssignee(workItem: WorkItem): void {
    workItem.relationalData.assignees = [];
    if (!workItem.relationships.hasOwnProperty('assignees') || !workItem.relationships.assignees) {
      return;
    }
    if (!workItem.relationships.assignees.hasOwnProperty('data')) {
      return;
    }
    if (!workItem.relationships.assignees.data || !workItem.relationships.assignees.data.length) {
      return;
    }
    workItem.relationships.assignees.data.forEach((assignee) => {
      workItem.relationalData.assignees.push(this.getUserById(assignee.id));
    });
  }

  resolveAssignees(assignees: any): Observable<User[]> {
    if (Object.keys(assignees).length) {
      let observableBatch = assignees.data.map((assignee) => {
        return this.http.get(assignee.links.self)
                .map((res) => res.json().data);
      });
      return Observable.forkJoin(observableBatch);
    } else {
      return Observable.of([]);
    }
  }

  resolveCreator2(creator): Observable<User>{
    if (Object.keys(creator).length) {
      let creatorLink = creator.data.links.self;
      return this.http.get(creatorLink)
        .map(creator => creator.json().data);
    } else {
      return Observable.of(creator);
    }
  }

  /**
   * Usage: Resolve the creator for a WorkItem
   */
  resolveCreator(workItem: WorkItem): void {
    if (!workItem.relationships.hasOwnProperty('creator') || !workItem.relationships.creator) {
      workItem.relationalData.creator = null;
      return;
    }
    if (!workItem.relationships.creator.hasOwnProperty('data')) {
      workItem.relationalData.creator = null;
      return;
    }
    if (!workItem.relationships.creator.data) {
      workItem.relationalData.creator = null;
      return;
    }
    // To handle some old items with no creator
    if (workItem.relationships.creator.data.id === 'me') {
      workItem.relationalData.creator = null;
      return;
    }
    workItem.relationalData.creator = this.getUserById(workItem.relationships.creator.data.id);
  }

  /**
   * Usage: Resolve the wi type for a WorkItem
   */
  resolveType(workItem: WorkItem): void {
    this.getWorkItemTypesById(workItem.relationships.baseType.data.id)
      .subscribe((type: WorkItemType) => {
        workItem.relationships.baseType.data = type;
    });
  }


  /**
   * Usage: To resolve the users in eact WorkItem
   * For now it resolves assignne and creator
   */
  resolveIterationForWorkItem(workItem: WorkItem): void {
    if (!workItem.hasOwnProperty('relationalData')) {
      workItem.relationalData = {};
    }
    if (!workItem.relationships.hasOwnProperty('iteration') || !workItem.relationships.iteration) {
      workItem.relationalData.iteration = null;
      return;
    }
    if (!workItem.relationships.iteration.hasOwnProperty('data')) {
      workItem.relationalData.iteration = null;
      return;
    }
    if (!workItem.relationships.iteration.data) {
      workItem.relationalData.iteration = null;
      return;
    }
    this.getIterationById(workItem.relationships.iteration.data.id)
      .subscribe((iteration) => workItem.relationalData.iteration = iteration);
  }

  /**
   * Usage: To resolve the areas in eact WorkItem
   * For now it resolves assignne and creator
   */
  resolveAreaForWorkItem(workItem: WorkItem): void {
    if (!workItem.hasOwnProperty('relationalData')) {
      workItem.relationalData = {};
    }
    if (!workItem.relationships.hasOwnProperty('area') || !workItem.relationships.area) {
      workItem.relationalData.area = null;
      return;
    }
    if (!workItem.relationships.area.hasOwnProperty('data')) {
      workItem.relationalData.area = null;
      return;
    }
    if (!workItem.relationships.area.data) {
      workItem.relationalData.area = null;
      return;
    }
    this.getAreaById(workItem.relationships.area.data.id)
      .subscribe((area) => workItem.relationalData.area = area);
  }

  /**
   * Usage: Build a ID-User map to dynamically access list of users
   * This method takes the locally saved list of users from User Service
   * Before coming to this method we fetch the list of users using router resolver
   * in detail and list component.
   */
  buildUserIdMap(): void {
    // Fetch the current updated locally saved user list
    let users: User[] = this.userService.getLocallySavedUsers() as User[];
    // Check if the map is putdated or not and if yes then rebuild it
    if (Object.keys(this.userIdMap).length < users.length) {
      this.userIdMap = {};
      users.forEach((user) => {
        this.userIdMap[user.id] = user;
      });
    }
  }

  /**
   * Usage: Fetch an use by it's ID from the User-ID map
   */
  getUserById(userId: string): User {
    if (userId in this.userIdMap) {
      return this.userIdMap[userId];
    } else {
      return null;
    }
  }

  /**
   * Usage: Fetch an area by it's ID from the areas list
   */
  getAreaById(areaId: string): Observable<AreaModel> {
    return this.areaService.getAreas().map((areas) => {
      return areas.find(item => item.id == areaId);
    });
  }

  /**
   * Usage: Fetch an iteration by it's ID from the iterations list
   */
  getIterationById(iterationId: string): Observable<IterationModel> {
    return this.iterationService.getIterations().map((iterations) => {
      return iterations.find(item => item.id == iterationId);
    });
  }

  /**
   * This is to fetch locally fetched work items
   * this will eventually be deprecated once work item
   * linking is re-worked
   */
  getLocallySavedWorkItems(): Observable<any> {
    return Observable.of(this.workItems);
  }

  /**
   * Usage: This method is to resolve the comments for a work item
   * This method is only called when a single item is fetched for the
   * details page.
   *
   * @param: WorkItem - wItem
   */
  resolveComments(url: string): Observable<any> {
      return this.http
        .get(url, { headers: this.headers })
        .map(response => {
          return { data: response.json().data };
        });
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
  }

  /**
   * Usage: This method is to resolve the linked items for a work item
   * This method is only called when a single item is fetched for the
   * details page.
   *
   * @param: WorkItem - wItem
   */
  resolveLinks(url: string): Observable<any> {
    return this.http
      .get(url, { headers: this.headers })
      .map(response => [response.json().data as Link[], response.json().included]);
      // .catch ((e) => {
      //   if (e.status === 401) {
      //     this.auth.logout();
      //   } else {
      //     wItem.relationalData.linkDicts = [];
      //     this.handleError(e);
      //   }
      // });
  }

  /**
   * Usage: This method is to fetch the work item types
   * This method will be deprecated and types will come from
   * router resolver
   * ToDo: Use router resolver to fetch types here
   */
  getWorkItemTypes(): Observable<any[]> {
    if (this._currentSpace) {
      this.workItemTypeUrl = this._currentSpace.links.self + '/workitemtypes';
      return this.http
        .get(this.workItemTypeUrl)
        .map((response) => {
          this.workItemTypes = response.json().data as WorkItemType[];
          return this.workItemTypes;
        });
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    } else {
      return Observable.of<WorkItemType[]>( [] as WorkItemType[] );
    }
  }

  /**
   * Usage: This method is to fetch the work item types by ID
   */

  getWorkItemTypesById(id: string): Observable<WorkItemType> {
    if (this._currentSpace && typeof(id) !== 'undefined') {
      let workItemType = this.workItemTypes ? this.workItemTypes.find((type) => type.id === id) : null;
      if (workItemType) {
        return Observable.of(workItemType);
      } else {
        let workItemTypeUrl = this._currentSpace.links.self + '/workitemtypes/' + id;
        return this.http.get(workItemTypeUrl)
          .map((response) => {
            workItemType = response.json().data as WorkItemType;
            if (this.workItemTypes) {
              let existingType = this.workItemTypes.find((type) => type.id === workItemType.id);
              if (existingType) {
                existingType = workItemType;
              } else {
                this.workItemTypes.push(workItemType);
              }
            }
            return workItemType;
          });
      }
    } else {
      return Observable.of<WorkItemType>( {} as WorkItemType );
    }
  }

  /**
   * Usage: This method is to fetch the work item states
   * This method will be deprecated and states will come from
   * router resolver
   * ToDo: Use router resolver to fetch states here
   */
  getStatusOptions(): Observable<any[]> {
    if (this.availableStates.length) {
      return Observable.of(this.availableStates);
    } else {
      return this.getWorkItemTypes()
        .map((response) => {
          this.availableStates = response[0].attributes.fields['system.state'].type.values.map((item: string, index: number) => {
            return {
              option: item,
            };
          });
          return this.availableStates;
        });
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    }
  }

  /**
   * Usage: This method is to move an item over the list
   * ToDo: Integrate backend when available, also move by one
   * place should be implemented
   */
  moveItem(wi: WorkItem, dir: String): Promise<any> {
    let index = this.workItems.findIndex(x => x.id == wi.id);
    switch (dir){
      case 'top':
        //move the item as the first item
        this.workItems.splice(0, 0, wi);
        //remove the duplicate element
        this.workItems.splice( index + 1, 1);
        this.buildWorkItemIdIndexMap();
        this.reOrderWorkItem(wi.id, null, 'top')
            .then((workitem) => {
              let updateIndex = this.workItemIdIndexMap[wi.id];
              this.workItems[updateIndex].attributes['version'] = workitem.attributes['version'];
            });
        break;
      case 'bottom':
        //move the item as the last of the loaded list
        this.workItems.splice((this.workItems.length), 0, wi);
        //remove the duplicate element
        this.workItems.splice( index, 1);
        this.buildWorkItemIdIndexMap();
        this.reOrderWorkItem(wi.id, null, 'bottom')
            .then((workitem) => {
              let updateIndex = this.workItemIdIndexMap[wi.id];
              this.workItems[updateIndex].attributes['version'] = workitem.attributes['version'];
          });
        break;
      case 'up':
        if (index > 0) { //no moving of element if it is the first element
          //move the work item up by 1. Below statement will create two elements
          this.workItems.splice( index - 1 , 0, wi);
          //remove the duplicate element
          this.workItems.splice( index + 1, 1);
          //Set the previous and next WI ids
          // wi.attributes.nextitem = parseInt(this.workItems[index].id);
          this.buildWorkItemIdIndexMap();
          this.reOrderWorkItem(wi.id, this.workItems[index].id, 'above')
              .then((workitem) => {
                let updateIndex = this.workItemIdIndexMap[wi.id];
                this.workItems[updateIndex].attributes['version'] = workitem.attributes['version'];
          });
        }
        break;
      case 'down':
        if ( index < (this.workItems.length - 1) ) { //no moving of elements if it is the last element
          //move the work item down by 1. Below statement will create two elements
          this.workItems.splice( index + 2 , 0, wi);
          //remove the duplicate element
          this.workItems.splice( index, 1);
          //Set the previous and next WI ids
          // wi.attributes.previousitem = parseInt(this.workItems[index].id);
          this.buildWorkItemIdIndexMap();
          this.reOrderWorkItem(wi.id, this.workItems[index].id, 'below')
              .then((workitem) => {
                let updateIndex = this.workItemIdIndexMap[wi.id];
                this.workItems[updateIndex].attributes['version'] = workitem.attributes['version'];
          });
        }
        break;
    }
    //console.log(wi.attributes.previousitem, ':' , wi.attributes.nextitem);
    //build the map to reset the indices
    this.buildWorkItemIdIndexMap();
    return Promise.resolve();
    /*
    return this.http
      .patch(this.reorderUrl, JSON.stringify({data: wi}), { headers: this.headers })
      .toPromise()
      .then(response => {
        //Reusing the update code to update the element locally
        let updatedWorkItem = response.json().data as WorkItem;
        // Find the index in the big list
        let updateIndex = this.workItems.findIndex(item => item.id == updatedWorkItem.id);
        if (updateIndex > -1) {
          // Update work item attributes
          this.workItems[updateIndex].attributes = updatedWorkItem.attributes;
          this.workItems[updateIndex].relationships.baseType = updatedWorkItem.relationships.baseType;
          // Resolve users for the updated item
          this.resolveUsersForWorkItem(this.workItems[updateIndex]);
          this.resolveIterationForWorkItem(this.workItems[updateIndex]);
        } else {
          // This part is for mock service in unit test
          // this.workItems stays in case of unit test
          // Resolve users for the updated item
          this.resolveUsersForWorkItem(updatedWorkItem);
          this.resolveIterationForWorkItem(updatedWorkItem);
        }
        return updatedWorkItem;
      })
      .catch (this.handleError);*/
  }

  /**
   * Usage: This method deletes an item
   * removes the delted item from the big list
   * re build the ID-Index map
   *
   * @param: WorkItem - workItem (Item to be delted)
   */
  delete(workItem: WorkItem): Observable<void> {
    return this.http
      .delete(workItem.links.self, { headers: this.headers, body: '' })
      .map(() => {
        let deletedItemIndex = this.workItems.findIndex((item) => item.id == workItem.id);
        // removing deleted item from the local list
        this.workItems.splice(deletedItemIndex, 1);
        // Re build the workItem ID-Index map
        this.buildWorkItemIdIndexMap();
      })
      // .catch ((e) => {
      //   if (e.status === 401) {
      //     this.auth.logout();
      //   } else {
      //     this.handleError(e);
      //   }
      // });
  }

   /**
    * Usage: This method create a new item
    * adds the new item to the big list
    * resolve the users for the item
    * re build the ID-Index map
    *
    * @param: WorkItem - workItem (Item to be created)
    */
  create(workItem: WorkItem): Observable<WorkItem> {
    let payload = JSON.stringify({data: workItem});
    if (this._currentSpace) {
      this.workItemUrl = this._currentSpace.links.self + '/workitems';
      return this.http
        .post(this.workItemUrl, payload, { headers: this.headers })
        .map(response => {
          return response.json().data as WorkItem;
        });
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    } else {
      return Observable.of<WorkItem>( {} as WorkItem );
    }
  }

  /**
   * Usage: This method update an existing item
   * updates the item in the big list
   * resolve the users for the item
   *
   * @param: WorkItem - workItem (Item to be created)
   */
  update(workItem: WorkItem): Observable<WorkItem> {
    return this.http
      .patch(workItem.links.self, JSON.stringify({data: workItem}), { headers: this.headers })
      .map(response => {
        return response.json().data as WorkItem;
      });
      // .catch ((e) => {
      //   if (e.status === 401) {
      //     this.auth.logout();
      //   } else {
      //     this.handleError(e);
      //   }
      // });
  }

  /**
   * Usage: This method create a comment for a workItem
   *
   * @param: string - id (Work Item ID)
   * @param: Comment
   */
  createComment(url: string, comment: Comment): Observable<Comment> {
    let c = new CommentPost();
    c.data = comment;
    return this.http
      .post(url, c, { headers: this.headers })
      .map(response => {
        return response.json().data as Comment;
      })
      .catch (this.handleError);
  }

  updateComment(comment: Comment): Observable<Comment> {
    let endpoint = comment.links.self;
    return this.http
      .patch(endpoint, { 'data': comment }, { headers: this.headers })
      .map(response => {
        let comment: Comment = response.json().data as Comment;
        let theUser: User = this.userService.getSavedLoggedInUser();
        comment.relationalData = { 'creator' : theUser };
        return comment;
      });
  }

  getForwardLinkTypes(workItem: WorkItem): Observable<any> {
    return this.http.get(workItem.links.targetLinkTypes, {headers: this.headers});
  }

  getBackwardLinkTypes(workItem: WorkItem): Observable<any> {
    return this.http.get(workItem.links.sourceLinkTypes, {headers: this.headers});
  }

  /**
   * Usage: This function fetches all the work item link types
   * Store it in an instance variable
   *
   * @return Promise of LinkType[]
   */
  getLinkTypes(workItem: WorkItem): Observable<Object> {
    return Observable.forkJoin(
      this.getForwardLinkTypes(workItem),
      this.getBackwardLinkTypes(workItem)
    )
    .map(items => {
      let linkTypes: Object = {};
      linkTypes['forwardLinks'] = items[0].json().data;
      linkTypes['backwardLinks'] = items[1].json().data;
      return linkTypes;
    })
    .map((linkTypes: any) => {
      return this.formatLinkTypes(linkTypes);
    })
    .catch((err) => {
      console.log(err);
      return Observable.of({});
    });
  }

  formatLinkTypes(linkTypes: any): any {
    let opLinkTypes = [];
    linkTypes.forwardLinks.forEach((linkType: LinkType) => {
      opLinkTypes.push({
        name: linkType.attributes['forward_name'],
        linkId: linkType.id,
        linkType: 'forward',
        wiType: linkType.relationships.target_type.data.id
      });
    });
    linkTypes.backwardLinks.forEach((linkType: LinkType) => {
      opLinkTypes.push({
        name: linkType.attributes['reverse_name'],
        linkId: linkType.id,
        linkType: 'reverse',
        wiType: linkType.relationships.source_type.data.id
      });
    });
    return opLinkTypes;
  }

  /**
   * Usage: This function adds a link to a work item
   * Stroes the resolved link in relationalData
   * Updates the reference of workItem so doesn't return anything
   *
   * @param link: Link
   * @param includes: any - Data relavent to the link
   * @param wItem: WorkItem
   */
  addLinkToWorkItem(link: Link, includes: any, wItem: WorkItem): void {
    wItem.relationalData.totalLinkCount += 1;
    // Get the link type of this link
    let linkType_id = link.relationships.link_type.data.id;
    let linkType = includes.find(
      (i: any) => i.id == linkType_id && i.type == 'workitemlinktypes'
    );

    // Resolve source
    if (link.relationships.source.data.id == wItem.id) {
      // Setting target info from the data in included
      let targetWItem = includes.find(
        (i: any) => i.type == 'workitems' && i.id == link.relationships.target.data.id
      );

      link.relationalData = {
        source: {
          title: wItem.attributes['system.title'],
          id: wItem.id,
          state: wItem.attributes['system.state']
        },
        target: {
          title: targetWItem.attributes['system.title'],
          id: targetWItem.id,
          state: targetWItem.attributes['system.state']
        },
        linkType: linkType.attributes.forward_name
      };
    } else {
      // Setting source info from the data in included
      let sourceWItem = includes.find(
        (i: any) => i.type == 'workitems' && i.id == link.relationships.source.data.id
      );

      link.relationalData = {
        target: {
          title: wItem.attributes['system.title'],
          id: wItem.id,
          state: wItem.attributes['system.state']
        },
        source: {
          title: sourceWItem.attributes['system.title'],
          id: sourceWItem.id,
          state: sourceWItem.attributes['system.state']
        },
        linkType: linkType.attributes.reverse_name
      };
    }
    let lTypeIndex = wItem.relationalData.linkDicts.findIndex(i => i.linkName == link.relationalData.linkType);
    if ( lTypeIndex > -1) {
      // Add this link
      wItem.relationalData.linkDicts[lTypeIndex].count += 1;
      wItem.relationalData.linkDicts[lTypeIndex].links.splice( wItem.relationalData.linkDicts[lTypeIndex].links.length, 0, link);
    } else {
      // Create a new LinkDict item
      let newLinkDict = new LinkDict();
      newLinkDict.linkName = link.relationalData.linkType;
      newLinkDict.count = 1;
      newLinkDict.links = [link];
      wItem.relationalData.linkDicts.splice(0, 0, newLinkDict);
    }
  }


  /**
   * Usage: This function removes a link from a work item
   * Removes the link from relationalData
   * Updates the reference of workItem so doesn't return anything
   *
   * @param link: Link
   * @param wItem: WorkItem
   */
  removeLinkFromWorkItem(deletedLink: Link, wItem: WorkItem) {
    wItem.relationalData.totalLinkCount -= 1;
    wItem.relationalData.linkDicts.every((item: LinkDict, index: number): boolean => {
      let linkIndex = item.links.findIndex((link: Link) => link.id == deletedLink.id);
      if (linkIndex > -1) {
        item.links.splice(linkIndex, 1);
        if (!item.links.length) {
          wItem.relationalData.linkDicts.splice(index, 1);
        }
        return false;
      }
      return true;
    });
  }

  /**
   * Usage: Makes an API call to create a link
   * Recieves the new link response
   * Resolves and add the new link to the workItem
   *
   * @param link: Link - The new link object for request params
   * @param currentWiId: string - The work item ID where the link is created
   * @returns Promise<Link>
   */
  createLink(link: Object, currentWiId: string): Observable<any> {
    if (this._currentSpace) {
      // FIXME: make the URL great again (when we know the right API URL for this)!
      this.linksUrl = this.baseApiUrl + 'workitemlinks';
      // this.linksUrl = currentSpace.links.self + '/workitemlinks';
      return this.http
        .post(this.linksUrl, JSON.stringify(link), {headers: this.headers})
        .map(response => [response.json().data as Link, response.json().included]);
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    } else {
      return Observable.of<Link>( {} as Link );
    }
  }

  /**
   * Usage: Makes an API call to delete a link
   * Removes the new link to the workItem
   *
   * @param link: Link
   * @param currentWiId: string - The work item ID where the link is created
   * @returns Promise<void>
   */
  deleteLink(link: any, currentWiId: string): Observable<void> {
    if (this._currentSpace) {
      // FIXME: make the URL great again (when we know the right API URL for this)!
      this.linksUrl = this.baseApiUrl + 'workitemlinks';
      // this.linksUrl = currentSpace.links.self + '/workitemlinks';
      const url = `${this.linksUrl}/${link.id}`;
      return this.http
        .delete(url, {headers: this.headers})
        .map(response => {} );
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    }
  }

  searchLinkWorkItem(term: string, workItemType: string): Observable<WorkItem[]> {
    if (this._currentSpace) {
      // FIXME: make the URL great again (when we know the right API URL for this)!
      let searchUrl = this.baseApiUrl + 'search?q=' + term + ' type:' + workItemType;
      //let searchUrl = currentSpace.links.self + 'search?q=' + term + ' type:' + workItemType;
      return this.http
          .get(searchUrl)
          .map((response) => response.json().data as WorkItem[])
          // .catch ((e) => {
          //   if (e.status === 401) {
          //     this.auth.logout();
          //   } else {
          //     this.handleError(e);
          //   }
          // });
    } else {
      return Observable.of<WorkItem[]>( [] as WorkItem[] );
    }
  }

  /**
   * It return object of adjacent work item id
   * {
   *  prevItemId: previous work item id
   *  nextItemId: next work item id
   * }
   *
   * @param workItemId: string
   */
  getAdjacentWorkItemsIdById(workItemId: string): any {
    let wiIndex = this.workItemIdIndexMap[workItemId];
    let prevItemId = '';
    let nextItemId = '';
    if (wiIndex > 0){
      prevItemId = this.workItems[wiIndex - 1].id;
    }

    if (wiIndex < this.workItems.length - 1) {
      nextItemId = this.workItems[wiIndex + 1].id;
    }

    let adjacentWorkItem = {
      prevItemId: prevItemId,
      nextItemId: nextItemId
    };
    return adjacentWorkItem;
  }

  /**
   * Usage: Make a API call to save
   * the order of work item.
   *
   * @param workItemId: string
   */
  reOrderWorkItem(workItemId: string, prevWiId: string | null = null, direction: string): Promise<any> {
    let newWItem = new WorkItem();
    let wiIndex = this.workItemIdIndexMap[workItemId];
    let wItem = this.workItems[wiIndex];
    let arr = [];

    newWItem.id = workItemId.toString();
    newWItem.attributes = {} as WorkItemAttributes;
    newWItem.attributes.version = wItem.attributes.version;
    newWItem.type = wItem.type;

    arr.push(newWItem);

    if (this._currentSpace) {
      // FIXME: make the URL great again (when we know the right API URL for this)!
      this.workItemUrl = this.baseApiUrl + 'workitems';
      // this.workItemUrl = currentSpace.links.self + '/workitems';
      let url = `${this.workItemUrl}/reorder`;
      return this.http
        .patch(url, JSON.stringify({data: arr, position: {direction: direction, id: prevWiId}}), { headers: this.headers })
        .toPromise()
        .then(response => {
          let updatedWorkItem: WorkItem = response.json().data[0] as WorkItem;
          wItem.attributes['system.order'] = updatedWorkItem.attributes['system.order'];
          wItem.attributes['version'] = updatedWorkItem.attributes['version'];
          return updatedWorkItem;
        });
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    }
  }

  renderMarkDown(markDownText: string): Observable<any> {
    let params = {
      data: {
        attributes: {
          content: markDownText,
          markup: 'Markdown'
        },
        type: 'rendering'
      }
    };

    if (this._currentSpace) {
      // FIXME: make the URL great again (when we know the right API URL for this)!
      this.renderUrl = this.baseApiUrl + 'render';
      // this.renderUrl = currentSpace.links.self + '/render';
      return this.http
        .post(this.renderUrl, JSON.stringify(params), { headers: this.headers })
        .map(response => response.json().data.attributes.renderedContent)
        // .catch ((e) => {
        //   if (e.status === 401) {
        //     this.auth.logout();
        //   } else {
        //     this.handleError(e);
        //   }
        // });
    } else {
      return Observable.of<any>( {} as any );
    }
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
