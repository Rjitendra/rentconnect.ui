/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PropertyDashboardService } from './property-dashboard.service';

describe('Service: PropertyDashboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PropertyDashboardService]
    });
  });

  it('should ...', inject([PropertyDashboardService], (service: PropertyDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
