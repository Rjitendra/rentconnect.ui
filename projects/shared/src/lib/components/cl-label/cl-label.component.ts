import { Component, input } from '@angular/core';


@Component({
  selector: 'cl-label',
  standalone: true,
  imports: [],
  template: `
    <span class="cl-label" [title]="toolTip()">
      {{ label() }}
      @if (required()) {
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
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly toolTip = input.required<string>();
}