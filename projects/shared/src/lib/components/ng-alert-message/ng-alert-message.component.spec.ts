import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgAlertMessageComponent } from './ng-alert-message.component';

describe('NgAlertMessageComponent', () => {
  let component: NgAlertMessageComponent;
  let fixture: ComponentFixture<NgAlertMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgAlertMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgAlertMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
