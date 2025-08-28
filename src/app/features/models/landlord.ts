import { IProperty } from './property';
import { ITenant } from './tenant';

export interface ILandlord {
  id?: number; // BaseEntity
  dateCreated?: Date | string;
  dateExpiry?: Date | string;
  isRenew?: boolean;

  properties?: IProperty[];
  tenants?: ITenant[];
  documents?: Document[];
}
