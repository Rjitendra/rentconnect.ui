/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AiConfigService } from './ai-config.service';

describe('Service: AiConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AiConfigService]
    });
  });

  it('should ...', inject([AiConfigService], (service: AiConfigService) => {
    expect(service).toBeTruthy();
  }));
});
