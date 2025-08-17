import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgInputComponent } from './ng-input.component';

describe('NgInputComponent', () => {
  let component: NgInputComponent;
  let fixture: ComponentFixture<NgInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
