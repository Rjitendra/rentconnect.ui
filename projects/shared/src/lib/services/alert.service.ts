import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Alert, AlertInfo, AlertType } from '../models/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alert$ = new Subject<Alert>();
  constructor() {
    /** */
  }

  showAlert(alertData: Alert, clearExisting?: boolean): void {
    if (clearExisting) {
      this.alert$.next({ errors: [], timeout: 0 } as Alert);
    }
    this.alert$.next(alertData);
  }

  info(alertData: Alert): void {
    alertData = this.setAlertType(alertData, 'info');
    this.alert$.next(alertData);
  }

  warning(alertData: Alert): void {
    alertData = this.setAlertType(alertData, 'warning');
    this.alert$.next(alertData);
  }

  success(alertData: Alert): void {
    alertData = this.setAlertType(alertData, 'success');
    this.alert$.next(alertData);
  }

  error(alertData: Alert): void {
    alertData = this.setAlertType(alertData, 'error');
    this.alert$.next(alertData);
  }

  getAlert(): Observable<Alert> {
    return this.alert$.asObservable();
  }

  clearAlert(): void {
    this.alert$.next({ errors: [], timeout: 0 } as Alert);
  }

  private setAlertType(alertData: Alert, alertType: AlertType): Alert {
    alertData.errors.forEach((error: AlertInfo) => {
      error.errorType = alertType;
    });
    return alertData;
  }
}
