import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'ng-divider',
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  template: `
    <mat-divider [vertical]="vertical" [inset]="inset" [class]="cssClass">
    </mat-divider>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class NgDivider {
  @Input() vertical: boolean = false;
  @Input() inset: boolean = false;
  @Input() cssClass: string = '';
}
