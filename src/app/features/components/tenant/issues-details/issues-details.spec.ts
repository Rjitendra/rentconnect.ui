import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesDetails } from './issues-details';

describe('IssuesDetails', () => {
  let component: IssuesDetails;
  let fixture: ComponentFixture<IssuesDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuesDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssuesDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
