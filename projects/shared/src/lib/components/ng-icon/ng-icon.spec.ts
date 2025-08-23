import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgIcon } from './ng-icon';

describe('NgIcon', () => {
  let component: NgIcon;
  let fixture: ComponentFixture<NgIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
