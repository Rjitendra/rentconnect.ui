import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDivider } from './ng-divider';

describe('NgDivider', () => {
  let component: NgDivider;
  let fixture: ComponentFixture<NgDivider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgDivider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgDivider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
