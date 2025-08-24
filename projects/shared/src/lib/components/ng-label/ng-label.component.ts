import { Component, input } from '@angular/core';


@Component({
  selector: 'ng-label',
  standalone: true,
  imports: [],
  template: `
    <span class="ng-label" [title]="toolTip()">
      {{ label() }}
      @if (required()) {
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
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly toolTip = input.required<string>();
}