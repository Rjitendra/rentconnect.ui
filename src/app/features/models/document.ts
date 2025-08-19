import { DocumentCategory } from '../enums/view.enum'; // Assuming this enum is defined in the same directory
export interface IDocument {
  ownerId: number; // Landlord/Tenant ID
  ownerType: string; // Restrict to allowed strings

  category: DocumentCategory; // Enum for Aadhaar, Photo, RentalAgreement, etc.
  fileUrl: string;
  fileName?: string; // Original file name
  fileType?: string; // MIME type, e.g., 'image/jpeg', 'application/pdf'
  fileSize?: number; // Size in bytes

  documentIdentifier?: string; // Unique identifier, optional
  uploadedOn?: string; // Use string for Date serialization (ISO format)
  isVerified?: boolean; // Default false
  verifiedBy?: string; // Optional, default empty
  description?: string; // Optional, default empty
}
