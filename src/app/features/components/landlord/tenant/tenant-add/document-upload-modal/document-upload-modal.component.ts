import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  FileUploadConfig,
  NgButton,
  NgFileUploadComponent,
  NgIconComponent,
  NgSelectComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../../../projects/shared/src/public-api';
import { DocumentCategory } from '../../../../../enums/view.enum';

export interface DocumentUploadModalData {
  availableCategories: SelectOption[];
  tenantName: string;
  tenantIndex: number;
}

export interface DocumentUploadResult {
  category: DocumentCategory;
  files: UploadedFile[];
}

@Component({
  selector: 'app-document-upload-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectComponent,
    NgFileUploadComponent,
    NgButton,
    NgIconComponent,
  ],
  template: `
    <div class="document-upload-modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <ng-icon name="upload_file" class="header-icon" />
          <div>
            <h2>Upload Documents</h2>
            <p>Add documents for {{ data.tenantName || 'Tenant' }}</p>
          </div>
        </div>
        <button
          type="button"
          class="close-btn"
          title="Close"
          (click)="onCancel()"
        >
          <ng-icon name="close" />
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <!-- Category Selection -->
          <div class="form-section">
            <ng-select
              formControlName="category"
              label="Document Category"
              placeholder="Select document category"
              suffixIcon="category"
              [options]="data.availableCategories"
              [required]="true"
            />

            @if (isCategorySelected()) {
              <div class="category-info">
                <div class="info-card">
                  <ng-icon
                    class="category-icon"
                    [name]="getCategoryIcon(selectedCategory!)"
                  />
                  <div class="info-text">
                    <h4>{{ getCategoryLabel(selectedCategory!) }}</h4>
                    <p>{{ getCategoryHint(selectedCategory!) }}</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- File Upload -->
          @if (isCategorySelected()) {
            <div class="form-section">
              <ng-file-upload
                formControlName="files"
                [label]="'Upload ' + getCategoryLabel(selectedCategory!)"
                [dragText]="
                  'Drop ' +
                  getCategoryLabel(selectedCategory!) +
                  ' files here or click to browse'
                "
                [hint]="getCategoryHint(selectedCategory!)"
                [config]="uploadConfig"
                (filesSelected)="onFilesSelected($event)"
                (fileRemoved)="onFileRemoved($event)"
              />
            </div>
          }

          <!-- Preview Section -->
          @if (uploadedFiles.length > 0) {
            <div class="form-section">
              <h4>Preview Files ({{ uploadedFiles.length }})</h4>
              <div class="file-preview-grid">
                @for (file of uploadedFiles; track file.url) {
                  <div class="file-preview-card">
                    <div class="file-preview">
                      @if (isImageFile(file.type)) {
                        <img
                          class="preview-image"
                          [src]="file.url"
                          [alt]="file.name"
                        />
                      } @else {
                        <div class="file-icon-preview">
                          <ng-icon
                            class="large-file-icon"
                            [name]="getFileIcon(file.type)"
                          />
                        </div>
                      }
                    </div>
                    <div class="file-info">
                      <span class="file-name" [title]="file.name">{{
                        file.name
                      }}</span>
                      <span class="file-size">{{
                        formatFileSize(file.size)
                      }}</span>
                    </div>
                    <button
                      type="button"
                      class="remove-preview-btn"
                      title="Remove file"
                      (click)="removeFile(file)"
                    >
                      <ng-icon name="close" />
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </form>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <ng-button
          buttonType="button"
          type="text"
          label="Cancel"
          (buttonClick)="onCancel()"
        />
        <ng-button
          buttonType="button"
          type="filled"
          label="Add Documents"
          [disabled]="!canSubmit()"
          (buttonClick)="onSubmit()"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .document-upload-modal {
        width: 600px;
        max-width: 90vw;
        height: auto;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px 24px 0 24px;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 24px;

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;

          .header-icon {
            font-size: 32px;
            color: #2196f3;
          }

          h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }

          p {
            margin: 4px 0 0 0;
            font-size: 14px;
            color: #666;
          }
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #f5f5f5;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #e0e0e0;
          }

          ng-icon {
            font-size: 18px;
            color: #666;
          }
        }
      }

      .modal-content {
        flex: 1;
        padding: 0 24px;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;

        .form-section {
          margin-bottom: 24px;
          flex-shrink: 0;

          .category-info {
            margin-top: 16px;
            flex-shrink: 0;

            .info-card {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              background: #f8f9ff;
              border: 1px solid #e3f2fd;
              border-radius: 8px;

              .category-icon {
                font-size: 24px;
                color: #2196f3;
              }

              .info-text {
                h4 {
                  margin: 0 0 4px 0;
                  font-size: 14px;
                  font-weight: 600;
                  color: #333;
                }

                p {
                  margin: 0;
                  font-size: 12px;
                  color: #666;
                  line-height: 1.4;
                }
              }
            }
          }
        }
      }

      .file-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
        max-height: 300px;
        overflow-y: auto;
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fafafa;
      }

      .file-preview-grid::-webkit-scrollbar {
        width: 4px;
      }

      .file-preview-grid::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
      }

      .file-preview-grid::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;
      }

      .file-preview-card {
        position: relative;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        transition: all 0.2s ease;

        &:hover {
          border-color: #2196f3;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
        }

        .file-preview {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .file-icon-preview {
            .large-file-icon {
              font-size: 32px;
              color: #666;
            }
          }
        }

        .file-info {
          padding: 8px;

          .file-name {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
          }

          .file-size {
            font-size: 11px;
            color: #666;
          }
        }

        .remove-preview-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border: none;
          background: rgba(244, 67, 54, 0.9);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;

          &:hover {
            background: #f44336;
            transform: scale(1.1);
          }

          ng-icon {
            font-size: 12px;
          }
        }
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 24px;
        border-top: 1px solid #e0e0e0;
        margin-top: 24px;
      }

      /* Custom scrollbar styling */
      .modal-content::-webkit-scrollbar {
        width: 6px;
      }

      .modal-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      .modal-content::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      .modal-content::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }

      @media (max-width: 768px) {
        .document-upload-modal {
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          border-radius: 0;
        }

        .modal-header {
          padding: 16px;
        }

        .modal-content {
          padding: 0 16px;
        }

        .modal-actions {
          padding: 16px;
        }

        .file-preview-grid {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
      }
    `,
  ],
})
export class DocumentUploadModalComponent implements OnInit {
  data = inject<DocumentUploadModalData>(MAT_DIALOG_DATA);

  uploadForm!: FormGroup;
  uploadedFiles: UploadedFile[] = [];
  selectedCategory: DocumentCategory | null = null;

  uploadConfig: FileUploadConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    allowMultiple: true,
  };
  private dialogRef = inject(MatDialogRef<DocumentUploadModalComponent>);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
  }

  onFilesSelected(files: UploadedFile[]) {
    this.uploadedFiles = files;
    this.uploadForm.get('files')?.setValue(files);
  }

  onFileRemoved(file: UploadedFile) {
    this.uploadedFiles = this.uploadedFiles.filter((f) => f.url !== file.url);
    this.uploadForm.get('files')?.setValue(this.uploadedFiles);
  }

  removeFile(file: UploadedFile) {
    this.onFileRemoved(file);
  }

  canSubmit(): boolean {
    return (
      this.uploadForm.valid &&
      this.uploadedFiles.length > 0 &&
      this.selectedCategory !== null
    );
  }

  // Helper to check if category is selected
  isCategorySelected(): boolean {
    return (
      this.selectedCategory !== null && this.selectedCategory !== undefined
    );
  }

  onSubmit() {
    if (this.canSubmit()) {
      const result: DocumentUploadResult = {
        category: this.selectedCategory!,
        files: this.uploadedFiles,
      };
      this.dialogRef.close(result);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  // Helper methods
  getCategoryLabel(category: DocumentCategory): string {
    const categories: { [key in DocumentCategory]: string } = {
      [DocumentCategory.Aadhaar]: 'Aadhaar Card',
      [DocumentCategory.PAN]: 'PAN Card',
      [DocumentCategory.AddressProof]: 'Address Proof',
      [DocumentCategory.EmploymentProof]: 'Employment Proof',
      [DocumentCategory.BankProof]: 'Bank Statement',
      [DocumentCategory.ProfilePhoto]: 'Profile Photo',
      [DocumentCategory.IdProof]: 'ID Proof',
      [DocumentCategory.RentalAgreement]: 'Previous Rental Agreement',
      [DocumentCategory.OwnershipProof]: 'Ownership Proof',
      [DocumentCategory.UtilityBill]: 'Utility Bill',
      [DocumentCategory.NoObjectionCertificate]: 'NOC',
      [DocumentCategory.PropertyImages]: 'Property Images',
      [DocumentCategory.PersonPhoto]: 'Person Photo',
    };
    return categories[category] || 'Unknown Category';
  }

  getCategoryIcon(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.Aadhaar:
      case DocumentCategory.PAN:
        return 'credit_card';
      case DocumentCategory.AddressProof:
        return 'home';
      case DocumentCategory.EmploymentProof:
        return 'work';
      case DocumentCategory.BankProof:
        return 'account_balance';
      case DocumentCategory.ProfilePhoto:
      case DocumentCategory.PersonPhoto:
        return 'person';
      case DocumentCategory.IdProof:
        return 'badge';
      case DocumentCategory.RentalAgreement:
        return 'description';
      default:
        return 'upload_file';
    }
  }

  getCategoryHint(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.Aadhaar:
        return 'Upload clear copy of Aadhaar card (front and back)';
      case DocumentCategory.PAN:
        return 'Upload PAN card copy';
      case DocumentCategory.AddressProof:
        return 'Utility bill, bank statement, or rental agreement';
      case DocumentCategory.EmploymentProof:
        return 'Salary slips, employment letter, or offer letter';
      case DocumentCategory.BankProof:
        return 'Bank statements for last 3 months';
      case DocumentCategory.ProfilePhoto:
        return 'Recent passport-size photograph';
      case DocumentCategory.IdProof:
        return 'Driving license, voter ID, or passport';
      case DocumentCategory.RentalAgreement:
        return 'Previous rental agreements if applicable';
      default:
        return 'Upload relevant documents';
    }
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('doc')) return 'description';
    return 'attach_file';
  }

  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private initializeForm() {
    this.uploadForm = this.fb.group({
      category: ['', Validators.required],
      files: [[]],
    });

    // Watch for category changes
    this.uploadForm.get('category')?.valueChanges.subscribe((value) => {
      // Handle both string and number values from select component
      if (value !== null && value !== undefined && value !== '') {
        this.selectedCategory =
          typeof value === 'string' ? parseInt(value, 10) : value;
      } else {
        this.selectedCategory = null;
      }
      this.uploadedFiles = [];
      this.uploadForm.get('files')?.setValue([]);
    });
  }
}
