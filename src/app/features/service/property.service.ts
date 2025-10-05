import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  AlertService,
  UploadedFile,
} from '../../../../projects/shared/src/public-api';
import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import { acceptedTypes } from '../constants/document.constants';
import {
  FurnishingType,
  LeaseType,
  PropertyStatus,
  PropertyType,
} from '../enums/view.enum';
import { IDocument } from '../models/document';
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
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  readonly maxFiles = 10;
  readonly acceptedTypes = acceptedTypes.filter((type) =>
    type.startsWith('image/'),
  );

  private alertService = inject(AlertService);
  private _http = inject(HttpClient);
  private properties: IProperty[] = [];

  constructor() {
    // Initialize with some mock data if needed
  }

  /**
   * Save property as published listing
   */
  saveProperty(formData: FormData): Observable<Result<PropertySaveResponse>> {
    const idValue = formData.get('id');
    const propertyId = idValue !== null ? +idValue : null;
    if (propertyId) {
      return this._http.put<Result<PropertySaveResponse>>(
        `${environment.apiBaseUrl}Property/update`,
        formData,
      );
    } else {
      // Update existing property
      return this._http.post<Result<PropertySaveResponse>>(
        `${environment.apiBaseUrl}Property/create`,
        formData,
      );
    }
  }

  /**
   * Save property as draft
   * need fix the end point
   */
  saveDraft(formData: FormData): Observable<Result<PropertySaveResponse>> {
    const idValue = formData.get('id');
    const propertyId = idValue !== null ? +idValue : null;
    if (propertyId) {
      return this._http.put<Result<PropertySaveResponse>>(
        `${environment.apiBaseUrl}Property/update`,
        formData,
      );
    } else {
      return this._http.post<Result<PropertySaveResponse>>(
        `${environment.apiBaseUrl}Property/create`,
        formData,
      );
    }
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
  getPropertyById(id: number): Observable<Result<IProperty>> {
    return this._http.get<Result<IProperty>>(
      `${environment.apiBaseUrl}Property/${id}`,
    );
  }

  getPropertyImagesUrl(
    landlordId: number,
    propertyId: number,
  ): Observable<Result<IDocument[]>> {
    const url = `${environment.apiBaseUrl}Property/landlord/${landlordId}/${propertyId}/images`;
    return this._http.get<Result<IDocument[]>>(`${url}`);
  }

  /**
   * Delete property
   */
  deleteProperty(id: number): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Property/${id}`,
    );
  }

  deletePropertyImage(id: number): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Property/delete/${id}`,
    );
  }

  /**
   * Upload documents for a property using DocumentUploadRequestDto format
   */
  uploadPropertyDocuments(
    propertyId: number,
    formData: FormData,
  ): Observable<Result<IDocument[]>> {
    return this._http.post<Result<IDocument[]>>(
      `${environment.apiBaseUrl}Property/${propertyId}/documents/upload`,
      formData,
    );
  }

  /**
   * Get documents for a property
   */
  getPropertyDocuments(propertyId: number): Observable<Result<IDocument[]>> {
    return this._http.get<Result<IDocument[]>>(
      `${environment.apiBaseUrl}Property/${propertyId}/documents`,
    );
  }

  getFieldDisplayName(fieldName: string): string {
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

      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      area: 'Area',

      zipCode: 'Zip Code',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
    };

    return fieldNames[fieldName] || fieldName;
  }

  convertPropertyToFormData(property: IProperty): FormData {
    const formData = new FormData();

    // Handle documents (files + metadata)
    if (property.documents && Array.isArray(property.documents)) {
      property.documents.forEach((doc: IDocument, index: number) => {
        if (doc.file instanceof File) {
          // Append the actual file
          formData.append(`documents[${index}].file`, doc.file, doc.file.name);
        }

        // Append metadata fields individually (so .NET model binder can map)
        if (doc.name) formData.append(`documents[${index}].name`, doc.name);
        if (doc.type) formData.append(`documents[${index}].type`, doc.type);
        if (doc.size)
          formData.append(`documents[${index}].size`, doc.size.toString());
        if (doc.category)
          formData.append(
            `documents[${index}].category`,
            doc.category.toString(),
          );
        if (doc.description)
          formData.append(`documents[${index}].description`, doc.description);
        if (doc.ownerId)
          formData.append(
            `documents[${index}].ownerId`,
            doc.ownerId.toString(),
          );
        if (doc.ownerType)
          formData.append(`documents[${index}].ownerType`, doc.ownerType);
      });
    }

    // Handle other property fields
    Object.entries(property).forEach(([key, value]) => {
      // Skip documents as they're handled above
      if (key === 'documents') return;

      // Skip null/undefined values
      if (value === null || value === undefined) return;

      // Handle arrays (excluding documents)
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      }
      // Handle Date objects
      else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      }
      // Handle nested objects
      else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      }
      // Handle primitives (string, number, boolean)
      else {
        formData.append(key, String(value));
      }
    });

    return formData;
  }
  // Helper method to validate uploaded files
  validateUploadedFiles(files: UploadedFile[]): UploadedFile[] {
    const validFiles: UploadedFile[] = [];

    for (const file of files) {
      let isValid = true;

      // Check file size
      if (file.size > this.maxFileSize) {
        this.alertService.error({
          errors: [
            {
              message: `File "${file.name}" is too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB.`,
              errorType: 'error',
            },
          ],
          timeout: 5000,
        });
        isValid = false;
      }

      // Check file type
      if (!this.acceptedTypes.includes(file.type)) {
        this.alertService.error({
          errors: [
            {
              message: `File "${file.name}" has an unsupported format. Only ${this.acceptedTypes.join(', ')} are allowed.`,
              errorType: 'error',
            },
          ],
          timeout: 5000,
        });
        isValid = false;
      }

      // Check total number of files
      if (validFiles.length >= this.maxFiles) {
        this.alertService.error({
          errors: [
            {
              message: `Maximum ${this.maxFiles} files allowed. Additional files will be ignored.`,
              errorType: 'error',
            },
          ],
          timeout: 5000,
        });
        break;
      }

      if (isValid) {
        validFiles.push(file);
      }
    }

    return validFiles;
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
}
