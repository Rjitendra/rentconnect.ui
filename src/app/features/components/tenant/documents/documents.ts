import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgIconComponent,
  NgLabelComponent,
  UploadedFile,
} from 'shared';

import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { ITenant } from '../../../models/tenant';
import { DocumentService } from '../../../service/document.service';
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
    NgIconComponent,
    NgLabelComponent,
    NgFileUploadComponent,
  ],
  template: `
    <div class="documents">
      <div class="page-header">
        <ng-button
          [type]="'text'"
          [label]="'Back to Portal'"
          [icon]="'arrow_back'"
          [buttonType]="'button'"
          [cssClass]="'back-btn'"
          (buttonClick)="goBack()"
        />
        <h1>Documents & Agreement</h1>
      </div>

      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      }

      @if (!loading) {
        <!-- Tenancy Agreement Section -->
        <ng-card class="agreement-card">
          <div class="card-header">
            <i class="material-icons">description</i>
            <h2>Tenancy Agreement</h2>
          </div>

          @if (tenant?.agreementUrl) {
            <div class="agreement-section">
              <div class="agreement-info">
                <div class="agreement-details">
                  <h3>Your Rental Agreement</h3>
                  <div class="agreement-meta">
                    <div class="meta-item">
                      <ng-label
                        [label]="'Agreement Date:'"
                        [toolTip]="'Date when the agreement was created'"
                      />
                      <span>{{
                        (tenant.agreementDate | date: 'MMM dd, yyyy') || 'N/A'
                      }}</span>
                    </div>
                    <div class="meta-item">
                      <ng-label
                        [label]="'Status:'"
                        [toolTip]="'Current agreement status'"
                      />
                      <span
                        class="status"
                        [class.accepted]="tenant.agreementAccepted"
                      >
                        {{ tenant.agreementAccepted ? 'Accepted' : 'Pending' }}
                      </span>
                    </div>
                    @if (tenant.agreementAccepted) {
                      <div class="meta-item">
                        <ng-label
                          [label]="'Accepted On:'"
                          [toolTip]="'Date when the agreement was accepted'"
                        />
                        <span>{{
                          (tenant.agreementAcceptedDate
                            | date: 'MMM dd, yyyy') || 'N/A'
                        }}</span>
                      </div>
                      <div class="meta-item">
                        <ng-label
                          [label]="'Accepted By:'"
                          [toolTip]="'Person who accepted the agreement'"
                        />
                        <span>{{ tenant.agreementAcceptedBy || 'N/A' }}</span>
                      </div>
                    }
                  </div>
                </div>
                <div class="agreement-actions">
                  <ng-button
                    variant="primary"
                    size="medium"
                    [disabled]="downloadingAgreement"
                    [loading]="downloadingAgreement"
                    (click)="downloadAgreement()"
                  >
                    <i class="material-icons">download</i>
                    {{
                      downloadingAgreement
                        ? 'Downloading...'
                        : 'Download Agreement'
                    }}
                  </ng-button>
                  <ng-button
                    variant="secondary"
                    size="medium"
                    (click)="viewAgreement()"
                  >
                    <i class="material-icons">visibility</i>
                    View Online
                  </ng-button>
                </div>
              </div>
            </div>
          } @else {
            <div class="empty-state">
              <i class="material-icons">description</i>
              <p>Agreement not yet available</p>
              <p class="sub-text">
                Your landlord will provide the agreement document once ready
              </p>
            </div>
          }
        </ng-card>

        <!-- Document Upload Section -->
        <ng-card class="upload-card">
          <div class="card-header">
            <i class="material-icons">cloud_upload</i>
            <h2>Upload Documents</h2>
          </div>

          <div class="upload-section">
            <div class="upload-info">
              <p>Upload important documents related to your tenancy such as:</p>
              <ul>
                <li>Identity documents (Aadhaar, PAN, Driving License)</li>
                <li>Income proof documents</li>
                <li>Previous rental agreements</li>
                <li>Bank statements</li>
                <li>Other relevant documents</li>
              </ul>
            </div>

            <div class="upload-area">
              <ng-file-upload
                [config]="fileUploadConfig"
                (filesSelected)="onFilesSelected($event)"
                (fileRemoved)="onFileRemoved($event)"
              />

              @if (selectedFiles.length > 0) {
                <div class="upload-actions">
                  <ng-button
                    variant="primary"
                    [disabled]="uploading"
                    [loading]="uploading"
                    (click)="uploadDocuments()"
                  >
                    {{ uploading ? 'Uploading...' : 'Upload Documents' }}
                  </ng-button>
                </div>
              }
            </div>
          </div>
        </ng-card>

        <!-- Uploaded Documents Section -->
        <ng-card class="documents-list-card">
          <div class="card-header">
            <i class="material-icons">folder</i>
            <h2>Your Documents</h2>
          </div>

          @if (documents.length > 0) {
            <div class="documents-list">
              @for (document of documents; track document.id || document.url) {
                <div class="document-item">
                  <div class="document-icon">
                    <i class="material-icons">{{
                      getDocumentIcon(document.type)
                    }}</i>
                  </div>

                  <div class="document-info">
                    <h4>{{ document.name }}</h4>
                    <div class="document-meta">
                      <span class="category">{{ document.category }}</span>
                      <span class="size">{{
                        formatFileSize(document.size)
                      }}</span>
                      <span class="date">{{
                        document.uploadedOn | date: 'MMM dd, yyyy'
                      }}</span>
                    </div>
                    @if (document.description) {
                      <p class="description">{{ document.description }}</p>
                    }
                  </div>

                  <div class="document-status">
                    @if (document.isVerified) {
                      <div class="status-badge verified">
                        <i class="material-icons">verified</i>
                        Verified
                      </div>
                    } @else {
                      <div class="status-badge pending">
                        <i class="material-icons">hourglass_empty</i>
                        Pending
                      </div>
                    }
                  </div>

                  <div class="document-actions">
                    <ng-button
                      [type]="'icon'"
                      [icon]="'download'"
                      [buttonType]="'button'"
                      [tooltip]="'Download'"
                      [cssClass]="'action-btn'"
                      (buttonClick)="downloadDocument(document)"
                    />
                    <ng-button
                      [type]="'icon'"
                      [icon]="'visibility'"
                      [buttonType]="'button'"
                      [tooltip]="'View'"
                      [cssClass]="'action-btn'"
                      (buttonClick)="viewDocument(document)"
                    />
                    <ng-button
                      [type]="'icon'"
                      [icon]="'delete'"
                      [buttonType]="'button'"
                      [tooltip]="'Delete'"
                      [cssClass]="'action-btn delete'"
                      (buttonClick)="deleteDocument(document)"
                    />
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <i class="material-icons">folder_open</i>
              <p>No documents uploaded yet</p>
              <p class="sub-text">
                Upload your documents to keep them organized and accessible
              </p>
            </div>
          }
        </ng-card>
      }
    </div>
  `,
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
  private documentService = inject(DocumentService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
  }

  ngOnInit() {
    this.loadTenantData();
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
        .getDocumentsByOwner(this.tenant.id, 'Tenant')
        .toPromise();

      if (result?.success && result.entity) {
        this.documents = result.entity.map((doc: any) => ({
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

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    this.selectedFiles = this.selectedFiles.filter(
      (f) => f.url !== event.file.url,
    );
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
}
