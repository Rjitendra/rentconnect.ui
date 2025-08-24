import { Component, input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ng-clarify-text',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <mat-icon 
      class="clarify-icon"
      [class.disabled]="isIconDisabled()"
      [matTooltip]="clarifyText()"
      matTooltipPosition="above">
      help_outline
    </mat-icon>
  `,
  styles: [`
    .clarify-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-left: 4px;
      color: #666;
      cursor: help;
      vertical-align: middle;
    }
    
    .clarify-icon.disabled {
      color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class NgClarifyTextComponent {
  readonly clarifyText = input.required<string>();
  readonly isIconDisabled = input(false);
}