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
import {
  documentCategories,
  documentUploadConfig,
} from '../../../../constants/document.constants';
import { DocumentCategory, PropertyStatus } from '../../../../enums/view.enum';
import { IDocument } from '../../../../models/document';
import { IProperty, TransformedProperty } from '../../../../models/property';
import { ITenant, ITenantChildren } from '../../../../models/tenant';
import { CommonService } from '../../../../service/common.service';
import { PropertyDashboardService } from '../../../../service/property-dashboard.service';
import { PropertyService } from '../../../../service/property.service';
import { PropertyAdd } from '../property-add/property-add';
import { PropertyDetail } from '../property-detail/property-detail';

// Type for transformed property with additional display fields

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
  documentCategoryOptions: SelectOption[] = documentCategories;

  // File upload configuration
  documentUploadConfig: FileUploadConfig = documentUploadConfig;

  // Current upload state
  selectedUploadFiles: UploadedFile[] = [];
  isUploading = false;
  downloadCategories: SelectOption[] = [];
  userdetail: Partial<IUserDetail> = {};

  private dialogService = inject(NgDialogService);
  private userService = inject(OauthService);
  private propertyService = inject(PropertyService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private commonService = inject(CommonService);
  private dashboardService = inject(PropertyDashboardService); // NEW: Inject the new service

  constructor() {
    this.userdetail = this.userService.getUserInfo();
  }
  get categoryInfo() {
    return this.dashboardService.getCategoryInfo(this.selectedDocumentCategory);
  }
  ngOnInit() {
    this.downloadCategories =
      this.dashboardService.getDownloadCategoryOptions();
    this.documentCategoryOptions =
      this.dashboardService.getDocumentCategoryOptions();
    this.initializeTableColumns();
    this.loadData();
  }

  getIcon(): string {
    return this.dashboardService.getCategoryIcon(this.selectedDocumentCategory);
  }

  getLabel(): string {
    return this.dashboardService.getCategoryLabel(
      this.selectedDocumentCategory,
    );
  }

  getHint(): string {
    return this.dashboardService.getCategoryHint(this.selectedDocumentCategory);
  }

  // ... (Other component methods remain the same) ...

  // CRUD Operations
  onCreateProperty(): void {
    this.selectedProperty = null;
    this.currentView = 'create';
  }

  // Navigation
  goToTableView(): void {
    this.currentView = 'table';
    this.selectedProperty = null;
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
        filter((result) => result.action === 'confirm'),
        switchMap(() =>
          this.propertyService.deleteProperty(property.id!).pipe(
            tap((success: Result<boolean>) => {
              if (success.success) {
                this.properties = this.properties.filter(
                  (item) => item.id !== property.id,
                );
                this.showAlert('Property deleted successfully!');
              } else {
                this.showAlert(
                  'Failed to delete property. Please try again.',
                  'error',
                );
              }
            }),
            catchError((error: HttpErrorResponse) => {
              const apiError = error.error as ApiError<boolean>;
              this.showAlert(
                apiError.error?.message.toString() ||
                  'Error deleting property. Please try again.',
                'error',
              );
              return of(false);
            }),
          ),
        ),
      )
      .subscribe();
  }

  // Statistics Methods - These are simple enough to stay here
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

  // Document and Upload Methods
  onUploadDocument(property: IProperty): void {
    this.selectedPropertyForUpload = property;
    this.resetUploadModal();
    this.showUploadModal = true;
  }

  onOpenDownloadModal(property: IProperty): void {
    this.selectedPropertyForDownload = property;
    this.downloadCategories = this.dashboardService.getDownloadCategoryOptions(
      property.documents || [],
    );
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

  onFileRemoved(removed: { file: UploadedFile; index: number }): void {
    this.selectedUploadFiles.splice(removed.index, 1);
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

  onUploadFiles(): void {
    if (
      !this.selectedPropertyForUpload ||
      !this.selectedDocumentCategory ||
      this.selectedUploadFiles.length === 0
    ) {
      this.showAlert(
        'Please select a category and upload at least one file.',
        'error',
      );
      return;
    }
    this.isUploading = true;
    const formData = this.dashboardService.createDocumentFormData(
      this.selectedUploadFiles,
      this.selectedPropertyForUpload,
      this.selectedDocumentCategory,
      this.userdetail,
    );

    this.propertyService
      .uploadPropertyDocuments(this.selectedPropertyForUpload.id!, formData)
      .subscribe({
        next: (response: Result<IDocument[]>) => {
          this.isUploading = false;
          if (response.success && response.entity) {
            if (!this.selectedPropertyForUpload!.documents) {
              this.selectedPropertyForUpload!.documents = [];
            }
            this.selectedPropertyForUpload!.documents.push(...response.entity);
            this.updatePropertyInList(this.selectedPropertyForUpload!);
            this.showAlert(
              `Successfully uploaded ${response.entity.length} document(s) to ${this.dashboardService.getCategoryLabel(this.selectedDocumentCategory)} category.`,
            );
            this.resetUploadModal();
            this.onCloseUploadModal();
          } else {
            this.showAlert(
              'Failed to upload documents. Please try again.',
              'error',
            );
          }
        },
        error: (error) => {
          this.isUploading = false;
          console.error('Error uploading documents:', error);
          this.showAlert(
            'An error occurred while uploading documents. Please try again.',
            'error',
          );
        },
      });
  }

  resetUploadModal(): void {
    this.selectedUploadFiles = [];
    this.selectedDocumentCategory = DocumentCategory.OwnershipProof;
    this.isUploading = false;
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fileInput?.click();
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
    return this.dashboardService.getCategoryLabel(
      this.selectedDownloadCategory,
    );
  }

  isDownloadDisabled(): boolean {
    return this.selectedDownloadCategory === 'all'
      ? this.getAllDocumentsCount() === 0
      : this.getSelectedCategoryCount() === 0;
  }

  onDownloadSelectedCategory(): void {
    this.commonService.downloadDocumentsByCategory(
      this.selectedPropertyForDownload?.documents ?? [],
      this.selectedDownloadCategory,
    );
  }

  onTenantSelect(tenant: ITenant): void {
    console.log('Selected tenant:', tenant.name);
  }

  navigateToDetail(property: IProperty): void {
    this.selectedProperty = property;
    this.currentView = 'detail';
  }

  getStatusIcon(status: PropertyStatus): string {
    return this.dashboardService.getStatusIcon(status);
  }

  handleDownloadClick(property: IProperty): void {
    this.onOpenDownloadModal(property);
  }

  handleUploadClick(property: IProperty): void {
    this.onUploadDocument(property);
  }

  getSimplifiedStatus(status: PropertyStatus): string {
    return this.dashboardService.getSimplifiedStatus(status);
  }

  getSimplifiedStatusIconColor(status: PropertyStatus): string {
    return this.dashboardService.getSimplifiedStatusIconColor(status);
  }

  getTenantsList(property: IProperty): ITenant[] {
    return property.tenants || [];
  }

  getTenantChildren(tenant: ITenant): ITenantChildren[] {
    console.log(tenant);
    return [];
  }

  getPropertyDocuments(property: IProperty): IDocument[] {
    return property.documents || [];
  }

  private exportPropertiesToCSV(properties: TransformedProperty[]): void {
    this.dashboardService.exportPropertiesToCSV(properties);
  }

  private refreshData(): void {
    if (this.userdetail?.userId) {
      this.loadApiData();
    }
  }

  private initializeTableColumns() {
    this.tableColumns = this.dashboardService.initializeTableColumns(
      this.propertyNameTemplate(),
      this.tenantTemplate(),
      this.documentTemplate(),
      this.actionTemplate(),
      this.statusTemplate(),
    );
  }

  private loadData() {
    this.isLoading = true;
    this.loadingError = null;
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
            const transformedApiProperties = response.entity.map((property) =>
              this.dashboardService.transformPropertyForTable(property),
            );
            this.properties = [...transformedApiProperties];
            this.properties$ = of(this.properties);
            this.cdr.markForCheck();
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.loadingError =
          'Failed to load properties from server. Please try again later.';
        console.error('Error loading properties from API:', error);
        this.showAlert(this.loadingError, 'error');
      },
    });
  }

  private updatePropertyInList(updatedProperty: IProperty): void {
    const index = this.properties.findIndex((p) => p.id === updatedProperty.id);
    if (index !== -1) {
      this.properties[index] =
        this.dashboardService.transformPropertyForTable(updatedProperty);
    }
  }

  private showAlert(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
  ): void {
    this.alertService.showAlert({
      errors: [{ message: message, errorType: type }],
      timeout: 5000,
    });
  }
}
