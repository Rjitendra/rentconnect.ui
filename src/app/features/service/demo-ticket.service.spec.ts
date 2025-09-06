/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DemoTicketService } from './demo-ticket.service';

describe('Service: DemoTicket', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DemoTicketService]
    });
  });

  it('should ...', inject([DemoTicketService], (service: DemoTicketService) => {
    expect(service).toBeTruthy();
  }));
});
