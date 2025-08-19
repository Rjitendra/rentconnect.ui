import {
  FurnishingType,
  LeaseType,
  PropertyStatus,
  PropertyType,
} from '../enums/view.enum';
import { IDocument } from './document';
import { ILandlord } from './landlord';
import { ITenant } from './tenant';

export interface IProperty {
  id?: number; // from BaseEntity
  landlordId: number;
  landlord?: ILandlord;
  tenants?: ITenant[];

  // Basic Info
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  bhkConfiguration?: string;
  floorNumber?: number;
  totalFloors?: number;
  carpetAreaSqFt?: number;
  builtUpAreaSqFt?: number;
  isFurnished?: boolean;
  furnishingType?: FurnishingType;
  numberOfBathrooms?: number;
  numberOfBalconies?: number;

  // Location
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;

  // Rent Details
  monthlyRent?: number;
  securityDeposit?: number;
  isNegotiable?: boolean;
  availableFrom?: Date | string;
  leaseType?: LeaseType;

  // Amenities
  hasLift?: boolean;
  hasParking?: boolean;
  hasPowerBackup?: boolean;
  hasWaterSupply?: boolean;
  hasGasPipeline?: boolean;
  hasSecurity?: boolean;
  hasInternet?: boolean;

  // Status
  status?: PropertyStatus;

  // Audit
  createdOn?: Date | string;
  updatedOn?: Date | string;

  // Documents
  documents?: IDocument[];
}
