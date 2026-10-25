import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asl2enPredictionCard } from './asl2en-prediction-card';

describe('Asl2enPredictionCard', () => {
  let component: Asl2enPredictionCard;
  let fixture: ComponentFixture<Asl2enPredictionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asl2enPredictionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(Asl2enPredictionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
