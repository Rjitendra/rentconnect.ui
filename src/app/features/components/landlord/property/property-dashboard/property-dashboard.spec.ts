import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDashboard } from './property-dashboard';

describe('PropertyDashboard', () => {
  let component: PropertyDashboard;
  let fixture: ComponentFixture<PropertyDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
