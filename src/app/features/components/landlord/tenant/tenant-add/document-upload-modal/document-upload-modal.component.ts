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
  templateUrl: './document-upload-modal.component.html',
  styleUrl: './document-upload-modal.component.scss',
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

  onFileRemoved(file: { file: UploadedFile; index: number }) {
    // Option 1: remove by index (fast & safe)
    this.uploadedFiles.splice(file.index, 1);
    // Update the form control
    this.uploadForm.get('files')?.setValue(this.uploadedFiles);
  }

  removeFile(file: UploadedFile, index: number): void {
    const removed = {
      file,
      index,
    };

    this.onFileRemoved(removed);
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
      [DocumentCategory.PropertyCondition]: 'Property Condition',
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
