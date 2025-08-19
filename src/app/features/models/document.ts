import { DocumentType } from '../enums/view.enum'; // Assuming this enum is defined in the same directory
export interface IDocument {
  ownerId: number;             // Landlord/Tenant ID
  ownerType: 'Landlord' | 'Tenant'; // Restrict to allowed strings

  documentType: DocumentType;  // Enum for Aadhaar, Photo, RentalAgreement, etc.
  fileUrl: string;

  documentIdentifier?: string; // Unique identifier, optional
  uploadedOn?: string;         // Use string for Date serialization (ISO format)
  isVerified?: boolean;        // Default false
  verifiedBy?: string;         // Optional, default empty
}