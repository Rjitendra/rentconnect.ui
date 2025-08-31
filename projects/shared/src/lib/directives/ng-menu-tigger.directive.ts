import { Directive, Input, OnInit, inject } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Directive({
  selector: '[ngMenuTriggerFor]',
  standalone: true,
  hostDirectives: [
    {
      directive: MatMenuTrigger,
      inputs: ['matMenuTriggerData', 'matMenuTriggerRestoreFocus'],
      outputs: ['menuOpened', 'menuClosed'],
    },
  ],
})
export class NgMenuTriggerDirective implements OnInit {
  @Input() ngMenuTriggerFor: MatMenuTrigger | any;

  private matMenuTrigger = inject(MatMenuTrigger);

  ngOnInit() {
    if (this.ngMenuTriggerFor?.templateRef) {
      // assign the underlying MatMenu
      this.matMenuTrigger.menu = this.ngMenuTriggerFor.templateRef;
    } else if (this.ngMenuTriggerFor instanceof MatMenuTrigger) {
      this.matMenuTrigger.menu = this.ngMenuTriggerFor.menu;
    }
  }
}
