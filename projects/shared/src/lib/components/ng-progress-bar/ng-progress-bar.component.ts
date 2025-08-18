import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

@Component({
  selector: 'ng-progress-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    NgLabelComponent,
    NgClarifyTextComponent
  ],
  templateUrl: './ng-progress-bar.component.html',
  styleUrl: './ng-progress-bar.component.scss'
})
export class NgProgressBarComponent {
  @Input() label!: string;
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';
  @Input() value = 0;
  @Input() bufferValue = 0;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showValue = true;
  @Input() valueUnit = '%';
  @Input() displayValue!: string | number;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
}