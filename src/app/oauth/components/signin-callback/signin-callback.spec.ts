import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninCallback } from './signin-callback';

describe('SigninCallback', () => {
  let component: SigninCallback;
  let fixture: ComponentFixture<SigninCallback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninCallback]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigninCallback);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
