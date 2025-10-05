import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';

import {
  AlertService,
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgDialogService,
  NgFileUploadComponent,
  NgIconComponent,
  NgLabelComponent,
  NgSelectComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
import { environment } from '../../../../../environments/environment';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { DocumentCategory } from '../../../enums/view.enum';
import { IDocument } from '../../../models/document';
import { ITenant } from '../../../models/tenant';
import { PropertyService } from '../../../service/document.service';
import { TenantService } from '../../../service/tenant.service';

interface DocumentItem extends IDocument {
  uploadedByName?: string;
  uploadedByType?: 'Landlord' | 'Tenant' | 'CurrentTenant';
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgCardComponent,
    NgButton,
    NgLabelComponent,
    NgFileUploadComponent,
    NgIconComponent,
    NgSelectComponent,
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
})
export class DocumentsComponent implements OnInit {
  // Data
  tenant: ITenant | null = null;
  documents: DocumentItem[] = [];
  landlordDocuments: DocumentItem[] = [];
  currentTenantDocuments: DocumentItem[] = [];
  otherTenantDocuments: DocumentItem[] = [];
  selectedFiles: UploadedFile[] = [];
  selectedCategory: DocumentCategory | null = null;

  // UI State
  loading = true;
  uploading = false;
  downloadingAgreement = false;

  // User info
  userDetail: Partial<IUserDetail> = {};

  // Document categories (excluding PropertyImages)
  documentCategories: SelectOption[] = [
    { value: DocumentCategory.Aadhaar, label: 'Aadhaar Card' },
    { value: DocumentCategory.PAN, label: 'PAN Card' },
    { value: DocumentCategory.AddressProof, label: 'Address Proof' },
    { value: DocumentCategory.EmploymentProof, label: 'Employment Proof' },
    { value: DocumentCategory.BankProof, label: 'Bank Statement' },
    { value: DocumentCategory.ProfilePhoto, label: 'Profile Photo' },
    { value: DocumentCategory.IdProof, label: 'ID Proof' },
    { value: DocumentCategory.RentalAgreement, label: 'Rental Agreement' },
    { value: DocumentCategory.Other, label: 'Other Documents' },
  ];

  // File upload config
  fileUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    acceptedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowMultiple: true,
  };

  // Services
  private router = inject(Router);
  private http = inject(HttpClient);
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);
  private documentService = inject(PropertyService);
  private alertService = inject(AlertService);
  private dialogService = inject(NgDialogService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
  }

  ngOnInit() {
    this.loadTenantData();
  }

  onCategoryChange(category: DocumentCategory) {
    this.selectedCategory = category;
    this.selectedFiles = []; // Clear files when category changes
  }

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    const file = event.file;
    this.selectedFiles = this.selectedFiles.filter((f) => f.url !== file.url);
  }

  getCategoryLabel(category: any): string {
    if (!category) return 'Unknown';
    const cat = this.documentCategories.find((c) => c.value === category);
    return cat?.label || 'Unknown';
  }

  getFilteredDocuments(): DocumentItem[] {
    if (!this.selectedCategory) return this.documents;
    return this.documents.filter(
      (doc) => doc.category === this.selectedCategory,
    );
  }

  uploadDocuments() {
    if (
      this.selectedFiles.length === 0 ||
      !this.tenant?.id ||
      !this.selectedCategory
    ) {
      this.alertService.error({
        errors: [
          {
            message: 'Please select files and category before uploading',
            errorType: 'error',
          },
        ],
      });
      return;
    }

    this.uploading = true;

    const documents = this.selectedFiles.map((file) => ({
      file: file.file,
      category: this.selectedCategory!.toString(),
      description: `${this.getCategoryLabel(this.selectedCategory!)} - uploaded by tenant`,
      ownerId: this.tenant?.id || 0,
      ownerType: 'Tenant',
      tenantId: this.tenant?.id,
      propertyId: this.tenant?.propertyId,
      landlordId: this.tenant?.landlordId,
      name: file.file.name,
      size: file.file.size,
      type: file.file.type,
    }));

    this.tenantService
      .uploadTenantDocuments(this.tenant.id, documents)
      .subscribe({
        next: (result) => {
          if (result.status === ResultStatusType.Success && result.entity) {
            // Add newly uploaded documents
            const newDocs = result.entity.map((doc) =>
              this.mapDocumentItem(doc),
            );
            this.currentTenantDocuments = [
              ...this.currentTenantDocuments,
              ...newDocs,
            ];
            this.documents = [...this.documents, ...newDocs];

            this.selectedFiles = [];
            this.selectedCategory = null;
            this.alertService.success({
              errors: [
                {
                  message: 'Documents uploaded successfully',
                  errorType: 'success',
                },
              ],
            });
          } else {
            this.alertService.error({
              errors: [
                {
                  message: 'Failed to upload documents',
                  errorType: 'error',
                },
              ],
            });
          }
          this.uploading = false;
        },
        error: (error) => {
          this.alertService.error({
            errors: [
              {
                message: 'Error uploading documents. Please try again.',
                errorType: 'error',
              },
            ],
          });
          this.uploading = false;
        },
      });
  }

  downloadAgreement() {
    if (!this.tenant?.agreementUrl) {
      this.alertService.error({
        errors: [
          {
            message: 'Agreement URL not available',
            errorType: 'error',
          },
        ],
      });
      return;
    }

    this.downloadingAgreement = true;

    // Download agreement as blob
    this.http
      .get(this.tenant.agreementUrl, { responseType: 'blob' })
      .subscribe({
        next: (blob: Blob) => {
          if (!blob || blob.size === 0) {
            this.alertService.error({
              errors: [
                {
                  message: 'Downloaded agreement is empty',
                  errorType: 'error',
                },
              ],
            });
            this.downloadingAgreement = false;
            return;
          }

          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `Tenancy_Agreement_${this.tenant?.name || 'Tenant'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          this.downloadingAgreement = false;
          this.alertService.success({
            errors: [
              {
                message: 'Agreement downloaded successfully',
                errorType: 'success',
              },
            ],
          });
        },
        error: (error) => {
          this.alertService.error({
            errors: [
              {
                message: 'Failed to download agreement. Please try again.',
                errorType: 'error',
              },
            ],
          });
          this.downloadingAgreement = false;
        },
      });
  }

  viewAgreement() {
    if (this.tenant?.agreementUrl) {
      window.open(this.tenant.agreementUrl, '_blank');
    }
  }

  downloadDocument(doc: DocumentItem) {
    if (!doc.id) {
      this.alertService.error({
        errors: [
          {
            message: 'Document ID not available',
            errorType: 'error',
          },
        ],
      });
      return;
    }

    // Use API endpoint to download document as blob
    const url = `${environment.apiBaseUrl}Property/image/${doc.id}/download`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          this.alertService.error({
            errors: [
              {
                message: 'Downloaded file is empty',
                errorType: 'error',
              },
            ],
          });
          return;
        }

        // Create blob URL and trigger download
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        this.alertService.success({
          errors: [
            {
              message: `Document "${doc.name}" downloaded successfully`,
              errorType: 'success',
            },
          ],
        });
      },
      error: (error) => {
        this.alertService.error({
          errors: [
            {
              message: `Failed to download "${doc.name}". Please try again.`,
              errorType: 'error',
            },
          ],
        });
      },
    });
  }

  viewDocument(doc: DocumentItem) {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  }

  deleteDocument(doc: DocumentItem) {
    if (!doc.id || !this.tenant?.id) {
      this.alertService.error({
        errors: [
          {
            message: 'Unable to delete document. Missing required information.',
            errorType: 'error',
          },
        ],
      });
      return;
    }

    // Show confirmation modal
    this.dialogService
      .confirm({
        title: 'Delete Document',
        message: `Are you sure you want to delete "${doc.name}"?\n\nThis action cannot be undone.`,
        icon: 'delete',
        type: 'warning',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        width: '450px',
        panelClass: ['delete-confirmation-modal', 'document-delete-modal'],
      })
      .subscribe((result) => {
        if (result.action === 'confirm') {
          // Call backend to delete document
          this.tenantService.deleteTenantDocument(doc.id!).subscribe({
            next: (result) => {
              if (result.status === ResultStatusType.Success) {
                // Remove from local arrays
                this.documents = this.documents.filter((d) => d.id !== doc.id);
                this.currentTenantDocuments =
                  this.currentTenantDocuments.filter((d) => d.id !== doc.id);
                this.alertService.success({
                  errors: [
                    {
                      message: 'Document deleted successfully',
                      errorType: 'success',
                    },
                  ],
                });
              } else {
                this.alertService.error({
                  errors: [
                    {
                      message: 'Failed to delete document. Please try again.',
                      errorType: 'error',
                    },
                  ],
                });
              }
            },
            error: (error) => {
              this.alertService.error({
                errors: [
                  {
                    message: 'Error deleting document. Please try again.',
                    errorType: 'error',
                  },
                ],
              });
            },
          });
        }
      });
  }

  getDocumentIcon(type: string): string {
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('word') || type.includes('document'))
      return 'description';
    if (type.includes('excel') || type.includes('spreadsheet'))
      return 'table_chart';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  goBack() {
    this.router.navigate(['/tenant']);
  }

  private loadTenantData() {
    this.loading = true;

    const userEmail = this.userDetail.email;
    if (!userEmail) {
      this.alertService.error({
        errors: [
          {
            message: 'User email not found. Please log in again.',
            errorType: 'error',
          },
        ],
      });
      this.loading = false;
      return;
    }

    this.tenantService
      .getTenantByEmail(userEmail)
      .pipe(
        switchMap((tenantResult) => {
          if (
            tenantResult?.status === ResultStatusType.Success &&
            tenantResult.entity
          ) {
            this.tenant = tenantResult.entity;
            return this.loadDocuments();
          }
          return of(null);
        }),
      )
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error({
            errors: [
              {
                message: 'Error loading tenant data. Please refresh the page.',
                errorType: 'error',
              },
            ],
          });
          this.loading = false;
        },
      });
  }

  private loadDocuments() {
    if (!this.tenant?.id || !this.tenant?.propertyId) {
      return of(null);
    }

    return this.documentService
      .getPropertyDocuments(this.tenant.propertyId)
      .pipe(
        switchMap((result) => {
          if (result?.success && result.entity) {
            const allDocs = result.entity
              ?.documents!.filter(
                (doc: IDocument) =>
                  doc.category !== DocumentCategory.PropertyImages,
              )
              .map((doc: IDocument) => this.mapDocumentItem(doc));

            // Categorize documents
            this.landlordDocuments = allDocs.filter(
              (doc) => doc.ownerType === 'Landlord',
            );
            this.currentTenantDocuments = allDocs.filter(
              (doc) =>
                doc.ownerType === 'Tenant' && doc.ownerId === this.tenant?.id,
            );
            this.otherTenantDocuments = allDocs.filter(
              (doc) =>
                doc.ownerType === 'Tenant' && doc.ownerId !== this.tenant?.id,
            );

            this.documents = allDocs;
          }
          return of(null);
        }),
      );
  }

  private mapDocumentItem(doc: IDocument): DocumentItem {
    return {
      ...doc,
      uploadedByType:
        doc.ownerType === 'Landlord'
          ? 'Landlord'
          : doc.ownerId === this.tenant?.id
            ? 'CurrentTenant'
            : 'Tenant',
      uploadedByName:
        doc.ownerType === 'Landlord'
          ? 'Landlord'
          : doc.ownerId === this.tenant?.id
            ? 'You'
            : 'Co-tenant',
    };
  }
}
