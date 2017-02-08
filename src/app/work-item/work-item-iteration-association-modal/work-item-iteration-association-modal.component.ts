import { Component, ViewChild, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';

import { AuthenticationService } from '../../auth/authentication.service';
import { Broadcaster } from '../../shared/broadcaster.service';
import { Logger } from '../../shared/logger.service';

import { WorkItem }          from '../../models/work-item';
import { WorkItemService }   from '../work-item.service';
import { IterationModel }    from '../../models/iteration.model';
import { IterationService }  from '../../iteration/iteration.service';


@Component({
  selector: 'fab-planner-associate-iteration-modal',
  templateUrl: './work-item-iteration-association-modal.component.html',
  styleUrls: ['./work-item-iteration-association-modal.component.scss']
})
export class FabPlannerAssociateIterationModalComponent implements OnInit, OnChanges {

  @Input() workItem: WorkItem;
  @ViewChild('iterationAssociationModal') iterationAssociationModal: any;

  iterations: IterationModel[];

  constructor(
    private auth: AuthenticationService,
    private broadcaster: Broadcaster,
    private workItemService: WorkItemService,
    private logger: Logger,
    private iterationService: IterationService,
  ) {}

  ngOnInit() {
    this.iterations = this.iterationService.iterations;
  }

  ngOnChanges() {

  }

  open() {
    this.iterationAssociationModal.open();
  }
}
