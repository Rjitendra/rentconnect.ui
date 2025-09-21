import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import { IDocument } from '../models/document';
import { ITenant, ITenantChildren } from '../models/tenant';

export interface ITenantSaveResponse {
  success: boolean;
  message: string;
  tenant?: ITenant;
  errors?: string[];
}

export interface ITenantValidationError {
  field: string;
  message: string;
}

export interface OnboardingEmailRequest {
  tenantId: number;
  templateType: 'welcome' | 'agreement' | 'reminder';
  customMessage?: string;
}

export interface AgreementCreateRequest {
  tenantId: number;
  templateId?: number;
  customTerms?: string[];
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
}

export interface AgreementStatus {
  tenantId: number;
  tenantName?: string;
  tenantGroup?: string;
  isPrimaryTenant: boolean;
  agreementCreated: boolean;
  agreementDate?: Date | string;
  agreementEmailSent: boolean;
  agreementEmailDate?: Date | string;
  agreementAccepted: boolean;
  agreementAcceptedDate?: Date | string;
  agreementAcceptedBy?: string;
  canAcceptAgreement: boolean;
  canLogin: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private _http = inject(HttpClient);

  constructor() {}

  // Get all tenants
  getAllTenants(): Observable<Result<ITenant[]>> {
    return this._http.get<Result<ITenant[]>>(`${environment.apiBaseUrl}Tenant`);
  }

  // Get tenant by ID
  getTenantById(id: number): Observable<Result<ITenant>> {
    return this._http.get<Result<ITenant>>(
      `${environment.apiBaseUrl}Tenant/${id}`,
    );
  }

  // Delete tenant
  deleteTenant(id: number): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Tenant/${id}`,
    );
  }

  // Send onboarding email
  sendOnboardingEmail(
    request: OnboardingEmailRequest,
  ): Observable<Result<boolean>> {
    return this._http.post<Result<boolean>>(
      `${environment.apiBaseUrl}Tenant/onboarding/email/${request.tenantId}`,
      request,
    );
  }

  // Create agreement
  createAgreement(request: AgreementCreateRequest): Observable<Result<string>> {
    return this._http.post<Result<string>>(
      `${environment.apiBaseUrl}Tenant/agreement/create`,
      request,
    );
  }

  // Add tenant child/family member
  addTenantChild(
    tenantId: number,
    child: ITenantChildren,
  ): Observable<Result<ITenantChildren>> {
    return this._http.post<Result<ITenantChildren>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/children`,
      child,
    );
  }

  // Update tenant child
  updateTenantChild(
    tenantId: number,
    childId: number,
    childData: ITenantChildren,
  ): Observable<Result<boolean>> {
    return this._http.put<Result<boolean>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/children/${childId}`,
      childData,
    );
  }

  // Delete tenant child
  deleteTenantChild(
    tenantId: number,
    childId: number,
  ): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/children/${childId}`,
    );
  }

  // Upload tenant document
  uploadTenantDocument(
    tenantId: number,
    file: File,
    category: string,
    description: string = '',
  ): Observable<Result<IDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('description', description);

    return this._http.post<Result<IDocument>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/documents`,
      formData,
    );
  }

  // Get tenant statistics
  getTenantStatistics(landlordId: number): Observable<
    Result<{
      [key: string]: unknown;
      totalTenants: number;
      activeTenants: number;
      pendingOnboarding: number;
      overdueRent: number;
    }>
  > {
    return this._http.get<
      Result<{
        [key: string]: unknown;
        totalTenants: number;
        activeTenants: number;
        pendingOnboarding: number;
        overdueRent: number;
      }>
    >(`${environment.apiBaseUrl}Tenant/statistics/${landlordId}`);
  }

  // Get tenants by property ID using API
  // WARNING: This endpoint needs proper authorization - use getCoTenants() for tenant access
  getTenantsByProperty(propertyId: number): Observable<Result<ITenant[]>> {
    return this._http.get<Result<ITenant[]>>(
      `${environment.apiBaseUrl}Tenant/property/${propertyId}`,
    );
  }

  // Get tenants by landlord ID using API
  // WARNING: This should only be used by landlords, not tenants
  getTenantsByLandlord(landlordId: number): Observable<Result<ITenant[]>> {
    return this._http.get<Result<ITenant[]>>(
      `${environment.apiBaseUrl}Tenant/landlord/${landlordId}`,
    );
  }
  // Save tenant using real API
  saveTenant(formData: FormData): Observable<ITenantSaveResponse> {
    return this._http.post<ITenantSaveResponse>(
      `${environment.apiBaseUrl}Tenant/create`,
      formData,
    );
  }

  // Update tenant using real API
  updateTenant(formData: FormData): Observable<ITenantSaveResponse> {
    return this._http.put<ITenantSaveResponse>(
      `${environment.apiBaseUrl}Tenant/update`,
      formData,
    );
  }
  // Convert tenant data to FormData for API submission
  convertTenantToFormData(
    tenants: ITenant[],
    propertyData: Record<string, unknown>,
    landlordId: number,
  ): FormData {
    const formData = new FormData();

    // Add shared property/tenancy details
    Object.entries(propertyData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add landlord ID
    formData.append('landlordId', landlordId.toString());

    // Add tenant data
    tenants.forEach((tenant, tenantIndex) => {
      // Handle documents (files + metadata)
      if (tenant.documents && Array.isArray(tenant.documents)) {
        tenant.documents.forEach((doc: IDocument, docIndex: number) => {
          if (doc.file instanceof File) {
            // Append the actual file
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].file`,
              doc.file,
              doc.file.name,
            );
          }

          // Append metadata fields individually
          if (doc.name)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].name`,
              doc.name,
            );
          if (doc.type)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].type`,
              doc.type,
            );
          if (doc.size)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].size`,
              doc.size.toString(),
            );
          if (doc.category)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].category`,
              doc.category.toString(),
            );
          if (doc.description)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].description`,
              doc.description,
            );
          if (doc.ownerId)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].ownerId`,
              doc.ownerId.toString(),
            );
          if (doc.ownerType)
            formData.append(
              `tenants[${tenantIndex}].documents[${docIndex}].ownerType`,
              doc.ownerType,
            );
        });
      }

      // Handle other tenant fields
      Object.entries(tenant).forEach(([key, value]) => {
        // Skip documents as they're handled above
        if (key === 'documents') return;

        // Skip null/undefined values
        if (value === null || value === undefined) return;

        // Handle arrays (excluding documents)
        if (Array.isArray(value)) {
          formData.append(
            `tenants[${tenantIndex}].${key}`,
            JSON.stringify(value),
          );
        }
        // Handle Date objects
        else if (value instanceof Date) {
          formData.append(
            `tenants[${tenantIndex}].${key}`,
            value.toISOString(),
          );
        }
        // Handle nested objects
        else if (typeof value === 'object') {
          formData.append(
            `tenants[${tenantIndex}].${key}`,
            JSON.stringify(value),
          );
        }
        // Handle primitives (string, number, boolean)
        else {
          formData.append(`tenants[${tenantIndex}].${key}`, String(value));
        }
      });
    });

    return formData;
  }

  // Validate form data using Angular FormGroup
  validateForm(form: FormGroup): ITenantValidationError[] {
    const errors: ITenantValidationError[] = [];

    // Check each form control for errors
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.errors && control.touched) {
        if (control.errors['required']) {
          errors.push({
            field: key,
            message: `${this.getFieldDisplayName(key)} is required`,
          });
        }
        if (control.errors['email']) {
          errors.push({
            field: key,
            message: 'Please enter a valid email address',
          });
        }
        if (control.errors['min']) {
          const minError = control.errors['min'] as {
            min: number;
            actual: number;
          };
          errors.push({
            field: key,
            message: `Minimum value is ${minError.min}`,
          });
        }
        if (control.errors['pattern']) {
          errors.push({
            field: key,
            message: 'Invalid format',
          });
        }
      }
    });

    return errors;
  }

  /**
   * Delete tenant document
   */
  deleteTenantDocument(documentId: number): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Tenant/documents/${documentId}`,
    );
  }

  /**
   * Get tenant documents
   */
  getTenantDocuments(tenantId: number): Observable<Result<IDocument[]>> {
    return this._http.get<Result<IDocument[]>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/documents`,
    );
  }

  /**
   * Upload new documents for existing tenant
   */
  uploadTenantDocuments(
    tenantId: number,
    documents: Array<{ file: File; category: string; description?: string }>,
  ): Observable<Result<IDocument[]>> {
    const formData = new FormData();

    documents.forEach((doc, index) => {
      // Add file
      formData.append(`Documents[${index}].File`, doc.file);
      // Add metadata
      formData.append(`Documents[${index}].Category`, doc.category);
      formData.append(`Documents[${index}].Description`, doc.description || '');
      formData.append(`Documents[${index}].OwnerId`, tenantId.toString());
      formData.append(`Documents[${index}].OwnerType`, 'Tenant');
      formData.append(`Documents[${index}].TenantId`, tenantId.toString());
    });

    return this._http.post<Result<IDocument[]>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/documents/upload`,
      formData,
    );
  }

  // Accept agreement (primary tenant only)
  acceptAgreement(tenantId: number): Observable<Result<boolean>> {
    return this._http.post<Result<boolean>>(
      `${environment.apiBaseUrl}Tenant/agreement/accept/${tenantId}`,
      {},
    );
  }

  // Get agreement status
  getAgreementStatus(tenantId: number): Observable<Result<AgreementStatus>> {
    return this._http.get<Result<AgreementStatus>>(
      `${environment.apiBaseUrl}Tenant/agreement/status/${tenantId}`,
    );
  }

  // Send onboarding emails using real API
  sendOnboardingEmailsAPI(
    landlordId: number,
    propertyId: number,
  ): Observable<Result<number>> {
    return this._http.post<Result<number>>(
      `${environment.apiBaseUrl}Tenant/onboarding/email/${landlordId}/${propertyId}`,
      {},
    );
  }

  // Get eligible tenants for onboarding
  getEligibleTenantsForOnboarding(
    landlordId: number,
    propertyId: number,
  ): Observable<Result<ITenant[]>> {
    return this._http.get<Result<ITenant[]>>(
      `${environment.apiBaseUrl}Tenant/onboarding/eligible/${landlordId}/${propertyId}`,
    );
  }

  // Get tenant by email
  getTenantByEmail(email: string): Observable<Result<ITenant>> {
    return this._http.get<Result<ITenant>>(
      `${environment.apiBaseUrl}Tenant/by-email/${encodeURIComponent(email)}`,
    );
  }

  // Get co-tenants (same property only) - Secure endpoint for tenants
  getCoTenants(tenantId: number): Observable<Result<ITenant[]>> {
    return this._http.get<Result<ITenant[]>>(
      `${environment.apiBaseUrl}Tenant/${tenantId}/co-tenants`,
    );
  }

  // Send onboarding emails to specific tenant IDs
  sendOnboardingEmailsByTenantIds(
    tenantIds: number[],
  ): Observable<Result<number>> {
    return this._http.post<Result<number>>(
      `${environment.apiBaseUrl}Tenant/onboarding/email/by-ids`,
      tenantIds,
    );
  }
  // Private helper methods
  private validateTenant(tenant: Partial<ITenant>): ITenantValidationError[] {
    const errors: ITenantValidationError[] = [];

    if (!tenant.name || tenant.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name must be at least 2 characters long',
      });
    }

    if (!tenant.email || !this.isValidEmail(tenant.email)) {
      errors.push({
        field: 'email',
        message: 'Valid email address is required',
      });
    }

    if (!tenant.phoneNumber || !this.isValidPhone(tenant.phoneNumber)) {
      errors.push({
        field: 'phoneNumber',
        message: 'Valid phone number is required',
      });
    }

    if (!tenant.dob) {
      errors.push({ field: 'dob', message: 'Date of birth is required' });
    }

    if (!tenant.occupation || tenant.occupation.trim().length < 2) {
      errors.push({ field: 'occupation', message: 'Occupation is required' });
    }

    if (!tenant.aadhaarNumber || !this.isValidAadhaar(tenant.aadhaarNumber)) {
      errors.push({
        field: 'aadhaarNumber',
        message: 'Valid 12-digit Aadhaar number is required',
      });
    }

    if (!tenant.panNumber || !this.isValidPAN(tenant.panNumber)) {
      errors.push({
        field: 'panNumber',
        message: 'Valid PAN number is required (e.g., ABCDE1234F)',
      });
    }

    if (!tenant.propertyId) {
      errors.push({
        field: 'propertyId',
        message: 'Property selection is required',
      });
    }

    if (!tenant.rentAmount || tenant.rentAmount <= 0) {
      errors.push({
        field: 'rentAmount',
        message: 'Valid rent amount is required',
      });
    }

    if (!tenant.tenancyStartDate) {
      errors.push({
        field: 'tenancyStartDate',
        message: 'Tenancy start date is required',
      });
    }

    if (!tenant.rentDueDate) {
      errors.push({
        field: 'rentDueDate',
        message: 'Rent due date is required',
      });
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private isValidAadhaar(aadhaar: string): boolean {
    const aadhaarRegex = /^[0-9]{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
  }

  private isValidPAN(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  }

  private calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  // Helper method to get field display name
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      dob: 'Date of Birth',
      occupation: 'Occupation',
      aadhaarNumber: 'Aadhaar Number',
      panNumber: 'PAN Number',
      propertyId: 'Property',
      rentAmount: 'Rent Amount',
      securityDeposit: 'Security Deposit',
      tenancyStartDate: 'Tenancy Start Date',
      rentDueDate: 'Rent Due Date',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactPhone: 'Emergency Contact Phone',
      emergencyContactRelation: 'Emergency Contact Relation',
    };
    return fieldNames[fieldName] || fieldName;
  }
}
