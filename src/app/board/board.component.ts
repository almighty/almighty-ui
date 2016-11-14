import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { WorkItem } from '../work-item/work-item';
import { WorkItemService } from '../work-item/work-item.service';

@Component({
  selector: 'alm-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  workItems: WorkItem[] = [];
  //Added mock data here
  lanes:Array<any> = [];

  constructor(
    private router: Router,
    private workItemService: WorkItemService) {
  }

  ngOnInit() {
    this.workItemService.getWorkItems()
      .then(workItems => {
        this.workItems = workItems;
        //need push lane data here once the backend data is available
        this.lanes.push({title:'Backlog', cards: workItems});
        this.lanes.push({title: 'In-Progress',cards: [{'id': 211,fields:{'system.title': 'Item A'}}, {'id': 212,fields:{'system.title': 'Item B'}}, {'id': 213,fields:{'system.title':'Item C'}}, {'id': 214,fields:{'system.title': 'Item D'}}]});
        this.lanes.push({title: 'Done',cards: [{'id': 311,fields:{'system.title': 'Item 1'}}, {'id': 312,fields:{'system.title':'Item 2'}}, {'id': 313,fields:{'system.title': 'Item 3'}}, {'id': 314,fields:{'system.title': 'Item 4'}}]});
      });
    
  }
  
  gotoDetail(workItem: WorkItem) {
    let link = ['/detail', workItem.id];
    this.router.navigate(link);
  }
}
