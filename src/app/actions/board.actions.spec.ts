import { boardUIData } from '../services/board.snapshot';
import { BoardState } from './../states/board.state';
import {
  Get, GET,
  GET_ERROR, GET_SUCCESS,
  GetError, GetSuccess
} from './board.actions';

describe('Unit Test :: Board Actions', () => {
  it('GetBoard :: should create get action', () => {
    const action = new Get('');
    expect({...action}).toEqual({
      type: GET,
      payload: ''
    });
  });

  it('GetBoardSuccess :: should create get success action', () => {
    const boards = {
      'board-1': boardUIData
    } as BoardState;

    const action = new GetSuccess(boards);
    expect({...action}).toEqual({
      type: GET_SUCCESS,
      payload: boards
    });
  });

  it('GetBoardError :: should create get error action', () => {
    const action = new GetError();
    expect({...action}).toEqual({type: GET_ERROR});
  });
});
