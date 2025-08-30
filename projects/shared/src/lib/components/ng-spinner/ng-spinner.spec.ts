import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSpinner } from './ng-spinner';

describe('NgSpinner', () => {
  let component: NgSpinner;
  let fixture: ComponentFixture<NgSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSpinner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
