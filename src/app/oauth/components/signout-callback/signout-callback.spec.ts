import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoutCallback } from './signout-callback';

describe('SignoutCallback', () => {
  let component: SignoutCallback;
  let fixture: ComponentFixture<SignoutCallback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignoutCallback]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignoutCallback);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
