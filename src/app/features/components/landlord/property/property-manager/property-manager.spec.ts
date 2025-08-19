import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyManager } from './property-manager';

describe('PropertyManager', () => {
  let component: PropertyManager;
  let fixture: ComponentFixture<PropertyManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
