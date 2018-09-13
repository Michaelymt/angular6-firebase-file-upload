import { TestBed } from '@angular/core/testing';

import { PureHttpService } from './pure-http.service';

describe('PureHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PureHttpService = TestBed.get(PureHttpService);
    expect(service).toBeTruthy();
  });
});
