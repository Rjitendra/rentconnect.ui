import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgStepperComponent, StepConfig } from './ng-stepper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';

describe('NgStepperComponent', () => {
  let component: NgStepperComponent;
  let fixture: ComponentFixture<NgStepperComponent>;

  const mockSteps: StepConfig[] = [
    { label: 'Step 1', completed: false },
    { label: 'Step 2', completed: false },
    { label: 'Step 3', completed: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgStepperComponent,
        MatStepperModule,
        MatButtonModule,
        MatIconModule,
        NgLabelComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgStepperComponent);
    component = fixture.componentInstance;
    component.steps = mockSteps;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all steps', () => {
    expect(component.steps.length).toBe(3);
    expect(component.steps[0].label).toBe('Step 1');
    expect(component.steps[1].label).toBe('Step 2');
    expect(component.steps[2].label).toBe('Step 3');
  });

  it('should go forward correctly', () => {
    expect(component.selectedIndex).toBe(0);
    
    component.goForward();
    
    expect(component.selectedIndex).toBe(1);
    expect(component.steps[0].completed).toBe(true);
  });

  it('should go back correctly', () => {
    component.selectedIndex = 2;
    
    component.goBack();
    
    expect(component.selectedIndex).toBe(1);
  });

  it('should not go back from first step', () => {
    component.selectedIndex = 0;
    
    component.goBack();
    
    expect(component.selectedIndex).toBe(0);
  });

  it('should not go forward from last step', () => {
    component.selectedIndex = 2;
    
    component.goForward();
    
    expect(component.selectedIndex).toBe(2);
  });

  it('should emit stepperCompleted when complete is called', () => {
    spyOn(component.stepperCompleted, 'emit');
    
    component.complete();
    
    expect(component.stepperCompleted.emit).toHaveBeenCalled();
  });

  it('should reset stepper correctly', () => {
    component.selectedIndex = 2;
    component.steps.forEach(step => step.completed = true);
    
    component.reset();
    
    expect(component.selectedIndex).toBe(0);
    expect(component.steps.every(step => !step.completed)).toBe(true);
  });

  it('should go to specific step correctly', () => {
    component.goToStep(1);
    expect(component.selectedIndex).toBe(1);
    
    component.goToStep(-1); // Invalid index
    expect(component.selectedIndex).toBe(1); // Should not change
    
    component.goToStep(10); // Invalid index
    expect(component.selectedIndex).toBe(1); // Should not change
  });

  it('should emit selectionChange when selection changes', () => {
    spyOn(component.selectionChange, 'emit');
    const mockEvent = { selectedIndex: 1 };
    
    component.onSelectionChange(mockEvent);
    
    expect(component.selectionChange.emit).toHaveBeenCalledWith(mockEvent);
    expect(component.selectedIndex).toBe(1);
  });
});