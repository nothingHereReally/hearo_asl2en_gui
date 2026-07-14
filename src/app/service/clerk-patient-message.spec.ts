import { TestBed } from '@angular/core/testing';

import { ClerkPatientMessage } from './clerk-patient-message';

describe('ClerkPatientMessage', () => {
  let service: ClerkPatientMessage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClerkPatientMessage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
