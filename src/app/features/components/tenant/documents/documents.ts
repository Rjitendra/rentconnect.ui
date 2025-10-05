import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';

import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgIconComponent,
  NgLabelComponent,
  NgSelectComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
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
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);
  private documentService = inject(PropertyService);

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
      console.error('Missing required data for upload');
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
            console.log('Documents uploaded successfully');
          } else {
            console.error('Failed to upload documents');
          }
          this.uploading = false;
        },
        error: (error) => {
          console.error('Error uploading documents:', error);
          this.uploading = false;
        },
      });
  }

  async downloadAgreement() {
    if (!this.tenant?.agreementUrl) return;

    this.downloadingAgreement = true;

    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = this.tenant.agreementUrl;
      link.download = `Tenancy_Agreement_${this.tenant.name}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading agreement:', error);
    } finally {
      this.downloadingAgreement = false;
    }
  }

  viewAgreement() {
    if (this.tenant?.agreementUrl) {
      window.open(this.tenant.agreementUrl, '_blank');
    }
  }

  downloadDocument(doc: DocumentItem) {
    const link = document.createElement('a');
    link.href = doc.url || '';
    link.download = doc.name || 'document';
    link.click();
  }

  viewDocument(doc: DocumentItem) {
    window.open(doc.url || '', '_blank');
  }

  deleteDocument(doc: DocumentItem) {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      const index = this.documents.findIndex((d) => d.id === doc.id);
      if (index > -1) {
        this.documents.splice(index, 1);
      }
    }
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
      console.error('User email not found');
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
          console.error('Error loading tenant data:', error);
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
              .filter(
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
