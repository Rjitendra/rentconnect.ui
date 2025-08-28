import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[ng-menu-item]',
  standalone: true,
  host: {
    class: 'mat-mdc-menu-item mat-mdc-focus-indicator',
    role: 'menuitem',
    tabindex: '-1',
  },
})
export class NgMenuItemDirective implements OnInit {
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    // Apply Material menu item styles and behavior
    const element = this.elementRef.nativeElement;
    element.classList.add('mat-mdc-menu-item', 'mat-mdc-focus-indicator');
    element.setAttribute('role', 'menuitem');
    element.setAttribute('tabindex', '-1');
  }
}
