import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'ng-badge',
  standalone: true,
  imports: [CommonModule, MatBadgeModule],
  template: `
    <ng-content
      [matBadge]="content"
      [matBadgePosition]="position"
      [matBadgeSize]="size"
      [matBadgeColor]="color"
      [matBadgeOverlap]="overlap"
      [matBadgeDisabled]="disabled"
      [matBadgeHidden]="hidden"
    >
    </ng-content>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class NgBadge {
  @Input() content: string | number = '';
  @Input() position:
    | 'above after'
    | 'above before'
    | 'below before'
    | 'below after' = 'above after';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlap: boolean = true;
  @Input() disabled: boolean = false;
  @Input() hidden: boolean = false;
}
