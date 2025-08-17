import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { INav } from '../../models/inav';

@Component({
  selector: 'lib-layout',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibLayoutComponent implements AfterViewInit {
  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  readonly toggleButton = viewChild.required('toggleButton', { read: ElementRef });
  readonly navItems = input<INav[]>([]);

  currentYear: number = new Date().getFullYear();
  isExpanded = false; // Default state is collapsed
  isRotated = false;

  ngAfterViewInit() {
    setTimeout(() => {
      this.setWidthToToggle();
      // if (
      //   (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) ||
      //   (window.innerWidth <= 1024 && window.innerWidth > window.innerHeight)
      // ) {
      //   this.setWidthToToggle();
      // }
    }, 100);
  }

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
    this.isRotated = !this.isRotated;

    setTimeout(() => {
      this.setWidthToToggle();
      // if (
      //   (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) ||
      //   (window.innerWidth <= 1024 && window.innerWidth > window.innerHeight)
      // ) {
      //   this.setWidthToToggle();
      // }
    }, 100);
    // requestAnimationFrame(() => {
  }

  toggleSubMenu(item: INav) {
    if (item.expanded) {
      this.closeAllChildren(item);
    }
    item.expanded = !item.expanded;
  }

  private closeAllChildren(item: INav) {
    if (item.children) {
      item.children.forEach((child) => {
        child.expanded = false;
        this.closeAllChildren(child); // Recursive call for deep nesting
      });
    }
  }
  private setWidthToToggle() {
    const sidenavWidth = this.sidenav()._content.nativeElement.offsetWidth;
    const offsetHeight = this.sidenav()._content.nativeElement.offsetHeight;
    this.toggleButton().nativeElement.style.width = `${sidenavWidth}px`;
  }
}
