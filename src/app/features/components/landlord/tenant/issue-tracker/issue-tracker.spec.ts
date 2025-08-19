import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTracker } from './issue-tracker';

describe('IssueTracker', () => {
  let component: IssueTracker;
  let fixture: ComponentFixture<IssueTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
