import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgButton } from '../ng-button/ng-button';
import { NgIconComponent } from '../ng-icon/ng-icon';

export interface NgDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
}

@Component({
  selector: 'ng-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    NgButton,
    NgIconComponent,
  ],
  template: `
    <div class="ng-dialog-container">
      <!-- Header -->
      <div class="ng-dialog-header" [class]="'dialog-' + (data.type || 'info')">
        @if (data.icon) {
          <ng-icon [name]="data.icon!" class="dialog-icon" />
        }
        @if (data.title) {
          <h2 class="dialog-title">{{ data.title }}</h2>
        }
      </div>

      <!-- Content -->
      <div class="ng-dialog-content">
        @if (data.message) {
          <p class="dialog-message">{{ data.message }}</p>
        }
        <ng-content></ng-content>
      </div>

      <!-- Actions -->
      <div class="ng-dialog-actions">
        @if (data.showCancel !== false) {
          <ng-button
            buttonType="button"
            type="text"
            [label]="data.cancelText || 'Cancel'"
            (buttonClick)="onCancel()"
          />
        }
        <ng-button
          buttonType="button"
          type="filled"
          [label]="data.confirmText || 'OK'"
          (buttonClick)="onConfirm()"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .ng-dialog-container {
        padding: 24px;
        min-width: 300px;
      }

      .ng-dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;
      }

      .dialog-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .dialog-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .ng-dialog-content {
        margin-bottom: 24px;
      }

      .dialog-message {
        margin: 0;
        line-height: 1.5;
        color: #666;
      }

      .ng-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .dialog-info .dialog-icon {
        color: #2196f3;
      }
      .dialog-success .dialog-icon {
        color: #4caf50;
      }
      .dialog-warning .dialog-icon {
        color: #ff9800;
      }
      .dialog-error .dialog-icon {
        color: #f44336;
      }
      .dialog-confirm .dialog-icon {
        color: #ff9800;
      }
    `,
  ],
})
export class NgDialog {
  data = inject<NgDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<NgDialog>);

  onConfirm(): void {
    this.dialogRef.close({ action: 'confirm', data: this.data });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel', data: this.data });
  }
}
