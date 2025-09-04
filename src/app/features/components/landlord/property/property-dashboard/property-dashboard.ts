import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
// Removed direct Material imports - using shared library instead
import { MatMenuModule } from '@angular/material/menu';
import { catchError, filter, Observable, of, switchMap, tap } from 'rxjs';

import {
  AlertService,
  FileUploadConfig,
  NgButton,
  NgDialogService,
  NgDivider,
  NgFileUploadComponent,
  NgIconComponent,
  NgMatTable,
  NgMenuComponent,
  NgMenuTriggerDirective,
  NgSelectComponent,
  SelectOption,
  TableColumn,
  TableOptions,
  UploadedFile,
} from '../../../../../../../projects/shared/src/public-api';
import { ApiError, Result } from '../../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../../oauth/service/oauth.service';
import { DocumentCategory, PropertyStatus } from '../../../../enums/view.enum';
import { IDocument } from '../../../../models/document';
import { IProperty } from '../../../../models/property';
import { ITenant } from '../../../../models/tenant';
import { PropertyService } from '../../../../service/property.service';
import { PropertyAdd } from '../property-add/property-add';
import { PropertyDetail } from '../property-detail/property-detail';

// Type for transformed property with additional display fields
type TransformedProperty = IProperty & {
  fullAddress: string;
  mappedTenants: string;
  documentsCount: string;
};

// Type for tenant children/family members
interface TenantChild {
  id: number;
  name: string;
  age: number;
  relation: string;
}

@Component({
  selector: 'app-property-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    NgButton,
    NgDivider,
    NgFileUploadComponent,
    NgIconComponent,
    NgSelectComponent,
    NgMatTable,
    MatMenuModule,
    PropertyAdd,
    PropertyDetail,
    NgMenuTriggerDirective,
    NgMenuComponent,
    OverlayModule,
  ],
  templateUrl: './property-dashboard.html',
  styleUrls: ['./property-dashboard.scss'],
})
export class PropertyDashboard implements OnInit {
  // Template references for dynamic content
  readonly propertyNameTemplate = viewChild.required<TemplateRef<unknown>>(
    'propertyNameTemplate',
  );
  readonly tenantTemplate =
    viewChild.required<TemplateRef<unknown>>('tenantTemplate');
  readonly documentTemplate =
    viewChild.required<TemplateRef<unknown>>('documentTemplate');
  readonly actionTemplate =
    viewChild.required<TemplateRef<unknown>>('actionTemplate');
  readonly statusTemplate =
    viewChild.required<TemplateRef<unknown>>('statusTemplate');

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
    stickyPaginator: true,
  };

  // Property Data (includes both mock and API data)
  properties: TransformedProperty[] = [];

  // Loading and error states
  isLoading = false;
  loadingError: string | null = null;

  properties$!: Observable<TransformedProperty[]>;
  // Dialog and menu state
  showUploadModal = false;
  showDownloadModal = false;
  selectedPropertyForUpload: IProperty | null = null;
  selectedPropertyForDownload: IProperty | null = null;
  selectedDocumentCategory: DocumentCategory = DocumentCategory.OwnershipProof;
  selectedDownloadCategory: DocumentCategory | 'all' = 'all';

  // Document categories for dropdown
  documentCategories: SelectOption[] = [
    {
      value: DocumentCategory.OwnershipProof,
      label: 'Ownership Proof',
    },
    {
      value: DocumentCategory.UtilityBill,
      label: 'Utility Bills',
    },
    {
      value: DocumentCategory.PropertyImages,
      label: 'Property Photos',
    },
    {
      value: DocumentCategory.NoObjectionCertificate,
      label: 'NOC Certificate',
    },
  ];

  // File upload configuration
  documentUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    acceptedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowMultiple: true,
  };

  // Current upload state
  selectedUploadFiles: UploadedFile[] = [];
  isUploading = false;

  downloadCategories: SelectOption[] = [
    {
      value: 'all',
      label: 'All Documents',
    },
    {
      value: DocumentCategory.OwnershipProof,
      label: 'Ownership Proof',
    },
    {
      value: DocumentCategory.UtilityBill,
      label: 'Utility Bills',
    },
    {
      value: DocumentCategory.PropertyImages,
      label: 'Property Photos',
    },
    {
      value: DocumentCategory.NoObjectionCertificate,
      label: 'NOC Certificate',
    },
  ];

  userdetail: Partial<IUserDetail> = {};

  private dialogService = inject(NgDialogService);

  private userService = inject(OauthService);

  private propertyService = inject(PropertyService);

  private alertService = inject(AlertService);

  private $cdr = inject(ChangeDetectorRef);

  constructor() {
    this.userdetail = this.userService.getUserInfo();
  }

  ngOnInit() {
    this.initializeTableColumns();
    this.loadData();
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
    // Refresh data when returning to table view
    this.refreshData();
  }

  // Simple Property Actions
  onViewProperty(property: IProperty): void {
    this.selectedProperty = property;
    this.currentView = 'detail';
  }

  onEditProperty(property: IProperty): void {
    this.selectedProperty = property;
    this.currentView = 'edit';
  }

  onDeleteProperty(property: IProperty): void {
    this.dialogService
      .confirm({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${property.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warning',
        icon: 'warning',
        disableClose: true,
      })
      .pipe(
        // Only proceed if user confirms
        filter((result) => result.action === 'confirm'),

        // Call API delete
        switchMap(() =>
          this.propertyService.deleteProperty(property.id!).pipe(
            tap((success: Result<boolean>) => {
              if (success.success) {
                // Update local array
                this.properties = this.properties.filter(
                  (item) => item.id !== property.id,
                );
                this.alert('Property deleted successfully!');
              } else {
                this.alert(
                  'Failed to delete property. Please try again.',
                  'error',
                );
              }
            }),
            catchError((error: HttpErrorResponse) => {
              const apiError = error.error as ApiError<boolean>; // Cast to your interface
              this.alert(
                apiError.error?.message.toString() ||
                  'Error deleting property. Please try again.',
                'error',
              );
              return of(false); // Prevent stream from breaking
            }),
          ),
        ),
      )
      .subscribe();
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

  getTenantChildren(tenant: ITenant): TenantChild[] {
    console.log(tenant);
    return [];
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
    this.resetUploadModal();
    this.showUploadModal = true;
  }

  onOpenDownloadModal(property: IProperty): void {
    this.selectedPropertyForDownload = property;
    this.updateDownloadCategoryCounts(property);
    this.showDownloadModal = true;
  }
  onCloseUploadModal(): void {
    this.showUploadModal = false;
    this.selectedPropertyForUpload = null;
    this.resetUploadModal();
  }

  onCloseDownloadModal(): void {
    this.showDownloadModal = false;
    this.selectedPropertyForDownload = null;
  }

  onFilesSelected(files: UploadedFile[]): void {
    this.selectedUploadFiles = files;
  }

  onFileRemoved(file: UploadedFile): void {
    this.selectedUploadFiles = this.selectedUploadFiles.filter(
      (f) => f.url !== file.url,
    );
  }

  onFileUploadError(error: { file: UploadedFile; error: string }): void {
    this.alertService.error({
      errors: [
        {
          message: `Error uploading ${error.file.name}: ${error.error}`,
          errorType: 'error',
        },
      ],
      timeout: 5000,
    });
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onUploadFiles(): void {
    if (
      !this.selectedPropertyForUpload ||
      !this.selectedDocumentCategory ||
      this.selectedUploadFiles.length === 0
    ) {
      this.alertService.error({
        errors: [
          {
            message: 'Please select a category and upload at least one file.',
            errorType: 'error',
          },
        ],
        timeout: 3000,
      });
      return;
    }

    this.isUploading = true;

    // Create FormData for API call
    const formData = new FormData();

    // Add property and category information
    formData.append(
      'propertyId',
      this.selectedPropertyForUpload.id!.toString(),
    );
    formData.append('category', this.selectedDocumentCategory.toString());
    formData.append(
      'landlordId',
      (
        this.selectedPropertyForUpload.landlordId ||
        Number(this.userdetail.userId) ||
        1
      ).toString(),
    );

    // Add each file to FormData
    this.selectedUploadFiles.forEach((uploadedFile, index) => {
      formData.append(
        `documents[${index}].file`,
        uploadedFile.file,
        uploadedFile.name,
      );
      formData.append(
        `documents[${index}].description`,
        uploadedFile.description || '',
      );

      formData.append(
        `fileDescriptions[${index}]`,
        `${this.getCategoryLabel(this.selectedDocumentCategory)} document for ${this.selectedPropertyForUpload!.title}`,
      );
    });

    // Log FormData contents for debugging
    console.log('Uploading FormData with:', {
      propertyId: this.selectedPropertyForUpload.id,
      category: this.selectedDocumentCategory,
      filesCount: this.selectedUploadFiles.length,
    });

    // Make API call
    this.propertyService
      .uploadPropertyDocuments(this.selectedPropertyForUpload.id!, formData)
      .subscribe({
        next: (response: Result<IDocument[]>) => {
          this.isUploading = false;

          if (response.success && response.entity) {
            // Update property documents with API response
            if (!this.selectedPropertyForUpload!.documents) {
              this.selectedPropertyForUpload!.documents = [];
            }
            this.selectedPropertyForUpload!.documents.push(...response.entity);

            // Update the property in the list to reflect new document count
            this.updatePropertyInList(this.selectedPropertyForUpload!);

            // Optionally refresh documents from API to ensure consistency
            this.refreshPropertyDocuments(this.selectedPropertyForUpload!.id!);

            // Show success message
            this.alertService.success({
              errors: [
                {
                  message: `Successfully uploaded ${response.entity.length} document(s) to ${this.getCategoryLabel(this.selectedDocumentCategory)} category.`,
                  errorType: 'success',
                },
              ],
              timeout: 5000,
            });

            // Reset and close modal
            this.resetUploadModal();
            this.onCloseUploadModal();
          } else {
            // Handle API error response
            this.alertService.error({
              errors: [
                {
                  message: 'Failed to upload documents. Please try again.',
                  errorType: 'error',
                },
              ],
              timeout: 5000,
            });
          }
        },
        error: (error) => {
          this.isUploading = false;
          console.error('Error uploading documents:', error);

          this.alertService.error({
            errors: [
              {
                message:
                  'An error occurred while uploading documents. Please try again.',
                errorType: 'error',
              },
            ],
            timeout: 5000,
          });
        },
      });
  }

  resetUploadModal(): void {
    this.selectedUploadFiles = [];
    this.selectedDocumentCategory = DocumentCategory.OwnershipProof;
    this.isUploading = false;
  }

  getCategoryLabel(category: DocumentCategory): string {
    const categoryOption = this.documentCategories.find(
      (c) => c.value === category,
    );
    return categoryOption?.label || 'Unknown Category';
  }

  getCategoryIcon(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.OwnershipProof:
        return 'home_work';
      case DocumentCategory.UtilityBill:
        return 'receipt_long';
      case DocumentCategory.PropertyImages:
        return 'photo_library';
      case DocumentCategory.NoObjectionCertificate:
        return 'verified';
      default:
        return 'upload_file';
    }
  }

  getCategoryHint(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.OwnershipProof:
        return 'Property ownership documents, sale deed, or title documents';
      case DocumentCategory.UtilityBill:
        return 'Electricity, water, gas, or other utility bills';
      case DocumentCategory.PropertyImages:
        return 'Property photos, floor plans, or virtual tour images';
      case DocumentCategory.NoObjectionCertificate:
        return 'No objection certificates from authorities';
      default:
        return 'Upload relevant documents';
    }
  }

  refreshPropertyDocuments(propertyId: number): void {
    this.propertyService.getPropertyDocuments(propertyId).subscribe({
      next: (response: Result<IDocument[]>) => {
        if (response.success && response.entity) {
          // Find and update the property with fresh document data
          const propertyIndex = this.properties.findIndex(
            (p) => p.id === propertyId,
          );
          if (propertyIndex !== -1) {
            this.properties[propertyIndex].documents = response.entity;
            // Re-transform to update display fields
            this.properties[propertyIndex] = this.transformPropertyForTable(
              this.properties[propertyIndex],
            );
          }
        }
      },
      error: (error) => {
        console.error('Error refreshing property documents:', error);
      },
    });
  }

  onDownloadDocument(doc: IDocument): void {
    console.log('Downloading document:', doc.name);

    // Create a temporary link element for download
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name || 'document';
      link.target = '_blank';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Downloaded: ${doc.name}`);
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
      (doc) => doc.category === this.selectedDownloadCategory,
    ).length;
  }

  getSelectedCategoryLabel(): string {
    const category = this.documentCategories.find(
      (cat) => cat.value === this.selectedDownloadCategory,
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
        (doc) => doc.category === this.selectedDownloadCategory,
      );
    }

    if (documentsToDownload.length === 0) {
      alert('No documents found for the selected category.');
      return;
    }

    console.log(
      'Downloading documents for category:',
      this.selectedDownloadCategory,
    );

    // If only one document, download directly
    if (documentsToDownload.length === 1) {
      this.onDownloadDocument(documentsToDownload[0]);
      this.onCloseDownloadModal();
      return;
    }

    // Multiple documents - create a zip-like download experience
    const confirmDownload = confirm(
      `This will download ${documentsToDownload.length} documents. Continue?`,
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
        const categoryName =
          this.selectedDownloadCategory === 'all'
            ? 'All Documents'
            : this.getSelectedCategoryLabel();
        alert(
          `${documentsToDownload.length} documents from "${categoryName}" category have been downloaded.`,
        );
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
  getStatusIcon(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Listed:
        return 'check_circle';
      case PropertyStatus.Rented:
        return 'people';
      case PropertyStatus.Archived:
        return 'delete';
      case PropertyStatus.Draft:
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

  getSimplifiedStatus(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Listed:
        return 'LISTED';
      case PropertyStatus.Rented:
        return 'RENTED';
      case PropertyStatus.Archived:
        return 'Archived';
      case PropertyStatus.Draft:
        return 'Draft';
      default:
        return 'LISTED';
    }
  }

  getSimplifiedStatusIconColor(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Listed:
        return 'icon-info';
      case PropertyStatus.Rented:
        return 'icon-success';
      case PropertyStatus.Archived:
        return 'icon-error ';
      case PropertyStatus.Draft:
        return 'icon-warning';
      default:
        return 'icon-warning';
    }
  }

  private exportPropertiesToCSV(properties: TransformedProperty[]): void {
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
        ].join(','),
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

  private updateDownloadCategoryCounts(property: IProperty): void {
    // Update download categories to show counts in labels
    const documents = property.documents || [];

    this.downloadCategories = [
      {
        value: 'all',
        label: `All Documents (${documents.length})`,
      },
      {
        value: DocumentCategory.OwnershipProof,
        label: `Ownership Proof (${documents.filter((d) => d.category === DocumentCategory.OwnershipProof).length})`,
      },
      {
        value: DocumentCategory.UtilityBill,
        label: `Utility Bills (${documents.filter((d) => d.category === DocumentCategory.UtilityBill).length})`,
      },
      {
        value: DocumentCategory.PropertyImages,
        label: `Property Photos (${documents.filter((d) => d.category === DocumentCategory.PropertyImages).length})`,
      },
      {
        value: DocumentCategory.NoObjectionCertificate,
        label: `NOC Certificate (${documents.filter((d) => d.category === DocumentCategory.NoObjectionCertificate).length})`,
      },
    ];
  }

  private refreshData(): void {
    // Only reload API data to get latest properties
    if (this.userdetail?.userId) {
      this.loadApiData();
    }
  }
  private initializeTableColumns() {
    // Initialize table columns with templates
    this.tableColumns = [
      {
        key: 'id',
        label: 'ID',
        width: '80px',
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'title',
        label: 'Property Name',
        width: 'auto',
        type: 'custom',
        template: this.propertyNameTemplate(),
        align: 'left',
      },
      {
        key: 'fullAddress',
        label: 'Address',
        width: 'auto',
        align: 'left',
      },
      {
        key: 'mappedTenants',
        label: 'Tenants',
        width: '300px',
        type: 'custom',
        template: this.tenantTemplate(),
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'documentsActions',
        label: 'Documents',
        width: '150px',
        type: 'custom',
        template: this.documentTemplate(),
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'monthlyRent',
        label: 'Monthly Rent',
        width: '120px',
        align: 'right',
        headerAlign: 'right',
      },
      {
        key: 'status',
        label: 'Status',
        width: '150px',
        type: 'custom',
        template: this.statusTemplate(),
        align: 'center',
        headerAlign: 'center',
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

  private loadData() {
    this.isLoading = true;
    this.loadingError = null;
    // Then fetch data from API if user is available
    if (this.userdetail?.userId) {
      this.loadApiData();
    } else {
      this.isLoading = false;
    }
  }

  private loadApiData() {
    const landlordId = Number(this.userdetail.userId);

    this.propertyService.getProperties(landlordId).subscribe({
      next: (response: Result<IProperty[]>) => {
        if (response.success) {
          this.isLoading = false;

          if (response && response.entity.length > 0) {
            // Transform API properties and merge with existing mock data
            const transformedApiProperties = response.entity.map((property) =>
              this.transformPropertyForTable(property),
            );

            this.properties = [...transformedApiProperties];
            this.properties$ = of(this.properties);
            this.$cdr.markForCheck();
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.loadingError =
          'Failed to load properties from server. Showing mock data only.';
        console.error('Error loading properties from API:', error);

        this.alertService.success({
          errors: [
            {
              message: this.loadingError,
              errorType: 'error',
            },
          ],
        });
      },
    });
  }

  private transformPropertyForTable(property: IProperty): TransformedProperty {
    return {
      ...property,
      fullAddress: this.getFullAddress(property),
      mappedTenants: this.getMappedTenantsDisplay(property.tenants || []),
      documentsCount: this.getDocumentsDisplay(property.documents || []),
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

  private updatePropertyInList(updatedProperty: IProperty): void {
    const index = this.properties.findIndex((p) => p.id === updatedProperty.id);
    if (index !== -1) {
      this.properties[index] = this.transformPropertyForTable(updatedProperty);
    }
  }

  private alert(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
  ): void {
    // Show success message
    this.alertService.showAlert({
      errors: [
        {
          message: message,
          errorType: type,
        },
      ],
      timeout: 5000,
    });
  }
}
