import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';

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

@Component({
  selector: 'app-property-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatToolbarModule,
  ],
  templateUrl: './property-dashboard.html',
  styleUrl: './property-dashboard.scss',
})
export class PropertyDashboard implements OnInit {
  // State Management
  currentView: 'table' | 'detail' | 'create' | 'edit' = 'table';
  selectedProperty: IProperty | null = null;

  // Table columns
  displayedColumns: string[] = [
    'id',
    'title',
    'fullAddress',
    'mappedTenants',
    'monthlyRent',
    'status',
    'actions',
  ];

  // Mock Property Data
  properties: IProperty[] = [];

  ngOnInit() {
    this.loadMockData();
  }

  private loadMockData() {
// Mock Documents
const mockDocuments: IDocument[] = [
  {
    ownerId: 1,
    ownerType: 'Landlord',
    category: DocumentCategory.Legal,
    fileUrl: '/files/property_deed.pdf',
    fileName: 'property_deed.pdf',
    fileType: 'application/pdf',
    fileSize: 102400,
    documentIdentifier: 'DOC-001',
    uploadedOn: '2024-01-10T10:00:00Z',
    isVerified: true,
    verifiedBy: 'Admin',
    description: 'Property deed document',
  },
  {
    ownerId: 2,
    ownerType: 'Tenant',
    category: DocumentCategory.Agreement,
    fileUrl: '/files/rental_agreement.pdf',
    fileName: 'rental_agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 204800,
    documentIdentifier: 'DOC-002',
    uploadedOn: '2024-02-05T12:00:00Z',
    isVerified: false,
    description: 'Rental agreement for tenant',
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
    documents: [mockDocuments[0]],
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
    documents: [mockDocuments[1]],
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

  // Simple row click handler
  onRowClick(property: IProperty): void {
    this.selectedProperty = property;
    this.currentView = 'detail';
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

    alert(
      `Viewing property: ${property.title}\n\nAddress: ${property.fullAddress}\nRent: ${property.monthlyRent}\nStatus: ${property.status}`
    );
  }

  onEditProperty(property: any): void {
    this.selectedProperty = property;
    this.currentView = 'edit';

    alert(
      `Edit functionality will be implemented with forms.\n\nProperty: ${property.title}`
    );
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
    return this.properties
      .filter((p) => p.status === PropertyStatus.Rented)
      .reduce((total, p) => total + (p.monthlyRent || 0), 0);
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
}
