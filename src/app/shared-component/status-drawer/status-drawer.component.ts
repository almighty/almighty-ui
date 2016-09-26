import { 
	Component, 
	OnInit, 
	Input,
	Output,
	EventEmitter
} from '@angular/core';

import { WorkItem } from './../../work-item/work-item';

@Component({
	selector: 'status-drawer',
	templateUrl: './status-drawer.component.html',
	styleUrls: ['./status-drawer.component.css'],
})
export class StatusDrawerComponent implements OnInit{
	@Input() workItem: WorkItem;
	@Output('change') onUpdate = new EventEmitter();

	show: boolean = false;

	constructor() {}
	
	ngOnInit(): void {
		if(!this.workItem.fields['system.state']){
			this.workItem.statusCode = 0;
			this.workItem.fields['system.state'] = "new";
		} else {
			var state = this.workItem.fields['system.state']
			var status = 0
			switch(state) {
				case 'new':
					status = 0;
					break;
				case 'in progress':
					status = 1;
					break;
				case 'resolved':
					status = 2;
					break;
				case 'closed':
					status = 3;
					break;
			}
			this.workItem.statusCode = status;
		}
  	}

	onDrawerToggle(): void {
		this.show = !this.show;
	}

	changeStatus(code: number, status: string): void {
		this.workItem.statusCode = code;
		this.workItem.fields['system.state'] = status;
		this.onUpdate.emit(this.workItem);
		this.onDrawerToggle();
	}
}
