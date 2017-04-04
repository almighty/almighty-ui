import { GlobalSettings } from '../shared/globals';

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { cloneDeep } from 'lodash';
import { Broadcaster, Logger } from 'ngx-base';
import { AuthenticationService } from 'ngx-login-client';

import { Space, Spaces } from 'ngx-fabric8-wit';
import { IterationModel } from '../models/iteration.model';
import { MockHttp } from '../shared/mock-http';

@Injectable()
export class IterationService {
  public iterations: IterationModel[] = [];
  private headers = new Headers({'Content-Type': 'application/json'});
  private _currentSpace;

  constructor(
      private logger: Logger,
      private http: Http,
      private auth: AuthenticationService,
      private globalSettings: GlobalSettings,
      private broadcaster: Broadcaster,
      private spaces: Spaces
  ) {
    this.spaces.current.subscribe(val => this._currentSpace = val);
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
     }
  }

  /**
   * getIteration - We call this service method to fetch
   * @param iterationUrl - The url to get all the iteration
   * @return Promise of IterationModel[] - Array of iterations
   */
  getIterations(): Observable<IterationModel[]> {
    // get the current iteration url from the space service
    if (this._currentSpace) {
      let iterationsUrl = this._currentSpace.relationships.iterations.links.related;
      return this.http
        .get(iterationsUrl, { headers: this.headers })
        .map (response => {
          if (/^[5, 4][0-9]/.test(response.status.toString())) {
            throw new Error('API error occured');
          }
          return response.json().data as IterationModel[];
        })
        .map((data) => {
          this.iterations = data;
          return this.iterations;
        })
        .catch ((error: Error | any) => {
          if (error.status === 401) {
            this.auth.logout();
          } else {
            console.log('Fetch iteration API returned some error - ', error.message);
            return Observable.throw(new Error(error.message));
            // return Observable.throw<IterationModel[]> ([] as IterationModel[]);
          }
        });
    } else {
      return Observable.throw(new Error('error'));
      // return Observable.throw<IterationModel[]> ([] as IterationModel[]);
    }
  }

  /**
   * Create new iteration
   * @param iterationUrl - POST url
   * @param iteration - data to create a new iteration
   * @return new item
   */
  createIteration(iteration: IterationModel, parentIteration: IterationModel): Observable<IterationModel> {
    console.log('create iteration service');
    let iterationsUrl;
    if (parentIteration) {
      iterationsUrl = parentIteration.links.self;
    }
    else {
      iterationsUrl = this._currentSpace.relationships.iterations.links.related;
    }
    if (this._currentSpace) {
      iteration.relationships.space.data.id = this._currentSpace.id;
      return this.http
        .post(
          iterationsUrl,
          { data: iteration },
          { headers: this.headers }
        )
        .map (response => {
          if (/^[5, 4][0-9]/.test(response.status.toString())) {
            throw new Error('API error occured');
          }
          return response.json().data as IterationModel;
        })
        .map (newData => {
          // Add the newly added iteration on the top of the list
          this.iterations.splice(0, 0, newData);
          return newData;
        })
        .catch ((error: Error | any) => {
          if (error.status === 401) {
            this.auth.logout();
          } else {
            console.log('Post iteration API returned some error - ', error.message);
            return Observable.throw(new Error(error.message));
            // return Observable.throw<IterationModel>({} as IterationModel);
          }
        });
    } else {
      return Observable.throw(new Error('error'));
      // return Observable.throw<IterationModel>( {} as IterationModel );
    }
  }

  /**
   * Update an existing iteration
   * @param iteration - Updated iteration
   * @return updated iteration's reference from the list
   */
  updateIteration(iteration: IterationModel): Observable<IterationModel> {
    console.log('update iteration service');
    return this.http
      .patch(iteration.links.self, { data: iteration }, { headers: this.headers })
      .map (response => {
        if (/^[5, 4][0-9]/.test(response.status.toString())) {
          throw new Error('API error occured');
        }
        return response.json().data as IterationModel;
      })
      .map (updatedData => {
        // Update existing iteration data
        let index = this.iterations.findIndex(item => item.id === updatedData.id);
        if (index > -1) {
          this.iterations[index] = cloneDeep(updatedData);
          return this.iterations[index];
        } else {
          this.iterations.splice(0, 0, updatedData);
          return this.iterations[0];
        }
      })
      .catch ((error: Error | any) => {
        if (error.status === 401) {
          this.auth.logout();
        } else {
          console.log('Patch iteration API returned some error - ', error.message);
          return Observable.throw(new Error(error.message));
          // return Observable.throw<IterationModel>({} as IterationModel);
        }
      });
  }

  getIteration(iteration: any): Observable<IterationModel> {
    if (Object.keys(iteration).length) {
      let iterationLink = iteration.data.links.self;
      return this.http.get(iterationLink)
        .map(iterationresp => iterationresp.json().data);
    } else {
      return Observable.of(iteration);
    }
  }

  /**
   * checkValidIterationUrl checks if the API url for
   * iterations is valid or not
   * sample url -
   * http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/iterations
   *
   * @param URL
   * @return Boolean
   */
  // checkValidIterationUrl(url: string): Boolean {
  //   let urlArr: string[] = url.split('/');
  //   let uuidRegExpPattern = new RegExp('[^/]+');
  //   return (
  //     urlArr[urlArr.length - 1] === 'iterations' &&
  //     uuidRegExpPattern.test(urlArr[urlArr.length - 2]) &&
  //     urlArr[urlArr.length - 3] === 'spaces'
  //   );
  // }

}
