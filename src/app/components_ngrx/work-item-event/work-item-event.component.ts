import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { EventUI } from '../../models/event.model';

@Component({
  selector: 'work-item-event',
  templateUrl: './work-item-event.component.html',
  styleUrls: ['./work-item-event.component.less'],
})

export class WorkItemEventComponent implements OnInit {
  @Input() event: EventUI;
  @Input() type: string;

  private intermediateText: string;
  private title: string;
  private toText: string | null = "to"
  private textType: string;

  ngOnInit() {
    this.getTitle();
    if (this.type === null) {
      this.singleValueChange();
    }
    if (this.type === 'areas') {
      this.areasAndIteration();
    }
    if (this.type === 'users') {
      this.users();
    }
    if (this.type === 'iterations') {
      this.areasAndIteration();
    }
    if (this.type === 'labels') {
      this.labels();
    }
  }

  getTitle() {
    if (this.event.name.indexOf('system') > -1) {
      this.title = this.event.name.slice(this.event.name.indexOf('.') + 1);
    } else {
      this.title = this.event.name;
    }
  }

  singleValueChange() {
    if (this.title === 'description') {
      this.textType = "description";
    } else {
      this.intermediateText = "changed the " + this.title + " from";
      this.textType = "attribute";
    }
    
  }

  areasAndIteration() {
    if (this.event.oldValueRelationships[0].parentPath === '/') {
      this.intermediateText = "added this work item to " + this.title + ":"
      this.toText = null;
    } else {
      this.intermediateText = "moved this work item from " + this.title;
      this.toText = 'to ' + this.title;
    }
    this.textType = "relationship";
  }

  users() {
    if (this.event.oldValueRelationships.length === 0) {
      if (this.event.newValueRelationships.length === 1 && this.event.newValueRelationships[0].id === this.event.modifierId) {
        this.intermediateText = "self assigned this workitem";
        this.toText = null;
        this.event.newValueRelationships = [];
      } else {
        this.intermediateText = "assigned this work item to"
        this.toText = null;
      }
    } else if (this.event.newValueRelationships.length === 0) {
      this.intermediateText = "unassigned";
      this.toText = ' ';
    } else {
      this.intermediateText = "assigned";
      this.toText = "and unassgined"
    }
    this.textType = "relationship";
  }

  labels() {
    if (this.event.oldValueRelationships.length === 0) {
      this.intermediateText = "added";
      this.toText = " label";
    } else if (this.event.newValueRelationships.length === 0) {
      this.intermediateText = "removed the label";
      this.toText = ' ';
    } else {
      this.intermediateText = "added the label";
      this.toText = " and removed the label";
    }
    this.textType = "label";
  }



}
