import { SelectOption } from '../../../../projects/shared/src/public-api';
import { FurnishingType, LeaseType, PropertyType } from '../enums/view.enum';

export const acceptedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

// Select options for dropdowns using enums
export const propertyTypeOptions: SelectOption[] = [
  { value: PropertyType.Apartment, label: 'Apartment' },
  { value: PropertyType.Villa, label: 'Villa' },
  { value: PropertyType.IndependentHouse, label: 'Independent House' },
  { value: PropertyType.RowHouse, label: 'Row House' },
  { value: PropertyType.Studio, label: 'Studio' },
  { value: PropertyType.Plot, label: 'Plot' },
];

export const bhkConfigurationOptions: SelectOption[] = [
  { value: '1RK', label: '1 RK' },
  { value: '1BHK', label: '1 BHK' },
  { value: '2BHK', label: '2 BHK' },
  { value: '3BHK', label: '3 BHK' },
  { value: '4BHK', label: '4 BHK' },
  { value: '5BHK+', label: '5+ BHK' },
];

export const furnishingTypeOptions: SelectOption[] = [
  { value: FurnishingType.Unfurnished, label: 'Unfurnished' },
  { value: FurnishingType.SemiFurnished, label: 'Semi Furnished' },
  { value: FurnishingType.FullyFurnished, label: 'Fully Furnished' },
];

export const leaseTypeOptions: SelectOption[] = [
  { value: LeaseType.ShortTerm, label: 'Short Term (< 11 months)' },
  { value: LeaseType.LongTerm, label: 'Long Term (11+ months)' },
];
