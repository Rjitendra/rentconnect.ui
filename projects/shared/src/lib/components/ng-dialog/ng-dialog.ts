import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgDialogData } from '../../models/dialog';
import { NgButton } from '../ng-button/ng-button';
import { NgIconComponent } from '../ng-icon/ng-icon';

@Component({
  selector: 'ng-dialog',
  standalone: true,
  imports: [CommonModule, NgButton, NgIconComponent],
  templateUrl: './ng-dialog.html',
  styleUrl: './ng-dialog.scss',
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
