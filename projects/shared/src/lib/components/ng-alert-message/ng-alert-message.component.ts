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

  getFormattedMessage(): string {
    const message = this.messageText();
    if (!message) return '';

    // Replace newlines with HTML line breaks and add bullet points for multiple lines
    const lines = message.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 1) {
      return lines[0];
    }

    // Format multiple lines as a proper list
    return lines
      .map((line, index) => {
        if (index === 0) {
          // First line is the header
          return `<div class="error-header">${line}</div>`;
        } else {
          // Subsequent lines are error items
          return `<div class="error-item">• ${line}</div>`;
        }
      })
      .join('');
  }

  onCloseAlert(id: number): void {
    this.clearAlert.emit(id);
  }

  trackByFn(index: number, item: any): any {
    return item ? item.id || index : index;
  }
}
