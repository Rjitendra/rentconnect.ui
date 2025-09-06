import {
  FileUploadConfig,
  SelectOption,
} from '../../../../projects/shared/src/public-api';
import { DocumentCategory } from '../enums/view.enum';

// Document categories for dropdown
export const documentCategories: SelectOption[] = [
  {
    value: DocumentCategory.Aadhaar,
    label: 'Aadhaar Card',
  },
  {
    value: DocumentCategory.PAN,
    label: 'PAN Card',
  },
  {
    value: DocumentCategory.OwnershipProof,
    label: 'Ownership Proof',
  },
  {
    value: DocumentCategory.UtilityBill,
    label: 'Utility Bill',
  },
  {
    value: DocumentCategory.NoObjectionCertificate,
    label: 'NOC Certificate',
  },
  {
    value: DocumentCategory.BankProof,
    label: 'Bank Proof',
  },
  {
    value: DocumentCategory.PropertyImages,
    label: 'Property Photos',
  },
  {
    value: DocumentCategory.RentalAgreement,
    label: 'Rental Agreement',
  },
  {
    value: DocumentCategory.AddressProof,
    label: 'Address Proof',
  },
  {
    value: DocumentCategory.IdProof,
    label: 'ID Proof',
  },
  {
    value: DocumentCategory.ProfilePhoto,
    label: 'Profile Photo',
  },
  {
    value: DocumentCategory.EmploymentProof,
    label: 'Employment Proof',
  },
  {
    value: DocumentCategory.PersonPhoto,
    label: 'Person Photo',
  },
];

export const acceptedTypes: string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
// File upload configuration
export const documentUploadConfig: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  acceptedTypes: acceptedTypes,
  allowMultiple: true,
};
