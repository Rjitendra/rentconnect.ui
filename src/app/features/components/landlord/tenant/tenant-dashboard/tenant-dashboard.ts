/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  AlertService,
  NgButton,
  NgIconComponent,
  NgMatTable,
  SelectOption,
  TableColumn,
  TableOptions,
} from '../../../../../../../projects/shared/src/public-api';
// Models and enums
import { ITenant } from '../../../../models/tenant';
import { TenantService } from '../../../../service/tenant.service';
import { TenantAddComponent } from '../tenant-add/tenant-add';

type ViewType = 'table' | 'add' | 'edit' | 'detail';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    NgMatTable,
    NgButton,
    TenantAddComponent,
  ],
  templateUrl: './tenant-dashboard.html',
  styleUrl: './tenant-dashboard.scss',
})
export class TenantDashboard implements OnInit {
  // View management
  currentView: ViewType = 'table';
  selectedTenant: ITenant | null = null;

  // Data
  tenants: ITenant[] = [];
  primaryTenants: ITenant[] = []; // Only primary tenants for table display
  tenantGroups: Map<number, ITenant[]> = new Map(); // Grouped tenants by tenantGroup

  // NgMatTable configuration
  tableColumns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Primary Tenant',
      sortable: true,
    },
    {
      key: 'propertyName',
      label: 'Property',
      sortable: true,
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      width: '150px',
    },
    {
      key: 'rentAmount',
      label: 'Rent Amount',
      width: '120px',
      align: 'right',
    },
    {
      key: 'tenantCount',
      label: 'Tenants',
      width: '100px',
      align: 'center',
    },
    {
      key: 'statusDisplay',
      label: 'Status',
      width: '120px',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '200px',
      sortable: false,
    },
  ];

  tableOptions: TableOptions = {
    sortable: true,
    responsive: true,
    stickyHeader: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20],
  };

  // Select options for tenant-add component
  propertyOptions: SelectOption[] = [
    { value: 1, label: '2BHK Apartment - Sector 15, Gurgaon' },
    { value: 2, label: '3BHK House - Green Valley, Mumbai' },
    { value: 3, label: '1BHK Studio - Tech Park, Bangalore' },
    { value: 4, label: '2BHK Flat - Electronic City, Bangalore' },
    { value: 5, label: '3BHK Villa - Koramangala, Bangalore' },
    { value: 6, label: '4BHK House - Satellite, Ahmedabad' },
    { value: 7, label: '1BHK Apartment - Bandra West, Mumbai' },
    { value: 8, label: '2BHK Apartment - Jayanagar, Bangalore' },
  ];

  private alertService = inject(AlertService);
  private tenantService = inject(TenantService);

  constructor() {}

  ngOnInit() {
    this.loadTenants();
  }

  // Statistics methods
  getActiveTenants(): number {
    return this.tenants.filter((t) => t.isActive).length;
  }

  getPendingOnboarding(): number {
    return this.tenants.filter((t) => t.needsOnboarding).length;
  }

  getTotalRentAmount(): number {
    return this.tenants
      .filter((t) => t.isActive)
      .reduce((sum, t) => sum + t.rentAmount, 0);
  }

  // Table helper methods
  getPropertyName(propertyId: number): string {
    const property = this.propertyOptions.find((p) => p.value === propertyId);
    return property ? property.label : 'Unknown Property';
  }

  getStatusClass(tenant: ITenant): string {
    if (!tenant.isActive) return 'status-inactive';
    if (tenant.needsOnboarding) return 'status-pending';
    if (tenant.isNewTenant) return 'status-new';
    return 'status-active';
  }

  getStatusIcon(tenant: ITenant): string {
    if (!tenant.isActive) return 'block';
    if (tenant.needsOnboarding) return 'pending';
    if (tenant.isNewTenant) return 'new_releases';
    return 'check_circle';
  }

  getStatusText(tenant: ITenant): string {
    if (!tenant.isActive) return 'Inactive';
    if (tenant.needsOnboarding) return 'Pending Onboarding';
    if (tenant.isNewTenant) return 'New';
    return 'Active';
  }

  // NgMatTable event handlers
  onRowClick(tenant: any): void {
    console.log('Row clicked:', tenant);
    console.log('Tenant ID:', tenant.id);
    console.log('Row click event triggered');
  }

  onRowExpand(tenant: any): void {
    console.log('Row expand event triggered for tenant:', tenant);
    console.log('Expand key (ID):', tenant.id);
  }

  // Helper methods for expanded content
  getGroupMembers(tenantGroup: number): ITenant[] {
    return this.tenantGroups.get(tenantGroup) || [];
  }

  getGroupMemberCount(tenantGroup: number): number {
    return this.tenantGroups.get(tenantGroup)?.length || 0;
  }

  // View management
  showTable() {
    this.currentView = 'table';
    this.selectedTenant = null;
  }

  onAddTenant() {
    this.currentView = 'add';
  }

  // Event handlers for tenant-add component
  onTenantAdded() {
    this.loadTenants();
    this.showTable();
  }

  onTenantAddCancelled() {
    this.showTable();
  }

  // Action methods
  onCreateAgreement(tenant: ITenant) {
    this.showInfo(`Creating agreement for ${tenant.name}...`);

    const agreementRequest = {
      tenantId: tenant.id!,
      startDate:
        typeof tenant.tenancyStartDate === 'string'
          ? tenant.tenancyStartDate
          : tenant.tenancyStartDate.toString(),
      endDate: tenant.tenancyEndDate
        ? typeof tenant.tenancyEndDate === 'string'
          ? tenant.tenancyEndDate
          : tenant.tenancyEndDate.toString()
        : new Date(
            new Date(tenant.tenancyStartDate).setFullYear(
              new Date(tenant.tenancyStartDate).getFullYear() + 1,
            ),
          ).toISOString(),
      rentAmount: tenant.rentAmount,
      securityDeposit: tenant.securityDeposit,
    };

    this.tenantService.createAgreement(agreementRequest).subscribe({
      next: (response: { success: boolean; message: string }) => {
        if (response.success) {
          this.showSuccess(response.message);
          this.loadTenants(); // Reload to get updated tenant data
        } else {
          this.showError(response.message);
        }
      },
      error: (error: unknown) => {
        this.showError('Failed to create agreement');
        console.error('Error creating agreement:', error);
      },
    });
  }

  onSendOnboardingEmail(tenant: ITenant) {
    this.showInfo(`Sending onboarding email to ${tenant.email}...`);

    const emailRequest = {
      tenantId: tenant.id!,
      templateType: 'welcome' as const,
    };

    this.tenantService.sendOnboardingEmail(emailRequest).subscribe({
      next: (response: { success: boolean; message: string }) => {
        if (response.success) {
          this.showSuccess(response.message);
          this.loadTenants(); // Reload to get updated tenant data
        } else {
          this.showError(response.message);
        }
      },
      error: (error: unknown) => {
        this.showError('Failed to send onboarding email');
        console.error('Error sending onboarding email:', error);
      },
    });
  }

  onDeleteTenant(tenant: ITenant) {
    if (confirm(`Are you sure you want to delete tenant ${tenant.name}?`)) {
      this.tenantService.deleteTenant(tenant.id!).subscribe({
        next: (response: { success: boolean; message: string }) => {
          if (response.success) {
            this.showSuccess(response.message);
            this.loadTenants(); // Reload the tenant list
            if (
              this.currentView === 'detail' &&
              this.selectedTenant?.id === tenant.id
            ) {
              this.showTable();
            }
          } else {
            this.showError(response.message);
          }
        },
        error: (error: unknown) => {
          this.showError('Failed to delete tenant');
          console.error('Error deleting tenant:', error);
        },
      });
    }
  }

  onViewTenant(tenant: ITenant) {
    this.currentView = 'detail';
    this.selectedTenant = tenant;
  }

  onEditTenant(tenant: ITenant) {
    this.showInfo('Edit functionality will be implemented soon');
    // TODO: Implement edit functionality
  }

  // Alert helper methods
  private showSuccess(message: string) {
    this.alertService.success({
      errors: [{ message, errorType: 'success' }],
      timeout: 3000,
    });
  }

  private showError(message: string) {
    this.alertService.error({
      errors: [{ message, errorType: 'error' }],
      timeout: 5000,
    });
  }

  private showInfo(message: string) {
    this.alertService.info({
      errors: [{ message, errorType: 'info' }],
      timeout: 3000,
    });
  }
  private processTenantData() {
    // Clear existing data
    this.tenantGroups.clear();
    this.primaryTenants = [];

    // Group tenants by tenantGroup
    this.tenants.forEach((tenant) => {
      const groupId = tenant.tenantGroup;
      if (!this.tenantGroups.has(groupId)) {
        this.tenantGroups.set(groupId, []);
      }
      this.tenantGroups.get(groupId)!.push(tenant);
    });

    // Extract primary tenants for table display and prepare for NgMatTable
    this.tenantGroups.forEach((group) => {
      const primaryTenant = group.find((t) => t.isPrimary);
      if (primaryTenant) {
        // Enhance tenant data for table display
        const enhancedTenant = {
          ...primaryTenant,
          groupCount: group.length,
          groupMembers: group,
          propertyName: this.getPropertyName(primaryTenant.propertyId),
          tenantCount: group.length,
          statusDisplay: this.getStatusText(primaryTenant),
          statusClass: this.getStatusClass(primaryTenant),
          statusIcon: this.getStatusIcon(primaryTenant),
        };
        this.primaryTenants.push(enhancedTenant as ITenant);
      }
    });
  }
  private loadTenants() {
    this.tenantService.getAllTenants().subscribe({
      next: (tenants: ITenant[]) => {
        this.tenants = tenants;
        this.processTenantData();
      },
      error: (error: unknown) => {
        this.showError('Failed to load tenants');
        console.error('Error loading tenants:', error);
      },
    });
  }
}
