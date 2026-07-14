import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clerk } from './clerk';

describe('Clerk', () => {
  let component: Clerk;
  let fixture: ComponentFixture<Clerk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clerk],
    }).compileComponents();

    fixture = TestBed.createComponent(Clerk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
