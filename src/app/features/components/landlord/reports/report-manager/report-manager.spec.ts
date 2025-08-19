import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportManager } from './report-manager';

describe('ReportManager', () => {
  let component: ReportManager;
  let fixture: ComponentFixture<ReportManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
