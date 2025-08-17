export enum OperationType {
  Create,
  Update,
  Delete,
}

export interface IProductDto {
  id: number;
  pkId?: string;
  isValid?: boolean;
  isVisible?: boolean;
  isDeleted?: boolean;
  isLatestVersion?: boolean;
  baseVersionId?: number;
  versionId?: number;
  statusId?: number;
  updatedBy?: string;
  updatedDate?: string;
  operationType?: OperationType;

  // Product-specific fields
  title: string;
  description: string;
  price: number;
}
