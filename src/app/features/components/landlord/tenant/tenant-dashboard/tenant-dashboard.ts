import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  inject,
  viewChild,
} from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  AlertService,
  NgButton,
  NgDialogService,
  NgIconComponent,
  NgMatTable,
  TableColumn,
  TableOptions,
} from '../../../../../../../projects/shared/src/public-api';
// Models and enums
import { ResultStatusType } from '../../../../../common/enums/common.enums';
import { Result } from '../../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../../oauth/service/oauth.service';
import { IProperty } from '../../../../models/property';
import { ITenant } from '../../../../models/tenant';
import { PropertyService } from '../../../../service/property.service';
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
  readonly actionTemplate =
    viewChild.required<TemplateRef<unknown>>('actionTemplate');

  // View management
  currentView: ViewType = 'table';
  selectedTenant: ITenant | null = null;

  // Edit/Detail data
  editingTenants: ITenant[] = [];
  editingSingleTenant: ITenant | null = null;
  editMode: 'group' | 'single' = 'group';

  // Data
  tenants: ITenant[] = [];
  primaryTenants: ITenant[] = []; // Only primary tenants for table display
  tenantGroups: Map<string, ITenant[]> = new Map(); // Grouped tenants by tenantGroup
  properties: IProperty[] = [];
  userdetail: Partial<IUserDetail> = {};

  // NgMatTable configuration
  tableColumns: TableColumn[] = [];

  tableOptions: TableOptions = {
    sortable: true,
    responsive: true,
    stickyHeader: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20],
  };
  initDashBoard$!: Observable<boolean>;

  private alertService = inject(AlertService);
  private dialogService = inject(NgDialogService);
  private tenantService = inject(TenantService);
  private propertyService = inject(PropertyService);
  private userService = inject(OauthService);
  private $cdr = inject(ChangeDetectorRef);

  constructor() {
    this.userdetail = this.userService.getUserInfo();
  }

  ngOnInit() {
    this.initializeTable();
    this.loadProperties();
    this.loadTenants();
  }

  // Statistics methods
  getActiveTenants(): number {
    return this.tenants.filter((t) => t.isActive).length;
  }

  getPendingOnboarding(): number {
    return this.tenants.filter(
      (t) => t.agreementAccepted && !t.onboardingEmailSent,
    ).length;
  }

  getTotalRentAmount(): number {
    return this.tenants
      .filter((t) => t.isActive)
      .reduce((sum, t) => sum + t.rentAmount, 0);
  }

  // Table helper methods
  getPropertyName(propertyId: number): string {
    const property = this.properties.find((p) => p.id === propertyId);
    return property
      ? `${property.title} - ${property.locality}, ${property.city}`
      : 'Unknown Property';
  }

  getStatusClass(tenant: ITenant): string {
    if (!tenant.isActive) return 'status-inactive';
    if (!tenant.agreementSigned) return 'status-new';
    if (tenant.agreementSigned && !tenant.agreementAccepted)
      return 'status-pending';
    if (tenant.agreementAccepted && !tenant.onboardingEmailSent)
      return 'status-ready';
    if (tenant.onboardingEmailSent) return 'status-active';
    return 'status-active';
  }

  getStatusIcon(tenant: ITenant): string {
    if (!tenant.isActive) return 'block';
    if (!tenant.agreementSigned) return 'description';
    if (tenant.agreementSigned && !tenant.agreementAccepted) return 'schedule';
    if (tenant.agreementAccepted && !tenant.onboardingEmailSent) return 'send';
    if (tenant.onboardingEmailSent) return 'check_circle';
    return 'check_circle';
  }

  getStatusText(tenant: ITenant): string {
    if (!tenant.isActive) return 'Inactive';
    if (!tenant.agreementSigned) return 'Agreement Pending';
    if (tenant.agreementSigned && !tenant.agreementAccepted)
      return 'Awaiting Acceptance';
    if (tenant.agreementAccepted && !tenant.onboardingEmailSent)
      return 'Ready for Onboarding';
    if (tenant.onboardingEmailSent) return 'Email Sent';
    return 'Active';
  }

  getDeleteIconClass(tenant: ITenant): string {
    let classes = 'icon-error icon-clickable delete-action';

    if (tenant.isPrimary) {
      classes += ' primary-tenant-delete';
    }

    // Check if agreement has started (primary tenant accepted)
    if (this.isGroupAgreementAccepted(tenant.tenantGroup)) {
      classes += ' agreement-started-delete';
    }

    return classes;
  }

  // NgMatTable event handlers

  onRowClick(tenant: ITenant): void {
    console.log('Row clicked:', tenant);
    console.log('Row click event triggered');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowExpand(tenant: ITenant): void {
    console.log('Row expand event triggered for tenant:', tenant);
  }

  // Helper methods for expanded content
  getGroupMembers(tenantGroup: string): ITenant[] {
    return this.tenantGroups.get(tenantGroup) || [];
  }

  getGroupMemberCount(tenantGroup: string): number {
    return this.tenantGroups.get(tenantGroup)?.length || 0;
  }

  // View management
  showTable() {
    this.currentView = 'table';
    this.selectedTenant = null;
    this.editingTenants = [];
    this.editingSingleTenant = null;
    this.editMode = 'group';
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

  onTenantEdited() {
    this.loadTenants();
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
      next: (response) => {
        if (response.status === ResultStatusType.Success) {
          this.showSuccess('Agreement created and email sent to tenant');
          this.loadTenants(); // Reload to get updated tenant data
        } else {
          const errorMessage = Array.isArray(response.message)
            ? response.message.join(', ')
            : response.message || 'Failed to create agreement';
          this.showError(errorMessage);
        }
      },
      error: (error: unknown) => {
        this.showError('Failed to create agreement');
        console.error('Error creating agreement:', error);
      },
    });
  }
  // Check if any primary tenant in the group has accepted the agreement
  isGroupAgreementAccepted(tenantGroup: string): boolean {
    const groupMembers = this.tenantGroups.get(tenantGroup) || [];
    const primaryTenant = groupMembers.find((member) => member.isPrimary);
    return primaryTenant?.agreementAccepted || false;
  }
  onSendOnboardingEmail(tenant: ITenant) {
    const isResend = tenant.onboardingEmailSent;
    const action = isResend ? 'Resending' : 'Sending';
    const actionPast = isResend ? 'resent' : 'sent';

    this.showInfo(`${action} onboarding email to ${tenant.email}...`);

    // Send email to specific tenant
    this.tenantService.sendOnboardingEmailsByTenantIds([tenant.id!]).subscribe({
      next: (response) => {
        if (response.status === ResultStatusType.Success) {
          this.showSuccess(
            `Onboarding email ${actionPast} to ${tenant.name}${isResend ? ' (resent successfully)' : ''}`,
          );
          this.loadTenants(); // Reload to get updated tenant data
        } else {
          const errorMessage = Array.isArray(response.message)
            ? response.message.join(', ')
            : response.message ||
              `Failed to ${isResend ? 'resend' : 'send'} onboarding email`;
          this.showError(errorMessage);
        }
      },
      error: (error: unknown) => {
        this.showError(
          `Failed to ${isResend ? 'resend' : 'send'} onboarding email`,
        );
        console.error('Error sending onboarding email:', error);
      },
    });
  }

  // Send onboarding emails to all tenants in a property
  onSendBulkOnboardingEmails(propertyId: number) {
    this.showInfo('Sending onboarding emails to all eligible tenants...');

    const landlordId = this.userdetail?.userId
      ? Number(this.userdetail.userId)
      : 0;

    if (landlordId <= 0) {
      this.showError('Invalid landlord information');
      return;
    }

    this.tenantService
      .sendOnboardingEmailsAPI(landlordId, propertyId)
      .subscribe({
        next: (response) => {
          if (response.status === ResultStatusType.Success) {
            this.showSuccess(
              `Onboarding emails sent to ${response.entity} tenant(s)`,
            );
            this.loadTenants(); // Reload to get updated tenant data
          } else {
            const errorMessage = Array.isArray(response.message)
              ? response.message.join(', ')
              : response.message || 'Failed to send onboarding emails';
            this.showError(errorMessage);
          }
        },
        error: (error: unknown) => {
          this.showError('Failed to send onboarding emails');
          console.error('Error sending onboarding emails:', error);
        },
      });
  }

  // Send onboarding emails to all tenants across all properties
  onSendAllOnboardingEmails() {
    this.dialogService
      .confirm({
        title: 'Send All Onboarding Emails',
        message:
          'Are you sure you want to send onboarding emails to all eligible tenants across all properties?',
        icon: 'send',
        type: 'confirm',
        confirmText: 'Send All',
        cancelText: 'Cancel',
        width: '450px',
        panelClass: ['bulk-email-modal', 'confirmation-modal'],
      })
      .subscribe((result) => {
        if (result.action === 'confirm') {
          this.performSendAllOnboardingEmails();
        }
      });
  }
  onDeleteTenant(tenant: ITenant) {
    const tenantType = tenant.isPrimary ? 'primary tenant' : 'tenant';
    const isPrimary = tenant.isPrimary;

    this.dialogService
      .confirm({
        title: `Delete ${tenantType}`,
        message: `Are you sure you want to delete ${tenantType} "${tenant.name}"?${isPrimary ? '\n\nNote: This is a primary tenant and may have restrictions.' : ''}`,
        icon: 'delete',
        type: 'warning',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        width: '450px',
        panelClass: [
          'delete-confirmation-modal',
          isPrimary ? 'primary-tenant-delete' : 'regular-tenant-delete',
        ],
      })
      .subscribe((result) => {
        if (result.action === 'confirm') {
          this.performDelete(tenant);
        }
      });
  }

  onViewTenant(tenant: ITenant) {
    // Get all tenants in the same group for detail view
    const groupMembers = this.getGroupMembers(tenant.tenantGroup);
    this.editingTenants = groupMembers;
    this.editingSingleTenant = null;
    this.editMode = 'group';
    this.currentView = 'detail';
  }

  onEditTenant(tenant: ITenant): void {
    // Single tenant edit from expanded row
    this.editingSingleTenant = tenant;
    this.editingTenants = this.getGroupMembers(tenant.tenantGroup);
    this.editMode = 'single';
    this.currentView = 'edit';
  }

  // Edit all tenants in group (from table row action)
  onEditTenantGroup(primaryTenant: ITenant): void {
    const groupMembers = this.getGroupMembers(primaryTenant.tenantGroup);
    this.editingTenants = groupMembers;
    this.editingSingleTenant = null;
    this.editMode = 'group';
    this.currentView = 'edit';
  }
  private performSendAllOnboardingEmails() {
    this.showInfo('Sending onboarding emails to all eligible tenants...');

    // Get all unique property IDs from current tenants
    const propertyIds = [...new Set(this.tenants.map((t) => t.propertyId))];

    if (propertyIds.length === 0) {
      this.showError('No properties found');
      return;
    }

    const landlordId = this.userdetail?.userId
      ? Number(this.userdetail.userId)
      : 0;

    if (landlordId <= 0) {
      this.showError('Invalid landlord information');
      return;
    }

    let totalEmailsSent = 0;
    let completedRequests = 0;

    // Send emails for each property
    propertyIds.forEach((propertyId) => {
      this.tenantService
        .sendOnboardingEmailsAPI(landlordId, propertyId)
        .subscribe({
          next: (response) => {
            completedRequests++;
            if (response.status === ResultStatusType.Success) {
              totalEmailsSent += response.entity || 0;
            }

            // Check if all requests are completed
            if (completedRequests === propertyIds.length) {
              if (totalEmailsSent > 0) {
                this.showSuccess(
                  `Onboarding emails sent to ${totalEmailsSent} tenant(s) across all properties`,
                );
              } else {
                this.showInfo(
                  'No eligible tenants found for onboarding emails',
                );
              }
              this.loadTenants(); // Reload to get updated tenant data
            }
          },
          error: (error: unknown) => {
            completedRequests++;
            console.error(
              `Error sending onboarding emails for property ${propertyId}:`,
              error,
            );

            // Check if all requests are completed
            if (completedRequests === propertyIds.length) {
              if (totalEmailsSent > 0) {
                this.showSuccess(
                  `Onboarding emails sent to ${totalEmailsSent} tenant(s). Some requests failed.`,
                );
              } else {
                this.showError('Failed to send onboarding emails');
              }
              this.loadTenants(); // Reload to get updated tenant data
            }
          },
        });
    });
  }

  private performDelete(tenant: ITenant) {
    this.tenantService.deleteTenant(tenant.id!).subscribe({
      next: (response) => {
        if (response.status === ResultStatusType.Success) {
          this.showSuccess(
            Array.isArray(response.message)
              ? response.message.join(', ')
              : response.message || 'Tenant deleted successfully',
          );
          this.loadTenants(); // Reload the tenant list
          if (
            this.currentView === 'detail' &&
            this.selectedTenant?.id === tenant.id
          ) {
            this.showTable();
          }
        } else {
          // Check if this is a hard delete required scenario
          const errorMessage = Array.isArray(response.message)
            ? response.message.join(', ')
            : response.message || 'Failed to delete tenant';

          if (errorMessage.includes('HARD_DELETE_REQUIRED')) {
            this.handleHardDeleteRequired(tenant, errorMessage);
          } else {
            this.showError(errorMessage);
          }
        }
      },
      error: (error: unknown) => {
        this.showError('Failed to delete tenant');
        console.error('Error deleting tenant:', error);
      },
    });
  }

  private handleHardDeleteRequired(tenant: ITenant, originalMessage: string) {
    // Extract the user-friendly message after the pipe
    const userMessage =
      originalMessage.split('|')[1] ||
      'Tenancy already started. Hard delete required to remove this tenant.';

    this.dialogService
      .confirm({
        title: 'Hard Delete Required',
        message: `${userMessage}\n\nDo you want to proceed with hard delete?\n\n⚠️ Warning: This action cannot be undone and will permanently remove the tenant.`,
        icon: 'warning',
        type: 'error',
        confirmText: 'Hard Delete',
        cancelText: 'Cancel',
        width: '500px',
        panelClass: ['hard-delete-modal', 'danger-modal'],
      })
      .subscribe((result) => {
        if (result.action === 'confirm') {
          this.performHardDelete(tenant);
        }
      });
  }

  private performHardDelete(tenant: ITenant) {
    this.showInfo(`Performing hard delete for ${tenant.name}...`);

    this.tenantService.hardDeleteTenant(tenant.id!).subscribe({
      next: (response) => {
        if (response.status === ResultStatusType.Success) {
          this.showSuccess(
            `${tenant.name} has been permanently deleted (hard delete)`,
          );
          this.loadTenants(); // Reload the tenant list
          if (
            this.currentView === 'detail' &&
            this.selectedTenant?.id === tenant.id
          ) {
            this.showTable();
          }
        } else {
          const errorMessage = Array.isArray(response.message)
            ? response.message.join(', ')
            : response.message || 'Failed to hard delete tenant';
          this.showError(errorMessage);
        }
      },
      error: (error: unknown) => {
        this.showError('Failed to hard delete tenant');
        console.error('Error hard deleting tenant:', error);
      },
    });
  }

  private initializeTable() {
    this.tableColumns = [
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
        type: 'custom',
        template: this.actionTemplate(),
        align: 'center',
        headerAlign: 'center',
      },
    ];
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

    if (!this.tenants || this.tenants.length === 0) {
      this.initDashBoard$ = of(true);
      return;
    }

    // Group tenants by tenantGroup
    this.tenants.forEach((tenant) => {
      if (tenant && tenant.tenantGroup) {
        const groupId = tenant.tenantGroup;
        if (!this.tenantGroups.has(groupId)) {
          this.tenantGroups.set(groupId, []);
        }
        this.tenantGroups.get(groupId)!.push(tenant);
      }
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

    this.initDashBoard$ = of(true);
  }
  private loadTenants() {
    const landlordId = this.userdetail?.userId
      ? Number(this.userdetail.userId)
      : 0;
    if (landlordId > 0) {
      this.tenantService.getTenantsByLandlord(landlordId).subscribe({
        next: (response: Result<ITenant[]>) => {
          if (response && response.entity) {
            this.tenants = response.entity || [];
          } else {
            this.tenants = [];
          }
          this.processTenantData();
        },
        error: (error: unknown) => {
          this.showError('Failed to load tenants');
          console.error('Error loading tenants:', error);
          this.tenants = [];
          this.processTenantData();
        },
      });
    }
  }

  // Load properties for the current landlord
  private loadProperties() {
    const landlordId = this.userdetail?.userId
      ? Number(this.userdetail.userId)
      : 0;
    if (landlordId > 0) {
      this.propertyService.getProperties(landlordId).subscribe({
        next: (response: Result<IProperty[]>) => {
          if (response && response.entity) {
            this.properties = response.entity || [];
          } else {
            this.properties = [];
          }
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.properties = [];
        },
      });
    }
  }
}
