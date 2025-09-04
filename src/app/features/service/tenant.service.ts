import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import { DocumentCategory } from '../enums/view.enum';
import { IDocument } from '../models/document';
import { ITenant, TenantChildren } from '../models/tenant';

export interface TenantSaveResponse {
  success: boolean;
  message: string;
  tenant?: ITenant;
  errors?: string[];
}

export interface TenantValidationError {
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

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private _http = inject(HttpClient);
  private tenants: ITenant[] = [
    {
      id: 1,
      landlordId: 1,
      propertyId: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phoneNumber: '+91 9876543210',
      alternatePhoneNumber: '+91 9876543211',
      dob: '1990-05-15',
      age: 34,
      occupation: 'Software Engineer',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '123, Tech Park, Sector 15, Gurgaon, Haryana - 122001',
      permanentAddress: '456, Village Road, Rohtak, Haryana - 124001',
      emergencyContactName: 'Sunita Kumar',
      emergencyContactPhone: '+91 9876543212',
      emergencyContactRelation: 'Wife',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      drivingLicenseNumber: 'HR0619850034761',
      employerName: 'Tech Solutions Pvt Ltd',
      employerAddress: 'Cyber City, Gurgaon',
      employerPhone: '+91 1244567890',
      monthlyIncome: 80000,
      workExperience: 8,
      tenancyStartDate: '2024-01-01',
      tenancyEndDate: '2025-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 25000,
      securityDeposit: 50000,
      maintenanceCharges: 2000,
      leaseDuration: 12,
      noticePeriod: 30,
      agreementSigned: true,
      agreementDate: '2023-12-15',
      agreementUrl: '/documents/agreement_1.pdf',
      onboardingEmailSent: true,
      onboardingEmailDate: '2023-12-20',
      onboardingCompleted: true,
      isAcknowledge: true,
      acknowledgeDate: '2024-01-01',
      isVerified: true,
      verificationNotes: 'All documents verified',
      isNewTenant: false,
      isPrimary: true,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: '1',
      dateCreated: '2023-12-15',
      dateModified: '2024-01-01',
      documents: [
        {
          ownerId: 1,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_1.pdf',
          name: 'Rajesh_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2023-12-15T10:00:00Z',
          isVerified: true,
          verifiedBy: 'System Admin',
        },
        {
          ownerId: 1,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_1.pdf',
          name: 'Rajesh_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2023-12-15T10:05:00Z',
          isVerified: true,
          verifiedBy: 'System Admin',
        },
      ],
      children: [
        {
          id: 1,
          tenantGroupId: '1',
          name: 'Arjun Kumar',
          email: 'arjun.kumar@email.com',
          dob: '2015-03-10',
          age: 9,
          occupation: 'Student',
          relation: 'Son',
        },
      ],
    },
  ];

  private nextId = 22;

  constructor() {}

  // Get all tenants
  getAllTenants(): Observable<ITenant[]> {
    return of([...this.tenants]);
  }

  // Get tenant by ID
  getTenantById(id: number): Observable<ITenant | null> {
    const tenant = this.tenants.find((t) => t.id === id);
    return of(tenant || null);
  }

  // // Get tenants by property ID
  // getTenantsByProperty(propertyId: number): Observable<ITenant[]> {
  //   const propertyTenants = this.tenants.filter(
  //     (t) => t.propertyId === propertyId,
  //   );
  //   return of(propertyTenants);
  // }
  // // Save tenant (create or update)
  // saveTenant(tenant: Partial<ITenant>): Observable<TenantSaveResponse> {
  //   return new Observable((observer) => {
  //     setTimeout(() => {
  //       try {
  //         // Validate tenant data
  //         const validationErrors = this.validateTenant(tenant);
  //         if (validationErrors.length > 0) {
  //           observer.next({
  //             success: false,
  //             message: 'Validation failed',
  //             errors: validationErrors.map((e) => e.message),
  //           });
  //           observer.complete();
  //           return;
  //         }

  //         if (tenant.id) {
  //           // Update existing tenant
  //           const index = this.tenants.findIndex((t) => t.id === tenant.id);
  //           if (index !== -1) {
  //             this.tenants[index] = {
  //               ...this.tenants[index],
  //               ...tenant,
  //               dateModified: new Date().toISOString(),
  //             };
  //             observer.next({
  //               success: true,
  //               message: 'Tenant updated successfully',
  //               tenant: this.tenants[index],
  //             });
  //           } else {
  //             observer.next({
  //               success: false,
  //               message: 'Tenant not found',
  //               errors: ['Tenant with the specified ID does not exist'],
  //             });
  //           }
  //         } else {
  //           // Create new tenant
  //           const newTenant: ITenant = {
  //             ...(tenant as ITenant),
  //             id: this.nextId++,
  //             landlordId: tenant.landlordId || 1,
  //             age: this.calculateAge(tenant.dob as string),
  //             tenantGroup: this.nextId - 1,
  //             dateCreated: new Date().toISOString(),
  //             dateModified: new Date().toISOString(),
  //             documents: tenant.documents || [],
  //             children: tenant.children || [],
  //           };
  //           this.tenants.push(newTenant);
  //           observer.next({
  //             success: true,
  //             message: 'Tenant created successfully',
  //             tenant: newTenant,
  //           });
  //         }
  //       } catch (error) {
  //         observer.next({
  //           success: false,
  //           message: 'An error occurred while saving tenant',
  //           errors: ['Internal server error'],
  //         });
  //       }
  //       observer.complete();
  //     });
  //   });
  // }

  // Delete tenant
  deleteTenant(id: number): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const index = this.tenants.findIndex((t) => t.id === id);
        if (index !== -1) {
          const deletedTenant = this.tenants.splice(index, 1)[0];
          observer.next({
            success: true,
            message: `Tenant ${deletedTenant.name} deleted successfully`,
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Send onboarding email
  sendOnboardingEmail(
    request: OnboardingEmailRequest,
  ): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const tenant = this.tenants.find((t) => t.id === request.tenantId);
        if (tenant) {
          // Update tenant onboarding status
          tenant.onboardingEmailSent = true;
          tenant.onboardingEmailDate = new Date().toISOString();
          tenant.needsOnboarding = false;

          observer.next({
            success: true,
            message: `Onboarding email sent to ${tenant.email}`,
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Create agreement
  createAgreement(
    request: AgreementCreateRequest,
  ): Observable<{ success: boolean; message: string; agreementUrl?: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const tenant = this.tenants.find((t) => t.id === request.tenantId);
        if (tenant) {
          // Update tenant agreement status
          tenant.agreementSigned = true;
          tenant.agreementDate = new Date().toISOString();
          tenant.agreementUrl = `/documents/agreement_${tenant.id}.pdf`;
          tenant.tenancyStartDate = request.startDate;
          tenant.tenancyEndDate = request.endDate;
          tenant.rentAmount = request.rentAmount;
          tenant.securityDeposit = request.securityDeposit;

          observer.next({
            success: true,
            message: `Agreement created for ${tenant.name}`,
            agreementUrl: tenant.agreementUrl,
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Add tenant child/family member
  addTenantChild(
    tenantId: number,
    child: Omit<TenantChildren, 'id'>,
  ): Observable<{ success: boolean; message: string; child?: TenantChildren }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const tenant = this.tenants.find((t) => t.id === tenantId);
        if (tenant) {
          const newChild: TenantChildren = {
            ...child,
            id: Date.now(), // Simple ID generation
            age: this.calculateAge(child.dob as string),
          };

          if (!tenant.children) {
            tenant.children = [];
          }
          tenant.children.push(newChild);

          observer.next({
            success: true,
            message: `Family member ${child.name} added successfully`,
            child: newChild,
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Update tenant child
  updateTenantChild(
    tenantId: number,
    childId: number,
    childData: Partial<TenantChildren>,
  ): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const tenant = this.tenants.find((t) => t.id === tenantId);
        if (tenant && tenant.children) {
          const childIndex = tenant.children.findIndex((c) => c.id === childId);
          if (childIndex !== -1) {
            tenant.children[childIndex] = {
              ...tenant.children[childIndex],
              ...childData,
              age: childData.dob
                ? this.calculateAge(childData.dob as string)
                : tenant.children[childIndex].age,
            };

            observer.next({
              success: true,
              message: 'Family member updated successfully',
            });
          } else {
            observer.next({
              success: false,
              message: 'Family member not found',
            });
          }
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Delete tenant child
  deleteTenantChild(
    tenantId: number,
    childId: number,
  ): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const tenant = this.tenants.find((t) => t.id === tenantId);
        if (tenant && tenant.children) {
          const childIndex = tenant.children.findIndex((c) => c.id === childId);
          if (childIndex !== -1) {
            const deletedChild = tenant.children.splice(childIndex, 1)[0];
            observer.next({
              success: true,
              message: `Family member ${deletedChild.name} removed successfully`,
            });
          } else {
            observer.next({
              success: false,
              message: 'Family member not found',
            });
          }
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Upload tenant document
  uploadTenantDocument(
    tenantId: number,
    document: Omit<IDocument, 'ownerId' | 'ownerType'>,
  ): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const tenant = this.tenants.find((t) => t.id === tenantId);
        if (tenant) {
          const newDocument: IDocument = {
            ...document,
            ownerId: tenantId,
            ownerType: 'Tenant',
            uploadedOn: new Date().toISOString(),
            isVerified: false,
          };

          if (!tenant.documents) {
            tenant.documents = [];
          }
          tenant.documents.push(newDocument);

          observer.next({
            success: true,
            message: 'Document uploaded successfully',
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found',
          });
        }
        observer.complete();
      });
    });
  }

  // Get tenant statistics
  getTenantStatistics(): Observable<{
    total: number;
    active: number;
    inactive: number;
    pendingOnboarding: number;
    totalMonthlyRent: number;
    averageRent: number;
  }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const active = this.tenants.filter((t) => t.isActive);
        const inactive = this.tenants.filter((t) => !t.isActive);
        const pendingOnboarding = this.tenants.filter((t) => t.needsOnboarding);
        const totalMonthlyRent = active.reduce(
          (sum, t) => sum + t.rentAmount,
          0,
        );

        observer.next({
          total: this.tenants.length,
          active: active.length,
          inactive: inactive.length,
          pendingOnboarding: pendingOnboarding.length,
          totalMonthlyRent,
          averageRent: active.length > 0 ? totalMonthlyRent / active.length : 0,
        });
        observer.complete();
      });
    });
  }

  // Get tenants by property ID using API
  getTenantsByProperty(propertyId: number): Observable<ITenant[]> {
    return this._http.get<ITenant[]>(
      `${environment.apiBaseUrl}Tenant/property/${propertyId}`,
    );
  }

  // Get tenants by landlord ID using API
  getTenantsByLandlord(landlordId: number): Observable<Result<ITenant[]>> {
    return this._http.get<Result<ITenant[]>>(
      `${environment.apiBaseUrl}Tenant/landlord/${landlordId}`,
    );
  }
  // Save tenant using real API
  saveTenant(formData: FormData): Observable<TenantSaveResponse> {
    return this._http.post<TenantSaveResponse>(
      `${environment.apiBaseUrl}Tenant/create`,
      formData,
    );
  }

  // Update tenant using real API
  updateTenant(formData: FormData): Observable<TenantSaveResponse> {
    return this._http.put<TenantSaveResponse>(
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
  validateForm(form: FormGroup): TenantValidationError[] {
    const errors: TenantValidationError[] = [];

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
  // Private helper methods
  private validateTenant(tenant: Partial<ITenant>): TenantValidationError[] {
    const errors: TenantValidationError[] = [];

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
