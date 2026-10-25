import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseModelCard } from './choose-model-card';

describe('ChooseModelCard', () => {
  let component: ChooseModelCard;
  let fixture: ComponentFixture<ChooseModelCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseModelCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseModelCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
