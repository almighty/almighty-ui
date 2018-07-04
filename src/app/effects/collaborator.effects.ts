import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  Notification,
  Notifications,
  NotificationType
} from 'ngx-base';
import { Observable } from 'rxjs';
import * as CollaboratorActions from './../actions/collaborator.actions';
import * as UserActions from './../actions/user.actions';
import { AppState } from './../states/app.state';

import { normalizeArray } from '../models/common.model';
import {
  UserMapper,
  UserService as UserServiceModel,
  UserUI
} from './../models/user';
import {
  CollaboratorService as CollabService
} from './../services/collaborator.service';

export type Action = CollaboratorActions.All | UserActions.All;

@Injectable()
export class CollaboratorEffects {
  constructor(
    private actions$: Actions,
    private collaboratorService: CollabService,
    private notifications: Notifications,
    private store: Store<AppState>
  ) {}

  @Effect() getCollaborators$: Observable<Action> = this.actions$
    .ofType(CollaboratorActions.GET)
    .withLatestFrom(this.store.select('planner').select('space'))
    .switchMap(([action, space]) => {
      return this.collaboratorService.getCollaborators(
        space.links.self + '/collaborators?page[offset]=0&page[limit]=1000'
      );
    })
    .map((collaborators: UserServiceModel[]) => {
      const collabM = new UserMapper();
      return collaborators.map(c => collabM.toUIModel(c)).
      sort((c1, c2) => (c1.name > c2.name ? 1 : 0));
    })
    .switchMap(collaborators => {
      return [
        new CollaboratorActions.GetSuccess(collaborators.map(c => c.id)),
        new UserActions.Set(normalizeArray<UserUI>(collaborators))
      ];
    })
    .catch(e => {
      try {
        this.notifications.message({
          message: `Problem in fetching collaborators`,
          type: NotificationType.DANGER
        } as Notification);
      } catch (e) {
        console.log('Problem in fetching collaborators');
      }
      return Observable.of(new CollaboratorActions.GetError());
    });
}
