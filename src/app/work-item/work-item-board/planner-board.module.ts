import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';
import { HttpModule, Http } from '@angular/http';

import { TreeModule } from 'angular2-tree-component';
import { TooltipModule } from 'ng2-bootstrap/components/tooltip';
import { DndModule } from 'ng2-dnd';
import { ModalModule } from 'ngx-modal';
import { DropdownModule } from 'ng2-bootstrap';
import {
  AlmIconModule,
  DialogModule,
  InfiniteScrollModule,
  TreeListModule,
  WidgetsModule
} from 'ngx-widgets';

import { UserService } from 'ngx-login-client';

import { GlobalSettings } from '../../shared/globals';
import { AlmFilterBoardList } from '../../pipes/alm-board-filter.pipe';
import { IterationModule } from '../../iteration/iteration.module';
import { SidepanelModule } from '../../side-panel/side-panel.module';
import { AuthUserResolve, UsersResolve } from '../common.resolver';

import { WorkItemBoardComponent } from './work-item-board.component';
import { PlannerBoardRoutingModule } from './planner-board-routing.module';

import { WorkItemDetailModule } from '../work-item-detail/work-item-detail.module';
import { WorkItemService } from '../work-item.service';


@NgModule({
  imports: [
    AlmIconModule,
    CommonModule,
    DialogModule,
    DndModule.forRoot(),
    DropdownModule,
    HttpModule,
    InfiniteScrollModule,
    IterationModule,
    ModalModule,
    PlannerBoardRoutingModule,
    SidepanelModule,
    TooltipModule,
    TreeModule,
    TreeListModule,
    WidgetsModule,
    WorkItemDetailModule
  ],
  declarations: [
    AlmFilterBoardList,
    WorkItemBoardComponent,
  ],
  providers: [
    AuthUserResolve,
    GlobalSettings,
    UserService,
    UsersResolve,
    WorkItemService
  ],
  exports: [ WorkItemBoardComponent ]
})
export class PlannerBoardModule {
  constructor(http: Http) {}
}
