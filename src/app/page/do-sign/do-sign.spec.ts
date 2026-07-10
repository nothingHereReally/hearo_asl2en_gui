import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoSign } from './do-sign';

describe('DoSign', () => {
  let component: DoSign;
  let fixture: ComponentFixture<DoSign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoSign],
    }).compileComponents();

    fixture = TestBed.createComponent(DoSign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
