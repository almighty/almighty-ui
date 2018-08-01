import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class ModalService {

  private clientSource = new Subject<string>();
  private componentSource = new Subject<string[]>();
  private clientSource$ = this.clientSource.asObservable();
  private componentSource$ = this.componentSource.asObservable();

  constructor() {}

  public openModal(title: string, message: string, buttonText1: string, buttonText2?: string, actionKey1?: string, actionKey2?: string): Observable<string> {
    this.componentSource.next([ title, message, buttonText1, buttonText2, actionKey1, actionKey2 ]);
    console.log('Opened modal dialog for keys ' + actionKey1 + 'and' + actionKey2);
    return this.clientSource$;
  }

  public doAction(actionKey: string) {
    console.log('Received confirm action for key ' + actionKey + ', sending to clients');
    this.clientSource.next(actionKey);
  }

  public getComponentObservable(): Observable<string[]> {
    return this.componentSource$;
  }
}
