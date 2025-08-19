import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRentReport } from './view-rent-report';

describe('ViewRentReport', () => {
  let component: ViewRentReport;
  let fixture: ComponentFixture<ViewRentReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRentReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRentReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
