import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDialog } from './ng-dialog';

describe('NgDialog', () => {
  let component: NgDialog;
  let fixture: ComponentFixture<NgDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
