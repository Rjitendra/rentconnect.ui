import { MatDialogConfig } from '@angular/material/dialog';

export interface NgDialogData extends Omit<MatDialogConfig, 'data'> {
  data?: unknown;
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
  data?: unknown;
}
