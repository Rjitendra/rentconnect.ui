import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { INav } from '../../models/inav';
import { IUserDetail } from '../../models/user';
import { NgSpinner } from '../ng-spinner/ng-spinner';

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
    NgSpinner,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibLayoutComponent implements AfterViewInit {
  logIn = output<void>();
  logOut = output<void>();
  user: IUserDetail | null = null;

  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  readonly toggleButton = viewChild.required('toggleButton', {
    read: ElementRef,
  });
  readonly navItems = input<INav[]>([]);

  currentYear: number = new Date().getFullYear();
  isExpanded = false; // Default state is collapsed
  isRotated = false;

  private readonly EXPANDED_WIDTH = 240;
  private readonly COLLAPSED_WIDTH = 60;

  ngAfterViewInit() {
    // Initialize the sidenav state
    this.updateSidenavState();
  }

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
    this.isRotated = !this.isRotated;
    this.updateSidenavState();
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
  private updateSidenavState() {
    // The width is now controlled by CSS classes, no need to manually set width
    // This method can be used for any additional state updates if needed
  }

  onLogin() {
    // Implement login logic here
    console.log('Login clicked');
    // You can emit an event or call a service to handle login
  }

  onLogout() {
    this.logOut.emit();
  }

  onProfile() {
    // Implement profile navigation here
    console.log('Profile clicked');
    // You can navigate to profile page or open profile dialog
  }
}
