import { Component, ContentChildren, QueryList, TemplateRef, output, input } from '@angular/core';
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
  readonly steps = input<StepConfig[]>([]);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly linear = input(false);
  readonly selectedIndex = input(0);
  readonly labelPosition = input<'bottom' | 'end'>('end');
  readonly showNavigation = input(true);
  readonly nextText = input('Next');
  readonly backText = input('Back');
  readonly completeText = input('Complete');
  readonly stepControls = input<any[]>([]);
  
  readonly selectionChange = output<any>();
  readonly stepCompleted = output<{
    step: StepConfig;
    index: number;
}>();
  readonly stepperCompleted = output<void>();

  onSelectionChange(event: any): void {
    this.selectedIndex = event.selectedIndex;
    this.selectionChange.emit(event);
  }

  goForward(): void {
    if (this.selectedIndex() < this.steps().length - 1) {
      selectedIndex++;
      this.markStepCompleted(selectedIndex - 1);
    }
  }

  goBack(): void {
    if (this.selectedIndex() > 0) {
      this.selectedIndex()--;
    }
  }

  complete(): void {
    this.markStepCompleted(this.selectedIndex());
    // TODO: The 'emit' function requires a mandatory void argument
    this.stepperCompleted.emit();
  }

  private markStepCompleted(index: number): void {
    const steps = this.steps();
    if (steps[index]) {
      steps[index].completed = true;
      this.stepCompleted.emit({
        step: steps[index],
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
    this.steps().forEach(step => {
      step.completed = false;
      step.hasError = false;
    });
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps().length) {
      this.selectedIndex = index;
    }
  }
}