import { TestBed } from '@angular/core/testing';

import { NgDialog } from './ng-dialog';

describe('NgDialog', () => {
  let service: NgDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgDialog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
