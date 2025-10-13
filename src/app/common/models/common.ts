import {
  SelectOption,
  UploadedFile,
} from '../../../../projects/shared/src/public-api';
import { DocumentCategory } from '../../features/enums/view.enum';
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
export interface DocumentUploadModalData {
  availableCategories: SelectOption[];
  tenantName: string;
  tenantIndex: number;
}

export interface DocumentUploadResult {
  category: DocumentCategory;
  files: UploadedFile[];
}
