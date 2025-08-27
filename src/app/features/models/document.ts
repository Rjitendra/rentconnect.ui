import { DocumentCategory } from '../enums/view.enum'; // Assuming this enum is defined in the same directory
export interface IDocument {
  id?: number; // Primary key
  ownerId: number; // Landlord/Tenant ID
  ownerType: string; // Restrict to allowed strings

  category: DocumentCategory; // Enum for Aadhaar, Photo, RentalAgreement, etc.

  file?: File;
  name?: string;
  size?: number;
  type?: string;
  url?: string; // for preview
  landlordId?: number; // Optional, if linked to a property
  propertyId?: number; // Optional, if linked to a property
  tenantId?: number; // Optional, if linked to a tenant


  documentIdentifier?: string; // Unique identifier, optional
  uploadedOn?: string; // Use string for Date serialization (ISO format)
  isVerified?: boolean; // Default false
  verifiedBy?: string; // Optional, default empty
  description?: string; // Optional, default empty
}
