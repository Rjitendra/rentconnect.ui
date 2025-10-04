export enum PropertyType {
  Apartment = 0,
  Villa = 1,
  IndependentHouse = 2,
  RowHouse = 3,
  Plot = 4,
  Studio = 5,
}

export enum FurnishingType {
  Unfurnished = 0,
  SemiFurnished = 1,
  FullyFurnished = 2,
}

export enum LeaseType {
  ShortTerm = 0,
  LongTerm = 1,
}

export enum PropertyStatus {
  Draft = 0,
  Listed = 1,
  Rented = 2,
  Archived = 3,
}

export enum DocumentCategory {
  Aadhaar = 0,
  PAN = 1,
  OwnershipProof = 2,
  UtilityBill = 3,
  NoObjectionCertificate = 4,
  BankProof = 5,
  PropertyImages = 6,
  RentalAgreement = 7,
  AddressProof = 8,
  IdProof = 9,
  ProfilePhoto = 10,
  EmploymentProof = 11,
  PersonPhoto = 12,
  PropertyCondition = 13,
  Other = 14,
}

export enum TenantStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Rejected = 'Rejected',
  Blacklisted = 'Blacklisted',
}
export enum DocumentUploadContext {
  None = 0,
  TenantCreation = 1,
  LandlordOnboarding = 2,
  PropertyRegistration = 3,
}
