import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { sortBy } from 'lodash';
import { BoardQuery } from '../../models/board.model';
import { AppState } from '../../states/app.state';
import * as BoardActions from './../../actions/board.actions';
import { GroupTypeQuery, GroupTypeUI } from './../../models/group-types.model';
import { IterationQuery } from './../../models/iteration.model';
import { SpaceQuery } from './../../models/space';

@Component({
    selector: 'planner-board',
    templateUrl: './planner-board.component.html',
    styleUrls: ['./planner-board.component.less']
})
export class PlannerBoardComponent implements AfterViewChecked, OnInit, OnDestroy {
    @ViewChild('boardContainer') boardContainer: ElementRef;

    private uiLockedSidebar: boolean = false;
    private sidePanelOpen: boolean = true;
    private eventListeners: any[] = [];
    private board$;
    private columns;

    constructor(
      private renderer: Renderer2,
      private spaceQuery: SpaceQuery,
      private groupTypeQuery: GroupTypeQuery,
      private iterationQuery: IterationQuery,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private boardQuery: BoardQuery
    ) {}

    ngOnInit() {
      this.iterationQuery.deselectAllIteration();
      this.eventListeners.push(
        this.spaceQuery.getCurrentSpace
          .switchMap(() => {
            return this.groupTypeQuery.getFirstGroupType;
          }).take(1)
          .do((groupType) => {
            this.setDefaultUrl(groupType);
            this.checkUrl(groupType);
          })
          .subscribe()
      );

      this.columns = [{
        name: 'New',
        count: 3,
        id: '1',
        workItems: [{
          id: '1',
          title: 'Work Item 1',
          number: 1,
          iteration: 'Sprint #1'
        }, {
          id: '2',
          title: 'Work Item 2',
          number: 2,
          iteration: 'Sprint #2'
        }, {
          id: '3',
          title: 'Work Item 3',
          number: 3,
          iteration: 'Sprint #3'
        }]
      }, {
        name: 'Open',
        count: 2,
        id: '2',
        workItems: [{
          id: '4',
          title: 'Work Item 4',
          number: 4,
          iteration: 'Sprint #4'
        }, {
          id: '5',
          title: 'Work Item 5',
          number: 5,
          iteration: 'Sprint #5'
        }]
      }, {
        name: 'InProgress',
        count: 2,
        id: '3',
        workItems: [{
          id: '6',
          title: 'Work Item 6',
          number: 6,
          iteration: 'Sprint #6'
        }, {
          id: '7',
          title: 'Work Item 7',
          number: 7,
          iteration: 'Sprint #7'
        }]
      }, {
        name: 'Resolved',
        count: 2,
        id: '4',
        workItems: [{
          id: '8',
          title: 'Work Item 8',
          number: 8,
          iteration: 'Sprint #8'
        }, {
          id: '9',
          title: 'Work Item 9',
          number: 9,
          iteration: 'Sprint #9'
        }]
      }];
    }

    setDefaultUrl(groupType: GroupTypeUI) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { boardContextId: groupType.id }
      });
    }

    checkUrl(groupType) {
      this.eventListeners.push(
        this.router.events
          .filter(event => event instanceof NavigationStart)
          .map((e: NavigationStart) => e.url)
          .subscribe(url => {
            if (url.indexOf('?boardContextId') === -1 &&
              url.indexOf('/plan/board') > -1) {
              this.setDefaultUrl(groupType);
            }
          })
      );

      this.eventListeners.push(
        this.route.queryParams
          .filter(params => params.hasOwnProperty('boardContextId'))
          .map(params => params.boardContextId)
          .subscribe(contextId => {
            console.log(contextId);
            this.board$ = this.boardQuery.getBoardById(contextId);
            // Fetching work item
            // Dispatch action to fetch work items per lane for this context ID
          })
      );
    }

    ngOnDestroy() {
      this.eventListeners.forEach(e => e.unsubscribe());
    }

    ngAfterViewChecked() {
      let hdrHeight = 0;
      if (document.getElementsByClassName('navbar-pf').length > 0) {
        hdrHeight = (document.getElementsByClassName('navbar-pf')[0] as HTMLElement).offsetHeight;
      }
      let targetHeight = window.innerHeight - (hdrHeight);

      if (this.boardContainer) {
        this.renderer.setStyle(
          this.boardContainer.nativeElement, 'height', targetHeight + 'px'
        );
      }
    }

    togglePanelState(event) {
      setTimeout(() => {
        this.sidePanelOpen = event === 'out';
      }, 200);
    }
}
