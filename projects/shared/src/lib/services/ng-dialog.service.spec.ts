/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NgDialogService } from './ng-dialog.service';

describe('Service: NgDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgDialogService]
    });
  });

  it('should ...', inject([NgDialogService], (service: NgDialogService) => {
    expect(service).toBeTruthy();
  }));
});
