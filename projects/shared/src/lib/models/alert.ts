import { Observable } from 'rxjs';

export type AlertType = 'info' | 'error' | 'warning' | 'success';
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'link'
  | 'text';

export interface MessageButton {
  label: string;
  click: () => void;
  isButton?: boolean;
  disabled?: boolean;
  iconType?: string;
  buttonType?: ButtonType;
}

export interface AlertInfo {
  errorType?: AlertType;
  message: string | Observable<string>;
  buttons?: MessageButton[];
  args?: unknown[];
  hideCloseButton?: boolean;
}

export interface Alert {
  id?: string;
  errors: AlertInfo[];
  timeout?: number;
}

export interface ResponseAlertInfo {
  errorList?: AlertInfo[];
  warningList?: AlertInfo[];
  infoList?: AlertInfo[];
  failedRules?: string[];
  hasException?: boolean;
}
