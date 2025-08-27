import { inject, Injectable } from '@angular/core';
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
  DocumentCategory,
} from '../enums/view.enum';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


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
  saveProperty(
    formData: FormData,
  ): Observable<any> {

    return this._http.post<any>(`${environment.apiBaseUrl}Property/create`, formData);


  }

  /**
   * Save property as draft
   */
  saveDraft(formData: FormData): Observable<PropertySaveResponse> {
    try {
      // Extract property data from FormData
      const propertyData = this.extractPropertyFromFormData(formData);

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
        id: propertyData.id || this.generateId(),
      };

      // Process uploaded files
      const uploadedFiles = formData.getAll('propertyImages') as File[];
      if (uploadedFiles.length > 0) {
        property.documents = this.processUploadedFiles(uploadedFiles, formData);
      }

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
        };
      });
    } catch (error) {
      return of({
        success: false,
        message: 'Invalid data format. Please try again.',
        errors: [{
          field: 'general',
          displayName: 'General',
          message: 'Failed to process draft data'
        }],
      }).pipe(delay(300));
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
  getProperties(landlordId: number): Observable<IProperty[]> {
    const url = `${environment.apiBaseUrl}Property/landlord/${landlordId}`;
    return this._http.get<IProperty[]>(`${url}`);
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

  /**
   * Extract property data from FormData
   */
  private extractPropertyFromFormData(formData: FormData): PropertyFormData {
    const data: any = {};

    // Extract all non-file fields from FormData
    for (const [key, value] of formData.entries()) {
      // Skip file fields and document metadata
      if (key === 'propertyImages' || key.startsWith('documentMetadata[')) {
        continue;
      }

      // Handle boolean values
      if (value === 'true') {
        data[key] = true;
      } else if (value === 'false') {
        data[key] = false;
      }
      // Handle numeric values
      else if (!isNaN(Number(value)) && value !== '') {
        data[key] = Number(value);
      }
      // Handle Date values
      else if (key.includes('Date') || key === 'availableFrom') {
        data[key] = new Date(value as string);
      }
      // Handle JSON values
      else if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
      // Handle regular string values
      else {
        data[key] = value;
      }
    }

    return data as PropertyFormData;
  }

  /**
   * Process uploaded files and create document objects
   */
  private processUploadedFiles(files: File[], formData: FormData): IDocument[] {
    const documents: IDocument[] = [];

    files.forEach((file, index) => {
      // Try to get metadata for this file
      const metadataKey = `documentMetadata[${index}]`;
      let metadata: any = {};

      try {
        const metadataValue = formData.get(metadataKey);
        if (metadataValue) {
          metadata = JSON.parse(metadataValue as string);
        }
      } catch (error) {
        console.warn(`Failed to parse metadata for file ${index}:`, error);
      }

      // Create document object
      const document: IDocument = {
        ownerId: metadata.ownerId || 0,
        ownerType: metadata.ownerType || 'Property',
        category: metadata.category || DocumentCategory.PropertyImages,
        name: metadata.name || file.name,
        type: metadata.type || file.type,
        size: metadata.size || file.size,
        url: URL.createObjectURL(file), // Create object URL for preview
        file: file, // Keep the actual File object
        uploadedOn: new Date().toISOString(),
        isVerified: false,
        description: metadata.description || `Property image ${index + 1}`
      };

      documents.push(document);
    });

    return documents;
  }


}
