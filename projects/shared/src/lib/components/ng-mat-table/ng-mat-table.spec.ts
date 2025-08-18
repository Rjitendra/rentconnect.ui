import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMatTable } from './ng-mat-table';

describe('NgMatTable', () => {
  let component: NgMatTable;
  let fixture: ComponentFixture<NgMatTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgMatTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgMatTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
