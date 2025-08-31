import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import {
  FurnishingType,
  LeaseType,
  PropertyStatus,
  PropertyType,
} from '../enums/view.enum';
import {
  IProperty,
  PropertyFormData,
  PropertySaveResponse,
  PropertyValidationError,
} from '../models/property';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private _http = inject(HttpClient);
  private properties: IProperty[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some mock data if needed
  }

  /**
   * Save property as published listing
   */
  saveProperty(formData: FormData): Observable<Result<PropertySaveResponse>> {
    return this._http.post<Result<PropertySaveResponse>>(
      `${environment.apiBaseUrl}Property/create`,
      formData,
    );
  }

  /**
   * Save property as draft
   * need fix the end point
   */
  saveDraft(formData: FormData): Observable<Result<PropertySaveResponse>> {
    return this._http.post<Result<PropertySaveResponse>>(
      `${environment.apiBaseUrl}Property/create`,
      formData,
    );
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
  getProperties(landlordId: number): Observable<Result<IProperty[]>> {
    const url = `${environment.apiBaseUrl}Property/landlord/${landlordId}`;
    return this._http.get<Result<IProperty[]>>(`${url}`);
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
  deleteProperty(id: number): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Property/${id}`,
    );
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
      const value = data[field as keyof PropertyFormData];

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
}
