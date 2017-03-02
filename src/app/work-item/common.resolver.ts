import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import {
  User,
  UserService
} from 'ngx-login-client';
import { Space } from 'ngx-fabric8-wit';

import { IterationService } from '../iteration/iteration.service';
import { IterationModel } from '../models/iteration.model';


@Injectable()
export class UsersResolve implements Resolve<User[]> {
  constructor(private userService: UserService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.userService.getAllUsers();
  }
}

@Injectable()
export class AuthUserResolve implements Resolve<any> {
  constructor(private userService: UserService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.userService.getUser();
  }
}

// FIX ME : Need to remove this resolver
@Injectable()
export class IterationsResolve implements Resolve<IterationModel[]> {

  constructor(private iterationService: IterationService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.iterationService.getIterations()
      .then(iterations =>  iterations)
      .catch ((e) => {
        console.log('Some error has occured', e);
      })
      .catch ((err) => {
        console.log('Space not found');
      });
    }
}
