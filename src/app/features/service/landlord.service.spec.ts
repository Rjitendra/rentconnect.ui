/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LandlordService } from './landlord.service';

describe('Service: Landlord', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LandlordService]
    });
  });

  it('should ...', inject([LandlordService], (service: LandlordService) => {
    expect(service).toBeTruthy();
  }));
});
