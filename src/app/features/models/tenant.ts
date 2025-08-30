import { IDocument } from './document';
import { ILandlord } from './landlord';
import { IProperty } from './property';
import { ITicket } from './tickets';

export interface ITenant {
  id?: number; // BaseEntity
  landlordId: number;
  landlord?: ILandlord;

  propertyId: number;
  property?: IProperty;

  // Personal info
  name: string;
  email: string; // Made required for onboarding
  phoneNumber: string;
  alternatePhoneNumber?: string;
  dob: Date | string;
  age?: number; // Age in years
  occupation: string;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';

  // Address info
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Govt. IDs (Required for Indian tenants)
  aadhaarNumber: string; // Made required
  panNumber: string; // Made required
  drivingLicenseNumber?: string;
  voterIdNumber?: string;

  // Employment details
  employerName?: string;
  employerAddress?: string;
  employerPhone?: string;
  monthlyIncome?: number;
  workExperience?: number; // in years

  // Tenancy details
  tenancyStartDate: Date | string;
  tenancyEndDate?: Date | string;
  rentDueDate: Date | string;
  rentAmount: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  leaseDuration?: number; // in months
  noticePeriod?: number; // in days

  // Agreement details
  agreementSigned?: boolean;
  agreementDate?: Date | string;
  agreementUrl?: string;
  onboardingEmailSent?: boolean;
  onboardingEmailDate?: Date | string;
  onboardingCompleted?: boolean;

  // File references
  backgroundCheckFileUrl?: string;
  rentGuideFileUrl?: string;
  depositReceiptUrl?: string;

  // Acknowledgement & verification
  isAcknowledge: boolean;
  acknowledgeDate?: Date | string;
  isVerified: boolean;
  verificationNotes?: string;

  // Flags
  isNewTenant: boolean;
  isPrimary: boolean;
  isActive: boolean;
  needsOnboarding?: boolean;

  // Audit
  ipAddress?: string;
  dateCreated?: Date | string;
  dateModified?: Date | string;

  // Identity mapping
  user?: any; // map ApplicationUser interface if needed

  // Extra grouping
  tenantGroup: string;

  // Navigation collections
  tickets?: ITicket[];
  documents?: IDocument[];
  children?: TenantChildren[];
}

export interface TenantSaveResponse {
  success: boolean;
  message: string;
  tenant?: ITenant;
  errors?: string[];
}

export interface TenantValidationError {
  field: string;
  message: string;
}

export interface TenantChildren {
  id?: number;
  tenantGroupId: string;
  name: string;
  email?: string;
  dob: Date | string;
  age?: number; // Age in years
  occupation: string;
  relation?: string; // Relationship to main tenant (e.g., Son, Daughter, etc.)
}
