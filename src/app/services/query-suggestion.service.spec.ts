import { async, getTestBed, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AreaQuery } from '../models/area.model';
import { AND, OR, P_END, P_START } from './query-keys';
import { QuerySuggestionService } from './query-suggestion.service';

class FakeAreaQuery {
  getAreaIds() {
    return of(['id-1', 'id-2', 'id-23']);
  }
  getAreaNames() {
    return of(['area-1', 'area-2', 'area-23']);
  }
}

fdescribe(
  'Unit Test :: QuerySuggestionService',
  () => {
    let queryService: QuerySuggestionService;

    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          providers: [
            QuerySuggestionService,
            {
              provide: AreaQuery,
              useClass: FakeAreaQuery
            }
          ]
        });
        const testBed = getTestBed();
        queryService = testBed.get(QuerySuggestionService);
      })
    );

    it('Should suggest for fields if there is no key yet  ', () => {
      expect(queryService.shouldSuggestField('hello').suggest).toBeTruthy();
    });

    it('Should sugest fields if empty query is given', () => {
      expect(queryService.shouldSuggestField('').suggest).toBeTruthy();
    });

    it('Should sugest fields if query string only has spaces', () => {
      expect(queryService.shouldSuggestField('   ').suggest).toBeTruthy();
    });

    it ('Should correctly suggest for field - 1', () => {
      expect(queryService.shouldSuggestField(
        'hello: world ' + AND + ' heya'
      )).toEqual({
        suggest: true, value: 'heya', lastKey: AND
      });
    });

    it ('Should correctly suggest for field - 2', () => {
      expect(queryService.shouldSuggestField(
        'hello: world ' + AND + ' some_key1: some value' + OR + 'some '
      )).toEqual({
        suggest: true, value: 'some', lastKey: OR
      });
    });

    it ('Should correctly suggest for field - 3', () => {
      expect(queryService.shouldSuggestField(
        'hello: world ' + OR + ' some_key1: some value' + AND + 'some '
      )).toEqual({
        suggest: true, value: 'some', lastKey: AND
      });
    });

    it ('Should correctly suggest for field - 4', () => {
      expect(queryService.shouldSuggestField(
        'hello: world ' + OR + P_START + ' some_key1: some value' + P_END + AND + 'some_key2: some value ' + P_START
      )).toEqual({
        suggest: true, value: '', lastKey: P_START
      });
    });

    it ('Should not suggest for field - 1', () => {
      expect(queryService.shouldSuggestField(
        'hello: world ' + OR + P_START + ' some_key1: some value'
      )).toEqual({
        suggest: false, value: 'some_key1: some value', lastKey: ''
      });
    });

    it ('Should suggest correct value - 1', () => {
      expect(queryService.suggestValue(
        ' some_key1: some value'
      )).toEqual({
        value: 'some value', field: 'some_key1'
      });
    });

    it ('Should suggest correct value - 2', () => {
      expect(queryService.suggestValue(
        ' some_key1: "some value"'
      )).toEqual({
        value: 'some value', field: 'some_key1'
      });
    });

    it ('Should suggest correct value - 3', () => {
      expect(queryService.suggestValue(
        ' some_key1: "some value'
      )).toEqual({
        value: 'some value', field: 'some_key1'
      });
    });

    it ('Should suggest correct value - 4', () => {
      expect(queryService.suggestValue(
        ' some_key1: "some value1, some valu'
      )).toEqual({
        value: 'some valu', field: 'some_key1'
      });
    });

    it ('Should suggest correct value - 5', () => {
      expect(queryService.suggestValue(
        ' some_key1: '
      )).toEqual({
        value: '', field: 'some_key1'
      });
    });

    it ('Should suggest right field - 0', () => {
      queryService.queryObservable.next('');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['area', 'area.name']);
      });
    });

    it ('Should suggest right field - 1', () => {
      queryService.queryObservable.next('are');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['area', 'area.name']);
      });
    });

    it ('Should suggest right field - 2', () => {
      queryService.queryObservable.next('area.');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['area.name']);
      });
    });

    it ('Should suggest right field - 3', () => {
      queryService.queryObservable.next('area.');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['area.name']);
      });
    });

    it ('Should suggest right field - 4', () => {
      queryService.queryObservable.next('area:');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['id-1', 'id-2', 'id-23']);
      });
    });

    it ('Should suggest right field - 5', () => {
      queryService.queryObservable.next('area:id-2');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['id-2', 'id-23']);
      });
    });

    it ('Should suggest right field - 6', () => {
      queryService.queryObservable.next('area.name:area-2');
      queryService.getSuggestions().subscribe((v) => {
        expect(v).toEqual(['area-2', 'area-23']);
      });
    });
  }
);