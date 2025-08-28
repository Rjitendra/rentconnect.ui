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
  @Input() ngMenuTriggerFor: any;

  private matMenuTrigger = inject(MatMenuTrigger);

  ngOnInit() {
    // Set the menu reference on the underlying MatMenuTrigger
    if (this.ngMenuTriggerFor) {
      this.matMenuTrigger.menu = this.ngMenuTriggerFor;
    }
  }
}
