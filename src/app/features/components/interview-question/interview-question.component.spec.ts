import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewQuestionComponent } from './interview-question.component';

describe('InterviewQuestionComponent', () => {
  let component: InterviewQuestionComponent;
  let fixture: ComponentFixture<InterviewQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewQuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
