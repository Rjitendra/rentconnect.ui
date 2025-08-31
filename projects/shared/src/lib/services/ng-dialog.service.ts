import { ComponentType } from '@angular/cdk/overlay';
import { Injectable, TemplateRef, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { NgDialog } from '../components/ng-dialog/ng-dialog';
import { NgDialogData, NgDialogResult } from '../models/dialog';

@Injectable({
  providedIn: 'root',
})
export class NgDialogService {
  private matDialog = inject(MatDialog);

  /**
   * Open a custom dialog with a component
   */
  open<T, R = any>(
    component: ComponentType<T> | TemplateRef<T>,
    config?: NgDialogData,
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
  confirm(config: NgDialogData): Observable<NgDialogResult> {
    const dialogConfig: MatDialogConfig = {
      width: config?.width || '400px',
      disableClose: config?.disableClose ?? true,
      autoFocus: config?.autoFocus ?? true,
      restoreFocus: config?.restoreFocus ?? true,
      ...config,
    };

    const dialogRef = this.matDialog.open(NgDialog, {
      ...dialogConfig,
      data: {
        ...config,
        disableClose: config?.disableClose ?? true,
        type: config.type || 'confirm',
        showCancel: config.showCancel !== false, // default true
      },
    });

    return new Observable((observer) => {
      dialogRef.afterClosed().subscribe((result) => {
        observer.next(result || { action: 'close' });
        observer.complete();
      });
    });
  }

  /**
   * Open an alert dialog
   */
  alert(config: NgDialogData): Observable<NgDialogResult> {
    const dialogRef = this.matDialog.open(NgDialog, {
      width: '400px',
      data: {
        ...config,
        disableClose: config?.disableClose ?? false,
        type: config.type || 'info',
        showCancel: false,
      },
    });

    return new Observable((observer) => {
      dialogRef.afterClosed().subscribe((result) => {
        observer.next(result || { action: 'close' });
        observer.complete();
      });
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
