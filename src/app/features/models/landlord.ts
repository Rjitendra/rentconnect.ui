import { IProperty } from './property';
import { ITenant } from './tenant';

export interface ILandlord {
  id?: number; // BaseEntity
  ApplicationUserId?: number;
  dateCreated?: Date | string;
  dateExpiry?: Date | string;
  isRenew?: boolean;

  properties?: IProperty[];
  tenants?: ITenant[];
  documents?: Document[];
}
