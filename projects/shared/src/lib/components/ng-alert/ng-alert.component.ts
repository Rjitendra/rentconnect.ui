import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Alert } from '../../models/alert';

import { AlertService } from '../../services/alert.service';
import { NgAlertMessageComponent } from '../ng-alert-message/ng-alert-message.component';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'ng-alert',
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgAlertMessageComponent],
  templateUrl: './ng-alert.component.html',
  styleUrl: './ng-alert.component.scss',
})
export class NgAlertComponent implements OnInit, OnDestroy {
  private alertService = inject(AlertService);

  alerts: Alert[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit(): void {
    this.alertService.getAlert().subscribe((alert) => {
      if (alert.errors?.length) {
        alert.id = uuidv4();
        this.alerts.push(alert);
        if (alert.timeout) {
          const id = alert.id;
          setTimeout(() => {
            const index = this.alerts.findIndex((a) => a.id === id);
            if (index > -1) {
              this.alerts.splice(index, 1);
            }
          }, alert.timeout);
        }
      } else {
        this.alerts = [];
      }
    });
  }

  getMessageText(alert: Alert): string {
    const msg = alert.errors[0]?.message;
    return typeof msg === 'string' ? msg : 'Invalid alert message';
  }

  getAlertType(alert: Alert): string {
    return alert.errors[0]?.errorType || 'info';
  }

  removeAlert(index: number): void {
    this.alerts.splice(index, 1);
  }

  ngOnDestroy(): void {}
}
