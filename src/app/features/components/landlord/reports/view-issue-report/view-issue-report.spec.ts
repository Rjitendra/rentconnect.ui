import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIssueReport } from './view-issue-report';

describe('ViewIssueReport', () => {
  let component: ViewIssueReport;
  let fixture: ComponentFixture<ViewIssueReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewIssueReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIssueReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
