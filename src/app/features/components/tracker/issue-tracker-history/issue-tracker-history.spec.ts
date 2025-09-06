import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTrackerHistory } from './issue-tracker-history';

describe('IssueTrackerHistory', () => {
  let component: IssueTrackerHistory;
  let fixture: ComponentFixture<IssueTrackerHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueTrackerHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueTrackerHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
