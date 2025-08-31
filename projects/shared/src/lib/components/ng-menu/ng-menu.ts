import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'ng-menu',
  standalone: true,
  imports: [CommonModule],
  exportAs: 'ng-menu',
  template: `
    <ng-template #menuTemplate>
      <div class="ng-menu-panel" [ngClass]="panelClass">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
})
export class NgMenuComponent {
  @ViewChild('menuTemplate', { static: true }) templateRef!: TemplateRef<any>;
  @Input() panelClass = '';

  constructor(public viewContainerRef: ViewContainerRef) {}
}
