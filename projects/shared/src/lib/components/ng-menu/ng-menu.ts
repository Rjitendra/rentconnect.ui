import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatMenu, MatMenuModule, MatMenuPanel } from '@angular/material/menu';

@Component({
  selector: 'ng-menu',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  exportAs: 'ngMenu',
  template: `
    <mat-menu #menu="matMenu" [class]="panelClass">
      <ng-content></ng-content>
    </mat-menu>
  `,
})
export class NgMenuComponent implements MatMenuPanel<any>, AfterViewInit {
  @Input() panelClass = '';
  @ViewChild('menu', { static: true }) menu!: MatMenu;

  ngAfterViewInit(): void {}

  // --- Required by MatMenuPanel ---
  get templateRef() {
    return this.menu.templateRef;
  }
  get xPosition() {
    return this.menu.xPosition;
  }
  set xPosition(value: 'before' | 'after') {
    this.menu.xPosition = value;
  }
  get yPosition() {
    return this.menu.yPosition;
  }
  set yPosition(value: 'above' | 'below') {
    this.menu.yPosition = value;
  }
  get overlapTrigger() {
    return this.menu.overlapTrigger;
  }
  set overlapTrigger(value: boolean) {
    this.menu.overlapTrigger = value;
  }
  get hasBackdrop() {
    return this.menu.hasBackdrop;
  }
  get backdropClass() {
    return this.menu.backdropClass;
  }

  // --- FIX: implement close property required by MatMenuPanel ---
  close = this.menu.closed;

  focusFirstItem(origin?: any) {
    return this.menu.focusFirstItem(origin);
  }

  resetActiveItem() {
    return this.menu.resetActiveItem();
  }

  setPositionClasses(classes?: any) {
    return this.menu.setPositionClasses(classes);
  }
}
