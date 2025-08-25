 import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { ITenant, TenantChildren } from '../models/tenant';
import { IDocument } from '../models/document';
import { DocumentCategory } from '../enums/view.enum';

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
  providedIn: 'root'
})
export class TenantService {
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
      tenantGroup: 1,
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
          verifiedBy: 'System Admin'
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
          verifiedBy: 'System Admin'
        }
      ],
      children: [
        {
          id: 1,
          tenantGroupId: 1,
          name: 'Arjun Kumar',
          email: 'arjun.kumar@email.com',
          dob: '2015-03-10',
          age: 9,
          occupation: 'Student',
          relation: 'Son'
        }
      ]
    },
    {
      id: 2,
      landlordId: 1,
      propertyId: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phoneNumber: '+91 9876543213',
      dob: '1992-08-20',
      age: 32,
      occupation: 'Marketing Manager',
      gender: 'Female',
      maritalStatus: 'Married',
      currentAddress: '789, Green Valley, Andheri, Mumbai - 400053',
      aadhaarNumber: '123456789013',
      panNumber: 'ABCDE1234G',
      employerName: 'Marketing Solutions Ltd',
      monthlyIncome: 65000,
      workExperience: 6,
      tenancyStartDate: '2024-02-01',
      rentDueDate: '2024-02-05',
      rentAmount: 30000,
      securityDeposit: 60000,
      maintenanceCharges: 2500,
      leaseDuration: 11,
      noticePeriod: 30,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: true,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 2,
      dateCreated: '2024-01-15',
      documents: [
        {
          ownerId: 2,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_priya.pdf',
          name: 'Priya_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-01-15T10:00:00Z',
          isVerified: false,
          verifiedBy: undefined
        }
      ]
    },
    // Property 1 - Additional family members for Rajesh Kumar family
    {
      id: 3,
      landlordId: 1,
      propertyId: 1,
      name: 'Sunita Kumar',
      email: 'sunita.kumar@email.com',
      phoneNumber: '+91 9876543212',
      dob: '1993-08-22',
      age: 31,
      occupation: 'Homemaker',
      gender: 'Female',
      maritalStatus: 'Married',
      currentAddress: '123, 2BHK Apartment, Sector 15, Gurgaon - 122001',
      aadhaarNumber: '234567890124',
      panNumber: 'BCDEF2345G',
      employerName: '',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 25000,
      securityDeposit: 50000,
      maintenanceCharges: 2000,
      leaseDuration: 12,
      noticePeriod: 30,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 1,
      dateCreated: '2023-12-15',
      documents: [
        {
          ownerId: 3,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_sunita.pdf',
          name: 'Sunita_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2023-12-15T10:10:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 3,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_sunita.pdf',
          name: 'Sunita_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2023-12-15T10:15:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    {
      id: 4,
      landlordId: 1,
      propertyId: 1,
      name: 'Maya Kumar',
      email: '',
      phoneNumber: '',
      dob: '2015-11-08',
      age: 9,
      occupation: 'Student',
      gender: 'Female',
      maritalStatus: 'Single',
      currentAddress: '123, 2BHK Apartment, Sector 15, Gurgaon - 122001',
      aadhaarNumber: '345678901235',
      panNumber: '',
      employerName: 'Little Angels School',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 25000,
      securityDeposit: 50000,
      maintenanceCharges: 2000,
      leaseDuration: 12,
      noticePeriod: 30,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 1,
      dateCreated: '2023-12-15',
      documents: [
        {
          ownerId: 4,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_maya.pdf',
          name: 'Maya_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2023-12-15T10:20:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 4,
          ownerType: 'Tenant',
          category: DocumentCategory.IdProof,
          url: '/documents/birth_cert_maya.pdf',
          name: 'Maya_Birth_Certificate.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2023-12-15T10:25:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    // Property 2 - Additional family members for Priya Sharma family
    {
      id: 5,
      landlordId: 1,
      propertyId: 2,
      name: 'Amit Sharma',
      email: 'amit.sharma@email.com',
      phoneNumber: '+91 9876543216',
      dob: '1987-12-10',
      age: 37,
      occupation: 'Data Scientist',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '789, Green Valley, Andheri, Mumbai - 400053',
      aadhaarNumber: '456789012346',
      panNumber: 'DEFGH4567I',
      employerName: 'Data Analytics Corp',
      monthlyIncome: 85000,
      workExperience: 10,
      tenancyStartDate: '2024-02-01',
      rentDueDate: '2024-02-05',
      rentAmount: 30000,
      securityDeposit: 60000,
      maintenanceCharges: 2500,
      leaseDuration: 11,
      noticePeriod: 30,
      agreementSigned: false,
      onboardingEmailSent: true,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: false,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 2,
      dateCreated: '2024-01-15',
      documents: [
        {
          ownerId: 5,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_amit.pdf',
          name: 'Amit_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-01-15T10:30:00Z',
          isVerified: false,
          verifiedBy: undefined
        },
        {
          ownerId: 5,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_amit.pdf',
          name: 'Amit_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2024-01-15T10:35:00Z',
          isVerified: false,
          verifiedBy: undefined
        },
        {
          ownerId: 5,
          ownerType: 'Tenant',
          category: DocumentCategory.Financial,
          url: '/documents/salary_slip_amit.pdf',
          name: 'Amit_Salary_Slip.pdf',
          type: 'application/pdf',
          size: 256000,
          uploadedOn: '2024-01-15T10:40:00Z',
          isVerified: false,
          verifiedBy: undefined
        }
      ],
      children: []
    },
    {
      id: 6,
      landlordId: 1,
      propertyId: 2,
      name: 'Ravi Sharma',
      email: '',
      phoneNumber: '',
      dob: '2018-09-15',
      age: 6,
      occupation: 'Child',
      gender: 'Male',
      maritalStatus: 'Single',
      currentAddress: '789, Green Valley, Andheri, Mumbai - 400053',
      aadhaarNumber: '567890123457',
      panNumber: '',
      employerName: 'Little Angels Kindergarten',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-02-01',
      rentDueDate: '2024-02-05',
      rentAmount: 30000,
      securityDeposit: 60000,
      maintenanceCharges: 2500,
      leaseDuration: 11,
      noticePeriod: 30,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 2,
      dateCreated: '2024-01-15',
      documents: [
        {
          ownerId: 6,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_ravi.pdf',
          name: 'Ravi_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-01-15T10:45:00Z',
          isVerified: false,
          verifiedBy: undefined
        },
        {
          ownerId: 6,
          ownerType: 'Tenant',
          category: DocumentCategory.IdProof,
          url: '/documents/birth_cert_ravi.pdf',
          name: 'Ravi_Birth_Certificate.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2024-01-15T10:50:00Z',
          isVerified: false,
          verifiedBy: undefined
        }
      ],
      children: []
    },
    // Property 3 - Vikram Singh Family (2 members)
    {
      id: 7,
      landlordId: 1,
      propertyId: 3,
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phoneNumber: '+91 9876543217',
      dob: '1985-01-25',
      age: 39,
      occupation: 'Business Owner',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '456, Royal Residency, Sector 21, Noida - 201301',
      aadhaarNumber: '678901234568',
      panNumber: 'EFGHI5678J',
      employerName: 'Singh Enterprises',
      monthlyIncome: 120000,
      workExperience: 15,
      tenancyStartDate: '2024-03-01',
      rentDueDate: '2024-03-05',
      rentAmount: 35000,
      securityDeposit: 70000,
      maintenanceCharges: 3000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: true,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 3,
      dateCreated: '2024-02-15',
      documents: [
        {
          ownerId: 7,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_vikram.pdf',
          name: 'Vikram_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-02-15T10:00:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 7,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_vikram.pdf',
          name: 'Vikram_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2024-02-15T10:05:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 7,
          ownerType: 'Tenant',
          category: DocumentCategory.Financial,
          url: '/documents/business_proof_vikram.pdf',
          name: 'Vikram_Business_Proof.pdf',
          type: 'application/pdf',
          size: 768000,
          uploadedOn: '2024-02-15T10:10:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    {
      id: 8,
      landlordId: 1,
      propertyId: 3,
      name: 'Kavita Singh',
      email: 'kavita.singh@email.com',
      phoneNumber: '+91 9876543218',
      dob: '1988-06-18',
      age: 36,
      occupation: 'Interior Designer',
      gender: 'Female',
      maritalStatus: 'Married',
      currentAddress: '456, Royal Residency, Sector 21, Noida - 201301',
      aadhaarNumber: '789012345679',
      panNumber: 'FGHIJ6789K',
      employerName: 'Creative Interiors Pvt Ltd',
      monthlyIncome: 55000,
      workExperience: 8,
      tenancyStartDate: '2024-03-01',
      rentDueDate: '2024-03-05',
      rentAmount: 35000,
      securityDeposit: 70000,
      maintenanceCharges: 3000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 3,
      dateCreated: '2024-02-15',
      documents: [
        {
          ownerId: 8,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_kavita.pdf',
          name: 'Kavita_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-02-15T10:15:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 8,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_kavita.pdf',
          name: 'Kavita_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2024-02-15T10:20:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 8,
          ownerType: 'Tenant',
          category: DocumentCategory.EmploymentProof,
          url: '/documents/employment_kavita.pdf',
          name: 'Kavita_Employment_Letter.pdf',
          type: 'application/pdf',
          size: 384000,
          uploadedOn: '2024-02-15T10:25:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    // Property 4 - Neha Gupta (Single tenant)
    {
      id: 9,
      landlordId: 1,
      propertyId: 4,
      name: 'Neha Gupta',
      email: 'neha.gupta@email.com',
      phoneNumber: '+91 9876543219',
      dob: '1995-09-12',
      age: 29,
      occupation: 'Software Developer',
      gender: 'Female',
      maritalStatus: 'Single',
      currentAddress: '789, Tech Tower, Electronic City, Bangalore - 560100',
      aadhaarNumber: '890123456780',
      panNumber: 'GHIJK7890L',
      employerName: 'TechCorp Solutions',
      monthlyIncome: 95000,
      workExperience: 5,
      tenancyStartDate: '2024-04-01',
      rentDueDate: '2024-04-05',
      rentAmount: 28000,
      securityDeposit: 56000,
      maintenanceCharges: 2200,
      leaseDuration: 12,
      noticePeriod: 30,
      agreementSigned: false,
      onboardingEmailSent: true,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: true,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 4,
      dateCreated: '2024-03-20',
      documents: [
        {
          ownerId: 9,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_neha.pdf',
          name: 'Neha_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-03-20T10:00:00Z',
          isVerified: false,
          verifiedBy: undefined
        },
        {
          ownerId: 9,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_neha.pdf',
          name: 'Neha_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2024-03-20T10:05:00Z',
          isVerified: false,
          verifiedBy: undefined
        }
      ],
      children: []
    },
    // Property 5 - Rohit Mehta Family (3 members)
    {
      id: 10,
      landlordId: 1,
      propertyId: 5,
      name: 'Rohit Mehta',
      email: 'rohit.mehta@email.com',
      phoneNumber: '+91 9876543220',
      dob: '1982-11-30',
      age: 42,
      occupation: 'Doctor',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '321, Medical Plaza, Koramangala, Bangalore - 560034',
      aadhaarNumber: '901234567891',
      panNumber: 'HIJKL8901M',
      employerName: 'Apollo Hospitals',
      monthlyIncome: 150000,
      workExperience: 18,
      tenancyStartDate: '2024-05-01',
      rentDueDate: '2024-05-05',
      rentAmount: 40000,
      securityDeposit: 80000,
      maintenanceCharges: 3500,
      leaseDuration: 36,
      noticePeriod: 90,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: true,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 5,
      dateCreated: '2024-04-10',
      documents: [],
      children: []
    },
    {
      id: 11,
      landlordId: 1,
      propertyId: 5,
      name: 'Anjali Mehta',
      email: 'anjali.mehta@email.com',
      phoneNumber: '+91 9876543221',
      dob: '1985-04-14',
      age: 39,
      occupation: 'Nurse',
      gender: 'Female',
      maritalStatus: 'Married',
      currentAddress: '321, Medical Plaza, Koramangala, Bangalore - 560034',
      aadhaarNumber: '012345678902',
      panNumber: 'IJKLM9012N',
      employerName: 'Fortis Hospital',
      monthlyIncome: 45000,
      workExperience: 12,
      tenancyStartDate: '2024-05-01',
      rentDueDate: '2024-05-05',
      rentAmount: 40000,
      securityDeposit: 80000,
      maintenanceCharges: 3500,
      leaseDuration: 36,
      noticePeriod: 90,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: false,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 5,
      dateCreated: '2024-04-10',
      documents: [],
      children: []
    },
    {
      id: 12,
      landlordId: 1,
      propertyId: 5,
      name: 'Aarav Mehta',
      email: '',
      phoneNumber: '',
      dob: '2012-08-22',
      age: 12,
      occupation: 'Student',
      gender: 'Male',
      maritalStatus: 'Single',
      currentAddress: '321, Medical Plaza, Koramangala, Bangalore - 560034',
      aadhaarNumber: '123456789013',
      panNumber: '',
      employerName: 'Delhi Public School',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-05-01',
      rentDueDate: '2024-05-05',
      rentAmount: 40000,
      securityDeposit: 80000,
      maintenanceCharges: 3500,
      leaseDuration: 36,
      noticePeriod: 90,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 5,
      dateCreated: '2024-04-10',
      documents: [],
      children: []
    },
    // Property 6 - Sanjay Patel Family (5 members - Large Joint Family)
    {
      id: 13,
      landlordId: 1,
      propertyId: 6,
      name: 'Sanjay Patel',
      email: 'sanjay.patel@email.com',
      phoneNumber: '+91 9876543222',
      dob: '1978-07-08',
      age: 46,
      occupation: 'Chartered Accountant',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '654, Heritage Villa, Satellite, Ahmedabad - 380015',
      aadhaarNumber: '234567890124',
      panNumber: 'JKLMN0123O',
      employerName: 'Patel & Associates CA Firm',
      monthlyIncome: 180000,
      workExperience: 22,
      tenancyStartDate: '2024-06-01',
      rentDueDate: '2024-06-05',
      rentAmount: 45000,
      securityDeposit: 90000,
      maintenanceCharges: 4000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: true,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 6,
      dateCreated: '2024-05-15',
      documents: [
        {
          ownerId: 13,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_sanjay.pdf',
          name: 'Sanjay_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-05-15T10:00:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        },
        {
          ownerId: 13,
          ownerType: 'Tenant',
          category: DocumentCategory.PAN,
          url: '/documents/pan_sanjay.pdf',
          name: 'Sanjay_PAN.pdf',
          type: 'application/pdf',
          size: 512000,
          uploadedOn: '2024-05-15T10:05:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    {
      id: 14,
      landlordId: 1,
      propertyId: 6,
      name: 'Meera Patel',
      email: 'meera.patel@email.com',
      phoneNumber: '+91 9876543223',
      dob: '1982-03-25',
      age: 42,
      occupation: 'School Principal',
      gender: 'Female',
      maritalStatus: 'Married',
      currentAddress: '654, Heritage Villa, Satellite, Ahmedabad - 380015',
      aadhaarNumber: '345678901235',
      panNumber: 'KLMNO1234P',
      employerName: 'Bright Future School',
      monthlyIncome: 85000,
      workExperience: 18,
      tenancyStartDate: '2024-06-01',
      rentDueDate: '2024-06-05',
      rentAmount: 45000,
      securityDeposit: 90000,
      maintenanceCharges: 4000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 6,
      dateCreated: '2024-05-15',
      documents: [
        {
          ownerId: 14,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_meera.pdf',
          name: 'Meera_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-05-15T10:10:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    {
      id: 15,
      landlordId: 1,
      propertyId: 6,
      name: 'Kiran Patel',
      email: 'kiran.patel@email.com',
      phoneNumber: '+91 9876543224',
      dob: '2005-11-12',
      age: 19,
      occupation: 'College Student',
      gender: 'Male',
      maritalStatus: 'Single',
      currentAddress: '654, Heritage Villa, Satellite, Ahmedabad - 380015',
      aadhaarNumber: '456789012346',
      panNumber: 'LMNOP2345Q',
      employerName: 'Gujarat University',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-06-01',
      rentDueDate: '2024-06-05',
      rentAmount: 45000,
      securityDeposit: 90000,
      maintenanceCharges: 4000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: false,
      isAcknowledge: true,
      isVerified: false,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 6,
      dateCreated: '2024-05-15',
      documents: [],
      children: []
    },
    {
      id: 16,
      landlordId: 1,
      propertyId: 6,
      name: 'Diya Patel',
      email: '',
      phoneNumber: '',
      dob: '2008-09-18',
      age: 16,
      occupation: 'High School Student',
      gender: 'Female',
      maritalStatus: 'Single',
      currentAddress: '654, Heritage Villa, Satellite, Ahmedabad - 380015',
      aadhaarNumber: '567890123457',
      panNumber: '',
      employerName: 'St. Xavier High School',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-06-01',
      rentDueDate: '2024-06-05',
      rentAmount: 45000,
      securityDeposit: 90000,
      maintenanceCharges: 4000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 6,
      dateCreated: '2024-05-15',
      documents: [],
      children: []
    },
    {
      id: 17,
      landlordId: 1,
      propertyId: 6,
      name: 'Ravi Patel',
      email: '',
      phoneNumber: '',
      dob: '2016-01-30',
      age: 8,
      occupation: 'Primary School Student',
      gender: 'Male',
      maritalStatus: 'Single',
      currentAddress: '654, Heritage Villa, Satellite, Ahmedabad - 380015',
      aadhaarNumber: '678901234568',
      panNumber: '',
      employerName: 'Little Flowers School',
      monthlyIncome: 0,
      workExperience: 0,
      tenancyStartDate: '2024-06-01',
      rentDueDate: '2024-06-05',
      rentAmount: 45000,
      securityDeposit: 90000,
      maintenanceCharges: 4000,
      leaseDuration: 24,
      noticePeriod: 60,
      agreementSigned: false,
      onboardingEmailSent: false,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 6,
      dateCreated: '2024-05-15',
      documents: [],
      children: []
    },
    // Property 7 - Anita Joshi (Single Working Professional)
    {
      id: 18,
      landlordId: 1,
      propertyId: 7,
      name: 'Anita Joshi',
      email: 'anita.joshi@email.com',
      phoneNumber: '+91 9876543225',
      dob: '1991-12-05',
      age: 33,
      occupation: 'Investment Banker',
      gender: 'Female',
      maritalStatus: 'Single',
      currentAddress: '987, Sky Heights, Bandra West, Mumbai - 400050',
      aadhaarNumber: '789012345679',
      panNumber: 'MNOPQ3456R',
      employerName: 'Goldman Sachs',
      monthlyIncome: 250000,
      workExperience: 11,
      tenancyStartDate: '2024-07-01',
      rentDueDate: '2024-07-05',
      rentAmount: 55000,
      securityDeposit: 110000,
      maintenanceCharges: 5000,
      leaseDuration: 12,
      noticePeriod: 30,
      agreementSigned: false,
      onboardingEmailSent: true,
      onboardingCompleted: false,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: true,
      isPrimary: true,
      isActive: true,
      needsOnboarding: true,
      tenantGroup: 7,
      dateCreated: '2024-06-20',
      documents: [
        {
          ownerId: 18,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_anita.pdf',
          name: 'Anita_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-06-20T10:00:00Z',
          isVerified: false,
          verifiedBy: undefined
        },
        {
          ownerId: 18,
          ownerType: 'Tenant',
          category: DocumentCategory.Financial,
          url: '/documents/salary_slip_anita.pdf',
          name: 'Anita_Salary_Slip.pdf',
          type: 'application/pdf',
          size: 384000,
          uploadedOn: '2024-06-20T10:10:00Z',
          isVerified: false,
          verifiedBy: undefined
        }
      ],
      children: []
    },
    // Property 8 - Ramesh Iyer Family (Multi-generational - 3 members)
    {
      id: 19,
      landlordId: 1,
      propertyId: 8,
      name: 'Ramesh Iyer',
      email: 'ramesh.iyer@email.com',
      phoneNumber: '+91 9876543226',
      dob: '1955-04-15',
      age: 69,
      occupation: 'Retired Professor',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '321, Sunset Apartments, Jayanagar, Bangalore - 560011',
      aadhaarNumber: '890123456780',
      panNumber: 'NOPQR4567S',
      employerName: 'Indian Institute of Science (Retired)',
      monthlyIncome: 45000,
      workExperience: 40,
      tenancyStartDate: '2024-08-01',
      rentDueDate: '2024-08-05',
      rentAmount: 22000,
      securityDeposit: 44000,
      maintenanceCharges: 1800,
      leaseDuration: 36,
      noticePeriod: 90,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: true,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 8,
      dateCreated: '2024-07-10',
      documents: [
        {
          ownerId: 19,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_ramesh.pdf',
          name: 'Ramesh_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-07-10T10:00:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    {
      id: 20,
      landlordId: 1,
      propertyId: 8,
      name: 'Lakshmi Iyer',
      email: 'lakshmi.iyer@email.com',
      phoneNumber: '+91 9876543227',
      dob: '1958-08-22',
      age: 66,
      occupation: 'Retired Teacher',
      gender: 'Female',
      maritalStatus: 'Married',
      currentAddress: '321, Sunset Apartments, Jayanagar, Bangalore - 560011',
      aadhaarNumber: '901234567891',
      panNumber: 'OPQRS5678T',
      employerName: 'Government School (Retired)',
      monthlyIncome: 25000,
      workExperience: 35,
      tenancyStartDate: '2024-08-01',
      rentDueDate: '2024-08-05',
      rentAmount: 22000,
      securityDeposit: 44000,
      maintenanceCharges: 1800,
      leaseDuration: 36,
      noticePeriod: 90,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 8,
      dateCreated: '2024-07-10',
      documents: [
        {
          ownerId: 20,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_lakshmi.pdf',
          name: 'Lakshmi_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-07-10T10:10:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    },
    {
      id: 21,
      landlordId: 1,
      propertyId: 8,
      name: 'Suresh Iyer',
      email: 'suresh.iyer@email.com',
      phoneNumber: '+91 9876543228',
      dob: '1985-02-28',
      age: 39,
      occupation: 'Software Architect',
      gender: 'Male',
      maritalStatus: 'Married',
      currentAddress: '321, Sunset Apartments, Jayanagar, Bangalore - 560011',
      aadhaarNumber: '012345678902',
      panNumber: 'PQRST6789U',
      employerName: 'Microsoft India',
      monthlyIncome: 180000,
      workExperience: 16,
      tenancyStartDate: '2024-08-01',
      rentDueDate: '2024-08-05',
      rentAmount: 22000,
      securityDeposit: 44000,
      maintenanceCharges: 1800,
      leaseDuration: 36,
      noticePeriod: 90,
      agreementSigned: true,
      onboardingEmailSent: true,
      onboardingCompleted: true,
      isAcknowledge: true,
      isVerified: true,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      needsOnboarding: false,
      tenantGroup: 8,
      dateCreated: '2024-07-10',
      documents: [
        {
          ownerId: 21,
          ownerType: 'Tenant',
          category: DocumentCategory.Aadhaar,
          url: '/documents/aadhaar_suresh.pdf',
          name: 'Suresh_Aadhaar.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedOn: '2024-07-10T10:20:00Z',
          isVerified: true,
          verifiedBy: 'System Admin'
        }
      ],
      children: []
    }
  ];

  private nextId = 22;

  constructor() {}

  // Get all tenants
  getAllTenants(): Observable<ITenant[]> {
    return of([...this.tenants]);
  }

  // Get tenant by ID
  getTenantById(id: number): Observable<ITenant | null> {
    const tenant = this.tenants.find(t => t.id === id);
    return of(tenant || null);
  }

  // Get tenants by property ID
  getTenantsByProperty(propertyId: number): Observable<ITenant[]> {
    const propertyTenants = this.tenants.filter(t => t.propertyId === propertyId);
    return of(propertyTenants);
  }
 // Save tenant (create or update)
  saveTenant(tenant: Partial<ITenant>): Observable<TenantSaveResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          // Validate tenant data
          const validationErrors = this.validateTenant(tenant);
          if (validationErrors.length > 0) {
            observer.next({
              success: false,
              message: 'Validation failed',
              errors: validationErrors.map(e => e.message)
            });
            observer.complete();
            return;
          }

          if (tenant.id) {
            // Update existing tenant
            const index = this.tenants.findIndex(t => t.id === tenant.id);
            if (index !== -1) {
              this.tenants[index] = {
                ...this.tenants[index],
                ...tenant,
                dateModified: new Date().toISOString()
              };
              observer.next({
                success: true,
                message: 'Tenant updated successfully',
                tenant: this.tenants[index]
              });
            } else {
              observer.next({
                success: false,
                message: 'Tenant not found',
                errors: ['Tenant with the specified ID does not exist']
              });
            }
          } else {
            // Create new tenant
            const newTenant: ITenant = {
              ...tenant as ITenant,
              id: this.nextId++,
              landlordId: tenant.landlordId || 1,
              age: this.calculateAge(tenant.dob as string),
              tenantGroup: this.nextId - 1,
              dateCreated: new Date().toISOString(),
              dateModified: new Date().toISOString(),
              documents: tenant.documents || [],
              children: tenant.children || []
            };
            this.tenants.push(newTenant);
            observer.next({
              success: true,
              message: 'Tenant created successfully',
              tenant: newTenant
            });
          }
        } catch (error) {
          observer.next({
            success: false,
            message: 'An error occurred while saving tenant',
            errors: ['Internal server error']
          });
        }
        observer.complete();
      });
    });
  }

  // Delete tenant
  deleteTenant(id: number): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const index = this.tenants.findIndex(t => t.id === id);
        if (index !== -1) {
          const deletedTenant = this.tenants.splice(index, 1)[0];
          observer.next({
            success: true,
            message: `Tenant ${deletedTenant.name} deleted successfully`
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
          });
        }
        observer.complete();
      });
    });
  }

  // Send onboarding email
  sendOnboardingEmail(request: OnboardingEmailRequest): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const tenant = this.tenants.find(t => t.id === request.tenantId);
        if (tenant) {
          // Update tenant onboarding status
          tenant.onboardingEmailSent = true;
          tenant.onboardingEmailDate = new Date().toISOString();
          tenant.needsOnboarding = false;
          
          observer.next({
            success: true,
            message: `Onboarding email sent to ${tenant.email}`
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
          });
        }
        observer.complete();
      });
    });
  }

  // Create agreement
  createAgreement(request: AgreementCreateRequest): Observable<{ success: boolean; message: string; agreementUrl?: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const tenant = this.tenants.find(t => t.id === request.tenantId);
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
            agreementUrl: tenant.agreementUrl
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
          });
        }
        observer.complete();
      });
    });
  }

  // Add tenant child/family member
  addTenantChild(tenantId: number, child: Omit<TenantChildren, 'id'>): Observable<{ success: boolean; message: string; child?: TenantChildren }> {
    return new Observable(observer => {
      setTimeout(() => {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (tenant) {
          const newChild: TenantChildren = {
            ...child,
            id: Date.now(), // Simple ID generation
            age: this.calculateAge(child.dob as string)
          };
          
          if (!tenant.children) {
            tenant.children = [];
          }
          tenant.children.push(newChild);
          
          observer.next({
            success: true,
            message: `Family member ${child.name} added successfully`,
            child: newChild
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
          });
        }
        observer.complete();
      });
    });
  }

  // Update tenant child
  updateTenantChild(tenantId: number, childId: number, childData: Partial<TenantChildren>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (tenant && tenant.children) {
          const childIndex = tenant.children.findIndex(c => c.id === childId);
          if (childIndex !== -1) {
            tenant.children[childIndex] = {
              ...tenant.children[childIndex],
              ...childData,
              age: childData.dob ? this.calculateAge(childData.dob as string) : tenant.children[childIndex].age
            };
            
            observer.next({
              success: true,
              message: 'Family member updated successfully'
            });
          } else {
            observer.next({
              success: false,
              message: 'Family member not found'
            });
          }
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
          });
        }
        observer.complete();
      });
    });
  }

  // Delete tenant child
  deleteTenantChild(tenantId: number, childId: number): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (tenant && tenant.children) {
          const childIndex = tenant.children.findIndex(c => c.id === childId);
          if (childIndex !== -1) {
            const deletedChild = tenant.children.splice(childIndex, 1)[0];
            observer.next({
              success: true,
              message: `Family member ${deletedChild.name} removed successfully`
            });
          } else {
            observer.next({
              success: false,
              message: 'Family member not found'
            });
          }
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
          });
        }
        observer.complete();
      });
    });
  }

  // Upload tenant document
  uploadTenantDocument(tenantId: number, document: Omit<IDocument, 'ownerId' | 'ownerType'>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (tenant) {
          const newDocument: IDocument = {
            ...document,
            ownerId: tenantId,
            ownerType: 'Tenant',
            uploadedOn: new Date().toISOString(),
            isVerified: false
          };
          
          if (!tenant.documents) {
            tenant.documents = [];
          }
          tenant.documents.push(newDocument);
          
          observer.next({
            success: true,
            message: 'Document uploaded successfully'
          });
        } else {
          observer.next({
            success: false,
            message: 'Tenant not found'
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
    return new Observable(observer => {
      setTimeout(() => {
        const active = this.tenants.filter(t => t.isActive);
        const inactive = this.tenants.filter(t => !t.isActive);
        const pendingOnboarding = this.tenants.filter(t => t.needsOnboarding);
        const totalMonthlyRent = active.reduce((sum, t) => sum + t.rentAmount, 0);
        
        observer.next({
          total: this.tenants.length,
          active: active.length,
          inactive: inactive.length,
          pendingOnboarding: pendingOnboarding.length,
          totalMonthlyRent,
          averageRent: active.length > 0 ? totalMonthlyRent / active.length : 0
        });
        observer.complete();
        });
    });
  }

  // Private helper methods
  private validateTenant(tenant: Partial<ITenant>): TenantValidationError[] {
    const errors: TenantValidationError[] = [];

    if (!tenant.name || tenant.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    }

    if (!tenant.email || !this.isValidEmail(tenant.email)) {
      errors.push({ field: 'email', message: 'Valid email address is required' });
    }

    if (!tenant.phoneNumber || !this.isValidPhone(tenant.phoneNumber)) {
      errors.push({ field: 'phoneNumber', message: 'Valid phone number is required' });
    }

    if (!tenant.dob) {
      errors.push({ field: 'dob', message: 'Date of birth is required' });
    }

    if (!tenant.occupation || tenant.occupation.trim().length < 2) {
      errors.push({ field: 'occupation', message: 'Occupation is required' });
    }

    if (!tenant.aadhaarNumber || !this.isValidAadhaar(tenant.aadhaarNumber)) {
      errors.push({ field: 'aadhaarNumber', message: 'Valid 12-digit Aadhaar number is required' });
    }

    if (!tenant.panNumber || !this.isValidPAN(tenant.panNumber)) {
      errors.push({ field: 'panNumber', message: 'Valid PAN number is required (e.g., ABCDE1234F)' });
    }

    if (!tenant.propertyId) {
      errors.push({ field: 'propertyId', message: 'Property selection is required' });
    }

    if (!tenant.rentAmount || tenant.rentAmount <= 0) {
      errors.push({ field: 'rentAmount', message: 'Valid rent amount is required' });
    }

    if (!tenant.tenancyStartDate) {
      errors.push({ field: 'tenancyStartDate', message: 'Tenancy start date is required' });
    }

    if (!tenant.rentDueDate) {
      errors.push({ field: 'rentDueDate', message: 'Rent due date is required' });
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
