import { Component, OnInit, input, output } from '@angular/core';
import { MessageButton } from '../../models/alert';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ng-alert-message',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './ng-alert-message.component.html',
  styleUrl: './ng-alert-message.component.scss',
})
export class NgAlertMessageComponent implements OnInit {
  readonly alertType = input.required<string>();
  readonly buttons = input.required<MessageButton[]>();
  readonly id = input.required<number>();
  readonly messageText = input.required<string>();
  readonly hideCloseButton = input.required<boolean>();
  readonly clearAlert = output<number>();

  ngOnInit(): void {
    // this.alertType = this.alertType || 'info';
  }
  onCloseAlert(id: number): void {
    this.clearAlert.emit(id);
  }
  trackByFn(index: number, item: any): any {
    return item ? item.id || index : index;
  }
}
