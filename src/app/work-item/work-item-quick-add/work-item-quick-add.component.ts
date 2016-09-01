import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Logger } from '../../shared/logger.service';
import { WorkItem } from '../work-item';
import { WorkItemService } from '../work-item.service';

@Component({
  selector: 'work-item-quick-add',
  templateUrl: '/work-item-quick-add.component.html',
  styleUrls: ['/work-item-quick-add.component.css']
})
export class WorkItemQuickAddComponent implements OnInit {
  @Input() workItem: WorkItem;
  @Output() close = new EventEmitter();
  error: any;
  navigated = false; // true if navigated here
  validName = false;

  constructor(
    private workItemService: WorkItemService,
    private route: ActivatedRoute,
    private logger: Logger) {
  }

  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      if (params['id'] !== undefined) {
        let id = +params['id'];
        this.navigated = true;
        this.workItemService.getWorkItem(id)
          .then(workItem => this.workItem = workItem);
      } else {
        this.validName = false;
        this.navigated = false;
        this.workItem = new WorkItem();
        this.workItem.fields = {"system.owner": 'me', "system.state": 'new'};
        this.workItem.type = '1';
      }
    });
  }

  save(): void {
    if(this.validName){
      this.workItemService
        .create(this.workItem)
        .then(workItem => {
          this.workItem = workItem; // saved workItem, w/ id if new
          this.logger.log(`created and returned this workitem: ${workItem}`);
          this.goBack(workItem);
        })
        .catch(error => this.error = error); // TODO: Display error message
    }
  }

  goBack(savedWorkItem: WorkItem = null): void {
    this.close.emit(savedWorkItem);
    if (this.navigated) { window.history.back(); }
    this.ngOnInit();
  }

  checkName(){
    if(this.workItem.name){
      this.validName = true;
    }else{
      this.validName = false;
    }
  }
}
