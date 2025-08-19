import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyAdd } from './property-add';

describe('PropertyAdd', () => {
  let component: PropertyAdd;
  let fixture: ComponentFixture<PropertyAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
