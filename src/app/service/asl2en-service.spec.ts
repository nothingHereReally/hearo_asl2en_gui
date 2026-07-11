import { TestBed } from '@angular/core/testing';

import { Asl2enService } from './asl2en-service';

describe('Asl2enService', () => {
  let service: Asl2enService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asl2enService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
