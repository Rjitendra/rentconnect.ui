import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface StepConfig {
  label: string;
  completed?: boolean;
  editable?: boolean;
  optional?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  content?: TemplateRef<any>;
  data?: any;
}

@Component({
  selector: 'ng-stepper',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ng-stepper.component.html',
  styleUrl: './ng-stepper.component.scss'
})
export class NgStepperComponent {
  @Input() steps: StepConfig[] = [];
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() linear = false;
  @Input() selectedIndex = 0;
  @Input() labelPosition: 'bottom' | 'end' = 'end';
  @Input() showNavigation = true;
  @Input() nextText = 'Next';
  @Input() backText = 'Back';
  @Input() completeText = 'Complete';
  @Input() stepControls: any[] = [];
  
  @Output() selectionChange = new EventEmitter<any>();
  @Output() stepCompleted = new EventEmitter<{ step: StepConfig; index: number }>();
  @Output() stepperCompleted = new EventEmitter<void>();

  onSelectionChange(event: any): void {
    this.selectedIndex = event.selectedIndex;
    this.selectionChange.emit(event);
  }

  goForward(): void {
    if (this.selectedIndex < this.steps.length - 1) {
      this.selectedIndex++;
      this.markStepCompleted(this.selectedIndex - 1);
    }
  }

  goBack(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  complete(): void {
    this.markStepCompleted(this.selectedIndex);
    this.stepperCompleted.emit();
  }

  private markStepCompleted(index: number): void {
    if (this.steps[index]) {
      this.steps[index].completed = true;
      this.stepCompleted.emit({
        step: this.steps[index],
        index: index
      });
    }
  }

  // Public API methods
  next(): void {
    this.goForward();
  }

  previous(): void {
    this.goBack();
  }

  reset(): void {
    this.selectedIndex = 0;
    this.steps.forEach(step => {
      step.completed = false;
      step.hasError = false;
    });
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.selectedIndex = index;
    }
  }
}