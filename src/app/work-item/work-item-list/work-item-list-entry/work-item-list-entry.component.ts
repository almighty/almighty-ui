import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router }                                         from '@angular/router';

import { AuthenticationService } from './../../../auth/authentication.service';
import { Broadcaster } from './../../../shared/broadcaster.service';
import { Logger } from './../../../shared/logger.service';

import { Dialog }            from './../../../shared-component/dialog/dialog';

import { WorkItem }        from './../../../work-item/work-item';
import { WorkItemService } from './../../../work-item/work-item.service';

/**
 * Work Item List Entry Component - Displays a work item and action elements for it.
 *
 * Inputs: workItem:WorkItem - the WorkItem to be displayed.
 * Events: selectEvent(WorkItemListEntryComponent) - Entry is selected.
 * detailEvent(WorkItemListEntryComponent) - Detail view for entry is requested.
 * deleteEvent(WorkItemListEntryComponent) - Signals deletion (see note below!).
 *
 * Note: all navigational events are delegated to a parent component:
 * detailEvent, selectEvent. The parent component has the obligation to manually call
 * select() on this component! Why? Because this allows the parent component to customize
 * the select behaviour (like multi-selects or xor selects).
 *
 * All data events (deleteEvent only currently) are done inside this component (the service
 * is called to delete the workItem) and an event is delegated back to the parent for
 * information purposes. The parent MUST NOT delete the workItem associated. The event is
 * intended for display purposes, like removing the entry element and reloading the list.
 */

@Component({
  selector: 'alm-work-item-list-entry',
  templateUrl: '/work-item-list-entry.component.html',
  styleUrls: ['/work-item-list-entry.component.scss'],
})
export class WorkItemListEntryComponent implements OnInit {

  @Input() workItem: WorkItem;
  @Output() selectEvent: EventEmitter<WorkItemListEntryComponent> = new EventEmitter<WorkItemListEntryComponent>();
  @Output() detailEvent: EventEmitter<WorkItemListEntryComponent> = new EventEmitter<WorkItemListEntryComponent>();
  @Output() deleteEvent: EventEmitter<WorkItemListEntryComponent> = new EventEmitter<WorkItemListEntryComponent>();
  @Output() moveTopEvent: EventEmitter<WorkItemListEntryComponent> = new EventEmitter<WorkItemListEntryComponent>();
  @Output() moveBottomEvent: EventEmitter<WorkItemListEntryComponent> = new EventEmitter<WorkItemListEntryComponent>();

  selected: boolean = false;
  dialog: Dialog;
  showDialog = false;
  loggedIn: Boolean = false;

  constructor(private auth: AuthenticationService,
              private broadcaster: Broadcaster,
              private router: Router,
              private workItemService: WorkItemService,
              private logger: Logger) {}

  ngOnInit(): void {
    this.listenToEvents();
    this.loggedIn = this.auth.isLoggedIn();
  }

  getWorkItem(): WorkItem {
    return this.workItem;
  }

  select(): void {
    this.selected = true;
  }

  deselect(): void {
    this.selected = false;
  }

  isSelected(): boolean {
    return this.selected;
  }

  // helpers

  confirmDelete(event: MouseEvent) {
    event.stopPropagation();
    this.dialog = {
      'title': 'Confirm deletion of Work Item',
      'message': 'Are you sure you want to delete Work Item - ' + this.workItem.fields['system.title'] + ' ?',
      'actionButtons': [
        {'title': 'Confirm', 'value': 1},
        {'title': 'Cancel', 'value': 0}]
    };
    this.showDialog = true;
  }

  onButtonClick(val: number) {
    // callback from the confirm delete dialog 
    if (val == 1) {
      this.onDelete(null);
    }
    this.showDialog = false;
  }

  selectEntry(): void {
    this.selectEvent.emit(this);
  }

  // event handlers
  onDelete(event: MouseEvent): void {
    if (event)
      event.stopPropagation();
    this.workItemService
      .delete(this.workItem)
      .then(() => {
        this.deleteEvent.emit(this);
      });
  }

  onSelect(event: MouseEvent): void {
    event.stopPropagation();
    this.selectEvent.emit(this);
  }

  onDetail(event: MouseEvent): void {
    event.stopPropagation();
    this.detailEvent.emit(this);
    this.router.navigate(['/work-item-list/detail/' + this.workItem.id]);
  }
  
  onMoveToTop(event: MouseEvent): void {
    event.stopPropagation();    
    this.moveTopEvent.emit(this);
  }

  onMoveToBottom(event: MouseEvent): void {
    event.stopPropagation();    
    this.moveBottomEvent.emit(this);
  }

  onMoveToBacklog(event: MouseEvent): void {
    alert('NOT IMPLEMENTED YET.');
  }

  listenToEvents() {
    this.broadcaster.on<string>('logout')
      .subscribe(message => {
        this.loggedIn = false;
    });
    this.broadcaster.on<string>('activeWorkItem')
      .subscribe(wiId => {
        this.selected = this.workItem.id == wiId;
    });
  }
}