import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ng-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="ng-label" [title]="toolTip">
      {{ label }}
      @if (required) {
        <span class="required-asterisk">*</span>
      }
    </span>
  `,
  styles: [`
    .ng-label {
      display: inline-block;
      font-weight: 500;
    }
    
    .required-asterisk {
      color: #f44336;
      margin-left: 2px;
    }
  `]
})
export class NgLabelComponent {
  @Input() label!: string;
  @Input() required = false;
  @Input() toolTip!: string;
}