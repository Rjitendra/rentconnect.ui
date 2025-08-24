import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { IProperty, PropertyFormData, PropertySaveResponse, PropertyValidationError } from '../models/property';
import { IDocument } from '../models/document';
import {
  PropertyStatus,
  PropertyType,
  FurnishingType,
  LeaseType,
} from '../enums/view.enum';


@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private properties: IProperty[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some mock data if needed
    this.loadMockData();
  }

  /**
   * Save property as published listing
   */
  saveProperty(
    propertyData: PropertyFormData,
  ): Observable<PropertySaveResponse> {
    // Validate required fields for published property
    const validationErrors = this.validatePropertyForPublish(propertyData);

    if (validationErrors.length > 0) {
      return of({
        success: false,
        message: 'Please fix validation errors before publishing',
        errors: validationErrors,
      }).pipe(delay(500)); // Simulate API delay
    }

    // Create property object
    const property: IProperty = {
      ...this.createBaseProperty(propertyData),
      status: PropertyStatus.Listed,
    };

    // Simulate API call
    return this.simulateApiCall(() => {
      this.properties.push(property);
      return {
        success: true,
        propertyId: property.id,
        message: 'Property published successfully! Your listing is now live.',
      };
    });
  }

  /**
   * Save property as draft
   */
  saveDraft(propertyData: PropertyFormData): Observable<PropertySaveResponse> {
    // For draft, we only validate basic required fields
    const validationErrors = this.validatePropertyForDraft(propertyData);

    if (validationErrors.length > 0) {
      return of({
        success: false,
        message: 'Please provide minimum required information',
        errors: validationErrors,
      }).pipe(delay(300));
    }

    // Create draft property object
    const property: IProperty = {
      ...this.createBaseProperty(propertyData),
      status: PropertyStatus.Draft,
    };

    // Simulate API call
    return this.simulateApiCall(() => {
      // Check if updating existing draft
      const existingIndex = this.properties.findIndex(
        (p) => p.id === property.id,
      );
      if (existingIndex >= 0) {
        this.properties[existingIndex] = property;
        return {
          success: true,
          propertyId: property.id,
          message: 'Draft updated successfully!',
        };
      } else {
        this.properties.push(property);
        return {
          success: true,
          propertyId: property.id,
          message: 'Draft saved successfully! You can continue editing later.',
        };
      }
    });
  }

  /**
   * Validate form data using Angular FormGroup
   */
  validateForm(form: FormGroup): PropertyValidationError[] {
    const errors: PropertyValidationError[] = [];

    // Check each form control for errors
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.errors) {
        if (control.errors['required']) {
          errors.push({
            field: key,
            displayName: this.getFieldDisplayName(key),
            message: `${this.getFieldDisplayName(key)} is required`,
          });
        }
        if (control.errors['min']) {
          errors.push({
            field: key,
            displayName: this.getFieldDisplayName(key),
            message: `${this.getFieldDisplayName(key)} must be greater than ${control.errors['min'].min}`,
          });
        }
        if (control.errors['max']) {
          errors.push({
            field: key,
            displayName: this.getFieldDisplayName(key),
            message: `${this.getFieldDisplayName(key)} must be less than ${control.errors['max'].max}`,
          });
        }
        if (control.errors['email']) {
          errors.push({
            field: key,
            displayName: this.getFieldDisplayName(key),
            message: `${this.getFieldDisplayName(key)} must be a valid email address`,
          });
        }
        if (control.errors['pattern']) {
          errors.push({
            field: key,
            displayName: this.getFieldDisplayName(key),
            message: `${this.getFieldDisplayName(key)} format is invalid`,
          });
        }
      }
    });

    return errors;
  }

  /**
   * Get all properties
   */
  getProperties(): Observable<IProperty[]> {
    return of(this.properties).pipe(delay(300));
  }

  /**
   * Get property by ID
   */
  getPropertyById(id: number): Observable<IProperty | null> {
    const property = this.properties.find((p) => p.id === id);
    return of(property || null).pipe(delay(200));
  }

  /**
   * Delete property
   */
  deleteProperty(id: number): Observable<boolean> {
    return this.simulateApiCall(() => {
      const index = this.properties.findIndex((p) => p.id === id);
      if (index >= 0) {
        this.properties.splice(index, 1);
        return true;
      }
      return false;
    });
  }

  // Private helper methods

  private validatePropertyForPublish(
    data: PropertyFormData,
  ): PropertyValidationError[] {
    const errors: PropertyValidationError[] = [];

    // Required fields for publishing (using actual IProperty field names)
    const requiredFields = [
      'title',
      'description',
      'propertyType',
      'bhkConfiguration',
      'carpetAreaSqFt',
      'monthlyRent',
      'securityDeposit',
      'addressLine1',
      'city',
      'state',
      'pinCode',
      'availableFrom',
    ];

    // Check both form fields and IProperty fields
    // No field mappings needed since we use proper IProperty field names

    requiredFields.forEach((field) => {
      let value = data[field as keyof PropertyFormData];

      // Use the field value directly from data

      if (!value || value === '') {
        errors.push({
          field,
          displayName: this.getFieldDisplayName(field),
          message: `${this.getFieldDisplayName(field)} is required for publishing`,
        });
      }
    });

    // Validate numeric fields
    if (data.monthlyRent && data.monthlyRent <= 0) {
      errors.push({
        field: 'monthlyRent',
        displayName: this.getFieldDisplayName('monthlyRent'),
        message: 'Monthly rent must be greater than 0',
      });
    }

    if (data.securityDeposit && data.securityDeposit < 0) {
      errors.push({
        field: 'securityDeposit',
        displayName: this.getFieldDisplayName('securityDeposit'),
        message: 'Security deposit cannot be negative',
      });
    }

    if (data.carpetAreaSqFt && data.carpetAreaSqFt <= 0) {
      errors.push({
        field: 'carpetAreaSqFt',
        displayName: this.getFieldDisplayName('carpetAreaSqFt'),
        message: 'Carpet area must be greater than 0',
      });
    }

    return errors;
  }

  private validatePropertyForDraft(
    data: PropertyFormData,
  ): PropertyValidationError[] {
    const errors: PropertyValidationError[] = [];

    // Minimum required fields for draft (just title)
    if (!data.title || data.title.trim() === '') {
      errors.push({
        field: 'title',
        displayName: this.getFieldDisplayName('title'),
        message: 'Property title is required to save as draft',
      });
    }

    return errors;
  }

  private createBaseProperty(data: PropertyFormData): IProperty {
    return {
      // Use existing IProperty fields if available, otherwise map from form fields
      id: data.id ? Number(data.id) : undefined,
      landlordId: data.landlordId || 1, // Default landlord ID

      // Basic Info
      title: data.title || '',
      description: data.description || '',
      propertyType: data.propertyType as PropertyType,
      bhkConfiguration: data.bhkConfiguration || '',
      floorNumber: data.floorNumber || 0,
      totalFloors: data.totalFloors || 0,
      carpetAreaSqFt: data.carpetAreaSqFt || 0,
      builtUpAreaSqFt: data.builtUpAreaSqFt || 0,
      isFurnished: data.isFurnished || false,
      furnishingType: data.furnishingType as FurnishingType,
      numberOfBathrooms: data.numberOfBathrooms || 0,
      numberOfBalconies: data.numberOfBalconies || 0,

      // Location
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      landmark: data.landmark || '',
      locality: data.locality || '',
      city: data.city || '',
      state: data.state || '',
      pinCode: data.pinCode || '',
      latitude: data.latitude,
      longitude: data.longitude,

      // Rent Details
      monthlyRent: data.monthlyRent || 0,
      securityDeposit: data.securityDeposit || 0,
      isNegotiable: data.isNegotiable || false,
      availableFrom: data.availableFrom || new Date(),
      leaseType: data.leaseType as LeaseType,

      // Amenities
      hasLift: data.hasLift || false,
      hasParking: data.hasParking || false,
      hasPowerBackup: data.hasPowerBackup || false,
      hasWaterSupply: data.hasWaterSupply || false,
      hasGasPipeline: data.hasGasPipeline || false,
      hasSecurity: data.hasSecurity || false,
      hasInternet: data.hasInternet || false,

      // Status and audit
      status: (data.status as PropertyStatus) || PropertyStatus.Draft,
      createdOn: data.createdOn || new Date(),
      updatedOn: new Date(),

      // Documents
      documents: data.documents || [],
    };
  }

  private simulateApiCall<T>(operation: () => T): Observable<T> {
    return of(null).pipe(
      delay(Math.random() * 1000 + 500), // Random delay between 500-1500ms
      map(() => operation()),
    );
  }

  private generateId(): number {
    return this.nextId++;
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      // Basic Info
      title: 'Property Title',
      description: 'Description',
      propertyType: 'Property Type',
      bhkConfiguration: 'BHK Configuration',
      floorNumber: 'Floor Number',
      totalFloors: 'Total Floors',
      carpetAreaSqFt: 'Carpet Area',
      builtUpAreaSqFt: 'Built-up Area',
      furnishingType: 'Furnishing Type',
      numberOfBalconies: 'Number of Balconies',
      numberOfBathrooms: 'Number of Bathrooms',

      // Location
      addressLine1: 'Address',
      addressLine2: 'Address Line 2',
      landmark: 'Landmark',
      locality: 'Locality',
      city: 'City',
      state: 'State',
      pinCode: 'PIN Code',

      // Rent Details
      monthlyRent: 'Monthly Rent',
      securityDeposit: 'Security Deposit',
      availableFrom: 'Available From',
      leaseType: 'Lease Type',

      // Additional fields
      maintenanceCharges: 'Maintenance Charges',
    };

    return fieldNames[fieldName] || fieldName;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  private loadMockData(): void {
    // Add some mock properties for testing
    this.properties = [
      {
        id: 1,
        landlordId: 1,
        title: 'Spacious 2BHK Apartment',
        description: 'Beautiful apartment with modern amenities',
        propertyType: PropertyType.Apartment,
        bhkConfiguration: '2BHK',
        carpetAreaSqFt: 800,
        builtUpAreaSqFt: 1000,
        monthlyRent: 25000,
        securityDeposit: 50000,
        addressLine1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        status: PropertyStatus.Listed,
        createdOn: new Date(),
        updatedOn: new Date(),
        availableFrom: new Date(),
        documents: [],
        furnishingType: FurnishingType.SemiFurnished,
        numberOfBalconies: 2,
        numberOfBathrooms: 2,
        floorNumber: 3,
        totalFloors: 10,
        isNegotiable: true,
        leaseType: LeaseType.LongTerm,
        hasLift: true,
        hasParking: true,
        hasWaterSupply: true,
      },
    ];
  }
}
