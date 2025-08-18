import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgCheckbox } from './ng-checkbox';

describe('NgCheckbox', () => {
  let component: NgCheckbox;
  let fixture: ComponentFixture<NgCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgCheckbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgCheckbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
