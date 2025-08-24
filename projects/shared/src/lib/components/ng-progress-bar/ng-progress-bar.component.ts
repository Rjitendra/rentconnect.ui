import { Component, input } from '@angular/core';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-progress-bar',
  standalone: true,
  imports: [
    MatProgressBarModule,
    NgLabelComponent,
    NgClarifyTextComponent
],
  templateUrl: './ng-progress-bar.component.html',
  styleUrl: './ng-progress-bar.component.scss'
})
export class NgProgressBarComponent {
  readonly label = input.required<string>();
  readonly mode = input<'determinate' | 'indeterminate' | 'buffer' | 'query'>('determinate');
  readonly value = input(0);
  readonly bufferValue = input(0);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly showValue = input(true);
  readonly valueUnit = input('%');
  readonly displayValue = input.required<string | number>();
  readonly toolTip = input.required<string>();
  readonly clarifyText = input.required<string>();
  readonly hint = input.required<string>();
}