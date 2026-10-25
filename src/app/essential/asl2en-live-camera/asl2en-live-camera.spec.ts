import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asl2enLiveCamera } from './asl2en-live-camera';

describe('Asl2enLiveCamera', () => {
  let component: Asl2enLiveCamera;
  let fixture: ComponentFixture<Asl2enLiveCamera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asl2enLiveCamera],
    }).compileComponents();

    fixture = TestBed.createComponent(Asl2enLiveCamera);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
