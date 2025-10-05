import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgLabelComponent,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { IDocument } from '../../../models/document';
import { ITenant } from '../../../models/tenant';
import { PropertyService } from '../../../service/document.service';
import { TenantService } from '../../../service/tenant.service';

interface DocumentItem {
  id?: number;
  name: string;
  type: string;
  size: number;
  url: string;
  category: string;
  uploadedOn: Date | string;
  isVerified?: boolean;
  description?: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    NgCardComponent,
    NgButton,
    NgLabelComponent,
    NgFileUploadComponent,
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
})
export class DocumentsComponent implements OnInit {
  // Data
  tenant: ITenant | null = null;
  documents: DocumentItem[] = [];
  selectedFiles: UploadedFile[] = [];

  // UI State
  loading = true;
  uploading = false;
  downloadingAgreement = false;

  // User info
  userDetail: Partial<IUserDetail> = {};

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

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    const file = event.file;
    this.selectedFiles = this.selectedFiles.filter((f) => f.url !== file.url);
  }

  async uploadDocuments() {
    if (this.selectedFiles.length === 0 || !this.tenant) return;

    this.uploading = true;

    try {
      // Here you would upload to your backend
      // For now, simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add uploaded files to documents list
      this.selectedFiles.forEach((file) => {
        this.documents.push({
          id: Date.now() + Math.random(),
          name: file.file.name,
          type: file.file.type,
          size: file.file.size,
          url: file.url || '',
          category: 'Other',
          uploadedOn: new Date(),
          isVerified: false,
          description: 'Document uploaded by tenant',
        });
      });

      this.selectedFiles = [];
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      this.uploading = false;
    }
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
    link.href = doc.url;
    link.download = doc.name;
    link.click();
  }

  viewDocument(doc: DocumentItem) {
    window.open(doc.url, '_blank');
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

  private async loadTenantData() {
    try {
      this.loading = true;

      // Get current tenant
      const userEmail = this.userDetail.email;
      if (!userEmail) {
        console.error('User email not found');
        return;
      }

      const tenantResult = await this.tenantService
        .getTenantByEmail(userEmail)
        .toPromise();
      if (
        tenantResult?.status === ResultStatusType.Success &&
        tenantResult.entity
      ) {
        this.tenant = tenantResult.entity;
        await this.loadDocuments();
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadDocuments() {
    if (!this.tenant?.id) return;

    try {
      // Load tenant documents from backend
      const result = await this.documentService
        .getPropertyDocuments(this.tenant.propertyId)
        .toPromise();

      if (result?.success && result.entity) {
        this.documents = result.entity.map((doc: IDocument) => ({
          id: doc.id,
          name: doc.name || 'Untitled',
          type: doc.type || 'application/octet-stream',
          size: doc.size || 0,
          url: doc.url || '',
          category: doc.category?.toString() || 'Other',
          uploadedOn: doc.uploadedOn || new Date(),
          isVerified: doc.isVerified || false,
          description: doc.description,
        }));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      this.documents = [];
    }
  }
}
