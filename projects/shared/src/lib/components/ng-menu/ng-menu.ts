import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule, MatMenuPanel } from '@angular/material/menu';

@Component({
  selector: 'ng-menu',
  standalone: true,
  exportAs: 'ngMenu',
  imports: [CommonModule, MatMenuModule, MatIconModule],
  template: `
    <mat-menu #menu="matMenu" [class]="panelClass">
      <ng-content></ng-content>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class NgMenuComponent implements AfterViewInit, MatMenuPanel<any> {
  @Input() panelClass: string = '';
  @ViewChild('menu', { static: true }) menu!: MatMenu;

  // Implement MatMenuPanel interface by delegating to the internal MatMenu
  get xPosition() {
    return this.menu.xPosition;
  }
  set xPosition(value) {
    this.menu.xPosition = value;
  }

  get yPosition() {
    return this.menu.yPosition;
  }
  set yPosition(value) {
    this.menu.yPosition = value;
  }

  get overlapTrigger() {
    return this.menu.overlapTrigger;
  }
  set overlapTrigger(value) {
    this.menu.overlapTrigger = value;
  }

  get templateRef() {
    return this.menu.templateRef;
  }
  get classList() {
    return this.menu.classList;
  }
  get panelId() {
    return this.menu.panelId;
  }
  get parentMenu() {
    return this.menu.parentMenu;
  }
  get close() {
    return this.menu.close;
  }

  ngAfterViewInit() {
    // Menu is now available
  }

  focusFirstItem(origin?: any) {
    return this.menu.focusFirstItem(origin);
  }

  resetActiveItem() {
    this.menu.resetActiveItem();
  }

  setPositionClasses(classes?: any) {
    this.menu.setPositionClasses(classes);
  }
}
