import { Injectable, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';

export interface NgDialogConfig extends Omit<MatDialogConfig, 'data'> {
  data?: any;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
}

export interface NgDialogResult {
  action: 'confirm' | 'cancel' | 'close';
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class NgDialogService {
  private matDialog = inject(MatDialog);

  /**
   * Open a custom dialog with a component
   */
  open<T, R = any>(
    component: any,
    config?: NgDialogConfig,
  ): MatDialogRef<T, R> {
    const dialogConfig: MatDialogConfig = {
      width: config?.width || '500px',
      disableClose: config?.disableClose ?? false,
      autoFocus: config?.autoFocus ?? true,
      restoreFocus: config?.restoreFocus ?? true,
      ...config,
    };

    return this.matDialog.open(component, dialogConfig);
  }

  /**
   * Open a confirmation dialog
   */
  confirm(config: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    icon?: string;
  }): Observable<NgDialogResult> {
    // For now, return a simple confirm dialog
    // This can be enhanced with a custom confirmation component later
    const result = confirm(
      `${config.title ? config.title + '\n\n' : ''}${config.message}`,
    );

    return new Observable((observer) => {
      observer.next({
        action: result ? 'confirm' : 'cancel',
      });
      observer.complete();
    });
  }

  /**
   * Open an alert dialog
   */
  alert(config: {
    title?: string;
    message: string;
    confirmText?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    icon?: string;
  }): Observable<NgDialogResult> {
    // For now, return a simple alert dialog
    // This can be enhanced with a custom alert component later
    alert(`${config.title ? config.title + '\n\n' : ''}${config.message}`);

    return new Observable((observer) => {
      observer.next({
        action: 'confirm',
      });
      observer.complete();
    });
  }

  /**
   * Close all open dialogs
   */
  closeAll(): void {
    this.matDialog.closeAll();
  }

  /**
   * Get all open dialog references
   */
  getOpenDialogs(): MatDialogRef<any>[] {
    return this.matDialog.openDialogs;
  }
}
