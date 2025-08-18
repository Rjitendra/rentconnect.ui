import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgButton } from './ng-button';

describe('NgButton', () => {
  let component: NgButton;
  let fixture: ComponentFixture<NgButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
