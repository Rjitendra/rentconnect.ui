import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cl-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="cl-label" [title]="toolTip">
      {{ label }}
      @if (required) {
        <span class="required-asterisk">*</span>
      }
    </span>
  `,
  styles: [`
    .cl-label {
      display: inline-block;
      font-weight: 500;
      color: inherit;
    }
    
    .required-asterisk {
      color: #f44336;
      margin-left: 2px;
    }
  `]
})
export class ClLabelComponent {
  @Input() label!: string;
  @Input() required = false;
  @Input() toolTip!: string;
}