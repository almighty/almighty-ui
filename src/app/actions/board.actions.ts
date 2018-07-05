import { Action } from '@ngrx/store';
import { BoardState } from '../states/board.state';

export const GET = '[board] Get';
export const GET_SUCCESS = '[board] GetSuccess';
export const GET_ERROR = '[board] GetError';
export const GET_BOARD_URL = '[board] GetBoardapiUrl';
export const GET_BOARD_URL_ERROR = '[board] GetBoardapiUrl';

export class Get implements Action {
  payload: string;
  constructor(payload: string) {
    this.payload = payload;
  }
  readonly type = GET;
}

export class GetSuccess implements Action {
  payload: BoardState;
  constructor(payload: BoardState) {
    this.payload = payload;
  }

  readonly type = GET_SUCCESS;
}

export class GetError implements Action {
  readonly type = GET_ERROR;
}

export class GetBoardUrl implements Action {
  readonly type = GET_BOARD_URL;
}

export class GetBoardUrlError implements Action {
  readonly type = GET_BOARD_URL;
}

export type All
  = Get
  | GetSuccess
  | GetError
  | GetBoardUrl
  | GetBoardUrlError;

