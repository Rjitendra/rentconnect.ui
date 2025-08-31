import { ResultStatusType } from '../enums/common.enums';

export interface Result<T> {
  entity: T;
  status: ResultStatusType;
  success: boolean;
  message: string | string[];
}

export interface ApiError<T> {
  error?: Result<T>;
  message?: string;
}
