import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgToggleButton } from './ng-toggle-button';

describe('NgToggleButton', () => {
  let component: NgToggleButton;
  let fixture: ComponentFixture<NgToggleButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgToggleButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgToggleButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
