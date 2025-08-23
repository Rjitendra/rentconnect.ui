import { IDocument } from "./document";
import { ILandlord } from "./landlord";
import { IProperty } from "./property";
import { ITicket } from "./tickets";




export interface ITenant {
  id?: number; // BaseEntity
  landlordId: number;
  landlord?: ILandlord;

  propertyId: number;
  property?: IProperty;

  // Personal info
  name: string;
  email?: string;
  phoneNumber: string;
  dob: Date | string;
  age?: number; // Age in years
  occupation: string;

  // Govt. IDs
  aadhaarNumber?: string;
  panNumber?: string;

  // Tenancy details
  tenancyStartDate: Date | string;
  tenancyEndDate?: Date | string;
  rentDueDate: Date | string;
  rentAmount: number;
  securityDeposit: number;

  // File references
  backgroundCheckFileUrl?: string;
  rentGuideFileUrl?: string;
  depositReceiptUrl?: string;

  // Acknowledgement & verification
  isAcknowledge: boolean;
  acknowledgeDate?: Date | string;
  isVerified: boolean;

  // Flags
  isNewTenant: boolean;
  isPrimary: boolean;
  isActive: boolean;

  // Audit
  ipAddress?: string;
  dateCreated?: Date | string;
  dateModified?: Date | string;

  // Identity mapping
  user?: any; // map ApplicationUser interface if needed

  // Extra grouping
  tenantGroup: number;

  // Navigation collections
  tickets?: ITicket[];
  documents?: IDocument[];
}

export interface TenantChildren {
  id?: number;
  tenantGroupId: number;
  name: string;
  email?: string;
  dob: Date | string;
  age?: number; // Age in years
  occupation: string;
  relation?: string; // Relationship to main tenant (e.g., Son, Daughter, etc.)
}

