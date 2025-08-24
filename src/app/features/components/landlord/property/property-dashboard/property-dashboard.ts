import { Component, OnInit, TemplateRef, AfterViewInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';



import { IProperty } from '../../../../models/property';
import { ITenant } from '../../../../models/tenant';
import { IDocument } from '../../../../models/document';
import {
  PropertyType,
  PropertyStatus,
  FurnishingType,
  LeaseType,
  DocumentCategory,
} from '../../../../enums/view.enum';
import { ITicket, TicketStatus } from '../../../../models/tickets';
import { PropertyAdd } from '../property-add/property-add';
import { PropertyDetail } from '../property-detail/property-detail';
import { NgButton, NgIconComponent, NgSelectComponent, NgMatTable, TableColumn, TableOptions } from '../../../../../../../projects/shared/src/public-api';

@Component({
  selector: 'app-property-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    NgButton,
    NgIconComponent,
    NgSelectComponent,
    NgMatTable,
    PropertyAdd,
    PropertyDetail,
  ],
  templateUrl: './property-dashboard.html',
  styleUrl: './property-dashboard.scss',
})
export class PropertyDashboard implements OnInit {
  // Template references for dynamic content
  readonly propertyNameTemplate = viewChild.required<TemplateRef<unknown>>('propertyNameTemplate');
  readonly tenantTemplate = viewChild.required<TemplateRef<unknown>>('tenantTemplate');
  readonly documentTemplate = viewChild.required<TemplateRef<unknown>>('documentTemplate');
  readonly actionTemplate = viewChild.required<TemplateRef<unknown>>('actionTemplate');
  readonly statusTemplate = viewChild.required<TemplateRef<unknown>>('statusTemplate');

  // State Management
  currentView: 'table' | 'detail' | 'create' | 'edit' = 'table';
  selectedProperty: IProperty | null = null;

  // Table columns configuration (will be initialized in ngOnInit)
  tableColumns: TableColumn[] = [];

  tableOptions: TableOptions = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sortable: true,
    multiSelect: false,
    responsive: true,
    autoWidth: true,
    stickyHeader: true,
    stickyPaginator: true
  };

  // Mock Property Data
  properties: IProperty[] = [];
  
  // Mock tenant data for testing
  private mockTenants: ITenant[] = [
    {
      id: 1,
      landlordId: 1,
      propertyId: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      phoneNumber: '9876543212',
      dob: '1988-05-12',
      age: 36,
      occupation: 'Designer',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      tenancyStartDate: '2024-01-01',
      tenancyEndDate: '2025-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 45000,
      securityDeposit: 135000,
      isAcknowledge: true,
      acknowledgeDate: '2024-01-01',
      isVerified: true,
      isNewTenant: false,
      isPrimary: true,
      isActive: true,
      tenantGroup: 1,
      documents: [],
      tickets: [],
    },
    {
      id: 2,
      landlordId: 1,
      propertyId: 1,
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      phoneNumber: '9876543213',
      dob: '1985-08-22',
      age: 39,
      occupation: 'Software Engineer',
      aadhaarNumber: '123456789013',
      panNumber: 'ABCDE1234G',
      tenancyStartDate: '2024-01-01',
      tenancyEndDate: '2025-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 45000,
      securityDeposit: 135000,
      isAcknowledge: true,
      acknowledgeDate: '2024-01-01',
      isVerified: true,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      tenantGroup: 1,
      documents: [],
      tickets: [],
    },
    {
      id: 3,
      landlordId: 1,
      propertyId: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phoneNumber: '9876543214',
      dob: '2010-03-15',
      age: 14,
      occupation: 'Student',
      aadhaarNumber: '123456789014',
      panNumber: 'ABCDE1234H',
      tenancyStartDate: '2024-01-01',
      tenancyEndDate: '2025-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 0,
      securityDeposit: 0,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      tenantGroup: 1,
      documents: [],
      tickets: [],
    },
    {
      id: 4,
      landlordId: 1,
      propertyId: 1,
      name: 'James Johnson',
      email: 'james.johnson@example.com',
      phoneNumber: '9876543215',
      dob: '2012-07-08',
      age: 12,
      occupation: 'Student',
      aadhaarNumber: '123456789015',
      panNumber: 'ABCDE1234I',
      tenancyStartDate: '2024-01-01',
      tenancyEndDate: '2025-01-01',
      rentDueDate: '2024-01-05',
      rentAmount: 0,
      securityDeposit: 0,
      isAcknowledge: false,
      isVerified: false,
      isNewTenant: false,
      isPrimary: false,
      isActive: true,
      tenantGroup: 1,
      documents: [],
      tickets: [],
    },
    {
      id: 5,
      landlordId: 1,
      propertyId: 2,
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      phoneNumber: '9876543215',
      dob: '1992-11-18',
      age: 32,
      occupation: 'Teacher',
      aadhaarNumber: '123456789016',
      panNumber: 'ABCDE1234J',
      tenancyStartDate: '2024-02-01',
      tenancyEndDate: '2025-02-01',
      rentDueDate: '2024-02-05',
      rentAmount: 30000,
      securityDeposit: 90000,
      isAcknowledge: true,
      acknowledgeDate: '2024-02-01',
      isVerified: true,
      isNewTenant: false,
      isPrimary: true,
      isActive: true,
      tenantGroup: 2,
      documents: [],
      tickets: [],
    },
  ];

  // Dialog and menu state
  showUploadModal = false;
  showDownloadModal = false;
  selectedPropertyForUpload: IProperty | null = null;
  selectedPropertyForDownload: IProperty | null = null;
  selectedDocumentCategory: DocumentCategory = DocumentCategory.Legal;
  selectedDownloadCategory: DocumentCategory | 'all' = 'all';
  
  // Document categories for dropdown
  documentCategories = [
    { value: DocumentCategory.Legal, label: 'Legal Documents', description: 'Property deeds, ownership documents' },
    { value: DocumentCategory.Agreement, label: 'Agreements', description: 'Rental agreements, contracts' },
    { value: DocumentCategory.Financial, label: 'Financial Documents', description: 'Rent receipts, payment records' },
    { value: DocumentCategory.OwnershipProof, label: 'Ownership Proof', description: 'Property ownership certificates' },
    { value: DocumentCategory.UtilityBill, label: 'Utility Bills', description: 'Electricity, water, gas bills' },
    { value: DocumentCategory.PropertyPhoto, label: 'Property Photos', description: 'Property images and videos' },
  ];

  downloadCategories = [
    { value: 'all', label: 'All Documents', count: 0, description: 'Download all available documents' },
    { value: DocumentCategory.Legal, label: 'Legal Documents', count: 0, description: 'Property deeds, ownership documents' },
    { value: DocumentCategory.Agreement, label: 'Agreements', count: 0, description: 'Rental agreements, contracts' },
    { value: DocumentCategory.Financial, label: 'Financial Documents', count: 0, description: 'Rent receipts, payment records' },
    { value: DocumentCategory.OwnershipProof, label: 'Ownership Proof', count: 0, description: 'Property ownership certificates' },
    { value: DocumentCategory.UtilityBill, label: 'Utility Bills', count: 0, description: 'Electricity, water, gas bills' },
    { value: DocumentCategory.PropertyPhoto, label: 'Property Photos', count: 0, description: 'Property images and videos' },
  ];

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.initializeTableColumns();
    this.loadMockData();
  }
  
  private initializeTableColumns() {
    // Initialize table columns with templates
    this.tableColumns = [
      { 
        key: 'id', 
        label: 'ID', 
        width: '80px',
        align: 'center',
        headerAlign: 'center'
      },
      { 
        key: 'title', 
        label: 'Property Name', 
        width: 'auto',
        type: 'custom', 
        template: this.propertyNameTemplate(),
        align: 'left'
      },
      { 
        key: 'fullAddress', 
        label: 'Address', 
        width: 'auto',
        align: 'left'
      },
      { 
        key: 'mappedTenants', 
        label: 'Tenants', 
        width: '300px',
        type: 'custom', 
        template: this.tenantTemplate(),
        align: 'center',
        headerAlign: 'center'
      },
      { 
        key: 'documentsActions', 
        label: 'Documents', 
        width: '150px',
        type: 'custom', 
        template: this.documentTemplate(),
        align: 'center',
        headerAlign: 'center'
      },
      { 
        key: 'monthlyRent', 
        label: 'Monthly Rent', 
        width: '120px',
        align: 'right',
        headerAlign: 'right'
      },
      { 
        key: 'status', 
        label: 'Status', 
        width: '150px',
        type: 'custom', 
        template: this.statusTemplate(),
        align: 'center',
        headerAlign: 'center'
      },
      { 
        key: 'actions', 
        label: 'Actions', 
        width: '200px',
        type: 'custom', 
        template: this.actionTemplate(),
        align: 'center',
        headerAlign: 'center'
      }
    ];
  }

  private loadMockData() {
// Mock Documents
const mockDocuments: IDocument[] = [
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.Legal,
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFByb3BlcnR5IERlZWQpCi9Qcm9kdWNlciAoU2FtcGxlIFBERikKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0xlbmd0aCAzMyAKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMCA1NjYgVGQKKFByb3BlcnR5IERlZWQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDMKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMTI4CiUlRU9G',
    fileName: 'property_deed.pdf',
    fileType: 'application/pdf',
    fileSize: 102400,
    documentIdentifier: 'DOC-001',
    uploadedOn: '2024-01-10T10:00:00Z',
    isVerified: true,
    description: 'Property deed document',
  },
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.Agreement,
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFJlbnRhbCBBZ3JlZW1lbnQpCi9Qcm9kdWNlciAoU2FtcGxlIFBERikKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0xlbmd0aCAzNyAKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMCA1NjYgVGQKKFJlbnRhbCBBZ3JlZW1lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDMKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwODIgMDAwMDAgbiAKdHJhaWxlcgo8PAovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMTM2CiUlRU9G',
    fileName: 'rental_agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 204800,
    documentIdentifier: 'DOC-002',
    uploadedOn: '2024-02-05T12:00:00Z',
    isVerified: false,
    description: 'Rental agreement for tenant',
  },
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.Financial,
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFJlbnQgUmVjZWlwdCkKL1Byb2R1Y2VyIChTYW1wbGUgUERGKQo+PgplbmRvYmoKMiAwIG9iago8PAovTGVuZ3RoIDMxIAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwIDU2NiBUZAooUmVudCBSZWNlaXB0KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCAzCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc2IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjEyOAolJUVPRg==',
    fileName: 'rent_receipt_jan2024.pdf',
    fileType: 'application/pdf',
    fileSize: 89600,
    documentIdentifier: 'DOC-003',
    uploadedOn: '2024-01-31T15:30:00Z',
    isVerified: true,
    description: 'Rent receipt for January 2024',
  },
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.OwnershipProof,
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKE93bmVyc2hpcCBDZXJ0aWZpY2F0ZSkKL1Byb2R1Y2VyIChTYW1wbGUgUERGKQo+PgplbmRvYmoKMiAwIG9iago8PAovTGVuZ3RoIDM5IAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwIDU2NiBUZAooT3duZXJzaGlwIENlcnRpZmljYXRlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCAzCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDg0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjE0MgolJUVPRg==',
    fileName: 'ownership_certificate.pdf',
    fileType: 'application/pdf',
    fileSize: 156200,
    documentIdentifier: 'DOC-004',
    uploadedOn: '2024-01-05T09:15:00Z',
    isVerified: true,
    description: 'Property ownership certificate',
  },
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.UtilityBill,
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKEVsZWN0cmljaXR5IEJpbGwpCi9Qcm9kdWNlciAoU2FtcGxlIFBERikKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0xlbmd0aCAzNCAKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMCA1NjYgVGQKKEVsZWN0cmljaXR5IEJpbGwpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDMKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKdHJhaWxlcgo8PAovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMTMxCiUlRU9G',
    fileName: 'electricity_bill_feb2024.pdf',
    fileType: 'application/pdf',
    fileSize: 67800,
    documentIdentifier: 'DOC-005',
    uploadedOn: '2024-02-15T11:45:00Z',
    isVerified: false,
    description: 'Electricity bill for February 2024',
  },
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.PropertyPhoto,
    fileUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    fileName: 'property_exterior.jpg',
    fileType: 'image/jpeg',
    fileSize: 245600,
    documentIdentifier: 'DOC-006',
    uploadedOn: '2024-01-20T14:20:00Z',
    isVerified: true,
    description: 'Property exterior photograph',
  },
];

// Mock Tenants
const mockTenants: ITenant[] = [
  {
    id: 1,
    landlordId: 1,
    propertyId: 1,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phoneNumber: '9876543212',
    dob: '1988-05-12',
    occupation: 'Designer',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    tenancyStartDate: '2024-01-01',
    tenancyEndDate: '2025-01-01',
    rentDueDate: '2024-01-05',
    rentAmount: 45000,
    securityDeposit: 135000,
    isAcknowledge: true,
    acknowledgeDate: '2024-01-01',
    isVerified: true,
    isNewTenant: false,
    isPrimary: true,
    isActive: true,
    tenantGroup: 1,
    documents: [mockDocuments[0]],
    tickets: [],
  },
  {
    id: 2,
    landlordId: 1,
    propertyId: 2,
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '9876543210',
    dob: '1990-01-01',
    occupation: 'Engineer',
    aadhaarNumber: '123456789013',
    panNumber: 'ABCDE1234G',
    tenancyStartDate: '2024-02-01',
    tenancyEndDate: '2025-02-01',
    rentDueDate: '2024-02-05',
    rentAmount: 35000,
    securityDeposit: 70000,
    isAcknowledge: true,
    acknowledgeDate: '2024-02-01',
    isVerified: true,
    isNewTenant: false,
    isPrimary: true,
    isActive: true,
    tenantGroup: 2,
    documents: [],
    tickets: [],
  },
];

// Mock Properties
const mockProperties: IProperty[] = [
  {
    id: 1,
    landlordId: 1,
    title: 'Luxury 3BHK Apartment',
    description: 'Spacious 3BHK apartment with modern amenities',
    propertyType: PropertyType.Apartment,
    bhkConfiguration: '3BHK',
    floorNumber: 5,
    totalFloors: 12,
    carpetAreaSqFt: 1200,
    builtUpAreaSqFt: 1400,
    furnishingType: FurnishingType.SemiFurnished,
    addressLine1: '123, Park Avenue',
    addressLine2: 'Sector 15',
    locality: 'Dwarka',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110075',
    monthlyRent: 45000,
    securityDeposit: 135000,
    isNegotiable: true,
    availableFrom: '2024-01-01',
    leaseType: LeaseType.ShortTerm,
    hasLift: true,
    hasParking: true,
    hasPowerBackup: true,
    hasWaterSupply: true,
    hasGasPipeline: false,
    hasSecurity: true,
    hasInternet: true,
    status: PropertyStatus.Rented,
    createdOn: '2023-12-01',
    updatedOn: '2024-01-10',
    tenants: [mockTenants[0]],
    documents: [mockDocuments[0], mockDocuments[1], mockDocuments[2], mockDocuments[3], mockDocuments[5]],
  },
  {
    id: 2,
    landlordId: 1,
    title: 'Cozy 2BHK House',
    description: 'Independent house with garden',
    propertyType: PropertyType.Apartment,
    bhkConfiguration: '2BHK',
    floorNumber: 0,
    totalFloors: 2,
    carpetAreaSqFt: 1000,
    builtUpAreaSqFt: 1200,
    furnishingType: FurnishingType.FullyFurnished,
    addressLine1: '456, Green Valley',
    locality: 'Gurgaon',
    city: 'Gurgaon',
    state: 'Haryana',
    pinCode: '122001',
    monthlyRent: 35000,
    securityDeposit: 70000,
    isNegotiable: false,
    availableFrom: '2024-02-01',
    leaseType: LeaseType.LongTerm,
    hasLift: false,
    hasParking: true,
    hasPowerBackup: true,
    hasWaterSupply: true,
    hasGasPipeline: true,
    hasSecurity: true,
    hasInternet: true,
    status: PropertyStatus.Listed,
    createdOn: '2023-11-15',
    updatedOn: '2024-02-05',
    tenants: [mockTenants[1]],
    documents: [mockDocuments[1], mockDocuments[4]],
  },
];

// Mock Ticket Status
const mockTicketStatus: TicketStatus[] = [
  {
    id: 1,
    ticketId: 1,
    status: 'Open',
    comment: 'Ticket created',
    addedBy: 1,
    dateCreated: '2024-03-01',
  },
  {
    id: 2,
    ticketId: 1,
    status: 'In Progress',
    comment: 'Assigned to maintenance',
    addedBy: 2,
    dateCreated: '2024-03-02',
    dateModified: '2024-03-02',
  },
];

// Mock Tickets
const mockTickets: ITicket[] = [
  {
    id: 1,
    landlordId: 1,
    tenantGroupId: 1,
    propertyId: 1,
    category: 'Maintenance',
    description: 'Leaking faucet in kitchen',
    dateCreated: '2024-03-01',
    status: mockTicketStatus,
    tenantId: 1,
    tenant: mockTenants[0],
    property: mockProperties[0],
  },
  {
    id: 2,
    landlordId: 1,
    tenantGroupId: 2,
    propertyId: 2,
    category: 'Repair',
    description: 'Broken window in bedroom',
    dateCreated: '2024-03-05',
    status: [
      {
        id: 3,
        ticketId: 2,
        status: 'Open',
        comment: 'Reported by tenant',
        addedBy: 2,
        dateCreated: '2024-03-05',
      },
    ],
    tenantId: 2,
    tenant: mockTenants[1],
    property: mockProperties[1],
  },
];




   this.properties = mockProperties.map((property) => this.transformPropertyForTable(property));

  }

  private transformPropertyForTable(property: IProperty): any {
    return {
      ...property,
      fullAddress: this.getFullAddress(property),
      mappedTenants: this.getMappedTenantsDisplay(property.tenants || []),
      documentsCount: this.getDocumentsDisplay(property.documents || []),
      monthlyRent: property.monthlyRent
        ? `₹${property.monthlyRent.toLocaleString()}`
        : 'Not Set',
      createdOn: property.createdOn
        ? new Date(property.createdOn).toLocaleDateString()
        : 'N/A',
    };
  }

  private getFullAddress(property: IProperty): string {
    const parts = [
      property.addressLine1,
      property.addressLine2,
      property.locality,
      property.city,
      property.state,
      property.pinCode,
    ].filter((part) => part && part.trim());

    return parts.join(', ');
  }

  private getMappedTenantsDisplay(tenants: ITenant[]): string {
    if (!tenants || tenants.length === 0) return 'No tenants';
    if (tenants.length === 1) return tenants[0].name || 'Unnamed Tenant';
    return `${tenants.length} tenants`;
  }

  private getDocumentsDisplay(documents: IDocument[]): string {
    if (!documents || documents.length === 0) return 'No documents';
    return `${documents.length} document${documents.length === 1 ? '' : 's'}`;
  }

  // CRUD Operations
  onCreateProperty(): void {
    this.selectedProperty = null;
    this.currentView = 'create';
  }

  // Navigation
  showTable(): void {
    this.currentView = 'table';
    this.selectedProperty = null;
  }

  // Simple Property Actions
  onViewProperty(property: any): void {
    this.selectedProperty = property;
    this.currentView = 'detail';
  }

  onEditProperty(property: any): void {
    this.selectedProperty = property;
    this.currentView = 'edit';
  }

  onDeleteProperty(property: any): void {
    if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
      this.properties = this.properties.filter(
        (item) => item.id !== property.id
      );
      console.log('Deleted property:', property);
    }
  }

  // Statistics Methods
  getAvailablePropertiesCount(): number {
    return this.properties.filter((p) => p.status === PropertyStatus.Rented)
      .length;
  }

  getOccupiedPropertiesCount(): number {
    return this.properties.filter((p) => p.status === PropertyStatus.Rented)
      .length;
  }

  getTotalRevenue(): number {
    const total = this.properties
      .filter((p) => p.status === PropertyStatus.Rented)
      .reduce((total, p) => {
        const rent = p.monthlyRent || 0;
        return total + (typeof rent === 'number' && !isNaN(rent) ? rent : 0);
      }, 0);
    
    return typeof total === 'number' && !isNaN(total) ? total : 0;
  }

  // Tenant Management Methods
  getTenantsList(property: IProperty): ITenant[] {
    return property.tenants || [];
  }

  getTenantChildren(tenant: ITenant): any[] {
    // Return family members (non-primary tenants) from the same tenant group
    const familyMembers = this.mockTenants.filter((t: ITenant) => 
      t.tenantGroup === tenant.tenantGroup && 
      t.id !== tenant.id && 
      !t.isPrimary
    );
    
    return familyMembers.map((member: ITenant) => ({
      id: member.id,
      name: member.name,
      age: member.age,
      relation: member.age && member.age < 18 ? 
        (member.name.includes('Sarah') ? 'Daughter' : 'Son') : 
        'Spouse'
    }));
  }

  onViewTenants(property: IProperty): void {
    console.log('Viewing tenants for property:', property.title);
    // This will be handled by the menu in the template
  }

  // Document and Upload Methods
  getPropertyDocuments(property: IProperty): IDocument[] {
    return property.documents || [];
  }

  onUploadDocument(property: IProperty): void {
    this.selectedPropertyForUpload = property;
    this.showUploadModal = true;
  }

  onOpenDownloadModal(property: IProperty): void {
    this.selectedPropertyForDownload = property;
    this.updateDownloadCategoryCounts(property);
    this.showDownloadModal = true;
  }

  private updateDownloadCategoryCounts(property: IProperty): void {
    const documents = property.documents || [];
    
    // Update download categories with actual document counts
    this.downloadCategories = this.downloadCategories.map(category => {
      if (category.value === 'all') {
        return { ...category, count: documents.length };
      } else {
        const count = documents.filter(doc => doc.category === category.value).length;
        return { ...category, count: count };
      }
    });
  }

  onCloseUploadModal(): void {
    this.showUploadModal = false;
    this.selectedPropertyForUpload = null;
  }

  onCloseDownloadModal(): void {
    this.showDownloadModal = false;
    this.selectedPropertyForDownload = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file && this.selectedPropertyForUpload) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files only.');
        return;
      }

      this.uploadFile(file, this.selectedPropertyForUpload);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  private uploadFile(file: File, property: IProperty): void {
    console.log('Uploading file:', file.name, 'for property:', property.title);
    
    // Mock upload process with progress indication
    const uploadProgress = document.createElement('div');
    uploadProgress.innerHTML = `
      <div style="margin: 20px 0; text-align: center;">
        <p>Uploading ${file.name}...</p>
        <div style="width: 100%; background-color: #f0f0f0; border-radius: 5px; overflow: hidden;">
          <div id="progress-bar" style="width: 0%; height: 20px; background-color: #4CAF50; transition: width 0.3s;"></div>
        </div>
        <span id="progress-text">0%</span>
      </div>
    `;
    
    // Insert progress indicator in modal
    const modalContent = document.querySelector('.upload-modal .modal-content');
    if (modalContent) {
      modalContent.appendChild(uploadProgress);
    }

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 100) progress = 100;
      
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      if (progressBar && progressText) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
      }
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Create document object
        const newDocument: IDocument = {
          ownerId: property.landlordId || 1,
          ownerType: 'Landlord',
          category: this.selectedDocumentCategory,
          fileUrl: URL.createObjectURL(file), // In real app, this would be the server URL
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          documentIdentifier: `DOC-${Date.now()}`,
          uploadedOn: new Date().toISOString(),
          isVerified: false,
          description: `${this.getSelectedCategoryName()} document for ${property.title}`,
        };

        // Add the document to the property
        if (!property.documents) {
          property.documents = [];
        }
        property.documents.push(newDocument);

        // Update the properties list to reflect changes
        this.updatePropertyInList(property);

        console.log('File uploaded successfully:', newDocument);
        
        // Show success message
        setTimeout(() => {
          alert(`File "${file.name}" uploaded successfully as ${this.getSelectedCategoryName()}`);
          this.onCloseUploadModal();
          
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }, 500);
      }
    }, 200);
  }

  private getSelectedCategoryName(): string {
    const category = this.documentCategories.find(cat => cat.value === this.selectedDocumentCategory);
    return category?.label || 'Document';
  }

  private updatePropertyInList(updatedProperty: IProperty): void {
    const index = this.properties.findIndex(p => p.id === updatedProperty.id);
    if (index !== -1) {
      this.properties[index] = this.transformPropertyForTable(updatedProperty);
    }
  }

  onDownloadDocument(doc: IDocument): void {
    console.log('Downloading document:', doc.fileName);
    
    // Create a temporary link element for download
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName || 'document';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded: ${doc.fileName}`);
    } else {
      alert('Document file not available for download.');
    }
  }

  getAllDocumentsCount(): number {
    return this.selectedPropertyForDownload?.documents?.length || 0;
  }

  getSelectedCategoryCount(): number {
    if (!this.selectedPropertyForDownload?.documents) return 0;
    return this.selectedPropertyForDownload.documents.filter(
      doc => doc.category === this.selectedDownloadCategory
    ).length;
  }

  getSelectedCategoryLabel(): string {
    const category = this.documentCategories.find(
      cat => cat.value === this.selectedDownloadCategory
    );
    return category?.label || '';
  }

  isDownloadDisabled(): boolean {
    return this.selectedDownloadCategory === 'all' 
      ? this.getAllDocumentsCount() === 0
      : this.getSelectedCategoryCount() === 0;
  }

  onDownloadSelectedCategory(): void {
    if (!this.selectedPropertyForDownload?.documents) {
      alert('No documents available for download.');
      return;
    }

    let documentsToDownload: IDocument[] = [];
    
    if (this.selectedDownloadCategory === 'all') {
      documentsToDownload = this.selectedPropertyForDownload.documents;
    } else {
      documentsToDownload = this.selectedPropertyForDownload.documents.filter(
        doc => doc.category === this.selectedDownloadCategory
      );
    }

    if (documentsToDownload.length === 0) {
      alert('No documents found for the selected category.');
      return;
    }

    console.log('Downloading documents for category:', this.selectedDownloadCategory);
    
    // If only one document, download directly
    if (documentsToDownload.length === 1) {
      this.onDownloadDocument(documentsToDownload[0]);
      this.onCloseDownloadModal();
      return;
    }

    // Multiple documents - create a zip-like download experience
    const confirmDownload = confirm(
      `This will download ${documentsToDownload.length} documents. Continue?`
    );
    
    if (confirmDownload) {
      // Download each document with a small delay
      documentsToDownload.forEach((doc, index) => {
        setTimeout(() => {
          this.onDownloadDocument(doc);
        }, index * 500); // 500ms delay between downloads
      });

      // Show success message
      setTimeout(() => {
        const categoryName = this.selectedDownloadCategory === 'all' 
          ? 'All Documents' 
          : this.getSelectedCategoryLabel();
        alert(`${documentsToDownload.length} documents from "${categoryName}" category have been downloaded.`);
        this.onCloseDownloadModal();
      }, documentsToDownload.length * 500);
    }
  }

  onTenantSelect(tenant: ITenant): void {
    console.log('Selected tenant:', tenant.name);
    // Handle tenant selection logic here
  }

  // Navigation method for property details
  navigateToDetail(property: IProperty): void {
    this.selectedProperty = property;
    this.currentView = 'detail';
  }

  // Get status icon based on property status
  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'listed':
        return 'check_circle';
      case 'rented':
      case 'occupied':
        return 'people';
      case 'undermaintenance':
      case 'maintenance':
        return 'build';
      case 'draft':
        return 'edit';
      default:
        return 'info';
    }
  }

  // Handle document download click without row navigation
  handleDownloadClick(property: IProperty): void {
    this.onOpenDownloadModal(property);
  }

  // Handle document upload click without row navigation
  handleUploadClick(property: IProperty): void {
    this.onUploadDocument(property);
  }

  private exportPropertiesToCSV(properties: any[]): void {
    const headers = [
      'ID',
      'Property Name',
      'Address',
      'Rent',
      'Status',
      'Tenants',
      'Documents',
    ];

    const csvContent = [
      headers.join(','),
      ...properties.map((p) =>
        [
          p.id,
          `"${p.title}"`,
          `"${p.fullAddress}"`,
          p.monthlyRent,
          p.status,
          `"${p.mappedTenants}"`,
          `"${p.documentsCount}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'properties.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getSimplifiedStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'listed':
        return 'LISTED';
      case 'rented':
      case 'occupied':
        return 'RENTED';
      case 'undermaintenance':
        return 'RENTED';
      case 'draft':
        return 'LISTED';
      default:
        return 'LISTED';
    }
  }
}
