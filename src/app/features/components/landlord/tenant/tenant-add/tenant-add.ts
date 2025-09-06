import {
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

// Shared library imports
import {
  AlertService,
  FileUploadConfig,
  InputType,
  NgCardComponent,
  NgDatepickerComponent,
  NgDialogService,
  NgIconComponent,
  NgInputComponent,
  NgSelectComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../../projects/shared/src/public-api';
import { Result } from '../../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../../oauth/service/oauth.service';
import { OwnerType } from '../../../../constants/owner-type.constants';
import { DocumentCategory, PropertyStatus } from '../../../../enums/view.enum';
import { IDocument } from '../../../../models/document';
import { IProperty } from '../../../../models/property';
import {
  ITenant,
  ITenantSaveResponse,
  ITenantValidationError,
} from '../../../../models/tenant';
import { PropertyService } from '../../../../service/property.service';
import { TenantService } from '../../../../service/tenant.service';

import {
  DocumentUploadModalComponent,
  DocumentUploadResult,
} from './document-upload-modal/document-upload-modal.component';

@Component({
  selector: 'app-tenant-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgCardComponent,
    NgInputComponent,
    NgSelectComponent,
    NgDatepickerComponent,
    NgIconComponent,
  ],
  templateUrl: './tenant-add.html',
  styleUrl: './tenant-add.scss',
})
export class TenantAddComponent implements OnInit {
  readonly tenantAdded = output<void>();
  readonly cancelled = output<void>();
  readonly backToList = output<void>();
  // Input properties for edit/detail modes
  readonly initialMode = input<'add' | 'edit' | 'detail'>('add');
  readonly tenantsToEdit = input<ITenant[]>([]);
  readonly singleTenantToEdit = input<ITenant | null>(null);

  // Form
  tenantForm!: FormGroup;
  isSaving = false;

  // Mode and data for edit/detail
  mode: 'add' | 'edit' | 'detail' = 'add';
  editingTenants: ITenant[] = [];
  editableTenantId: number | null = null; // For single tenant edit from expanded row
  isEditingFromExpandedRow = false;

  // Property options for dropdown
  propertyOptions: SelectOption[] = [];
  isLoadingProperties = false;

  // Enums for template
  InputType = InputType;

  // Validation errors
  validationErrors: ITenantValidationError[] = [];
  isShowingValidationErrors = false;
  userdetail: Partial<IUserDetail> = {};

  // Document upload configuration
  documentUploadConfig: FileUploadConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    allowMultiple: true,
  };

  // Document categories for tenants
  documentCategories: SelectOption[] = [
    { value: DocumentCategory.Aadhaar, label: 'Aadhaar Card' },
    { value: DocumentCategory.PAN, label: 'PAN Card' },
    { value: DocumentCategory.AddressProof, label: 'Address Proof' },
    { value: DocumentCategory.EmploymentProof, label: 'Employment Proof' },
    { value: DocumentCategory.BankProof, label: 'Bank Statement' },
    { value: DocumentCategory.ProfilePhoto, label: 'Profile Photo' },
    { value: DocumentCategory.IdProof, label: 'ID Proof' },
    {
      value: DocumentCategory.RentalAgreement,
      label: 'Previous Rental Agreement',
    },
  ];
  // Categorized documents for each tenant
  tenantDocuments: Map<number, Map<DocumentCategory, UploadedFile[]>> =
    new Map();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private tenantService = inject(TenantService);
  private propertyService = inject(PropertyService);
  private userService = inject(OauthService);

  private dialogService = inject(NgDialogService);
  private cdr = inject(ChangeDetectorRef);
  constructor() {
    this.userdetail = this.userService.getUserInfo();
  }
  // Form Array Helper Methods
  get tenantsFormArray(): FormArray {
    return this.tenantForm.get('tenants') as FormArray;
  }

  ngOnInit() {
    // Set mode based on input
    this.mode = this.initialMode();

    // Handle edit modes
    if (this.mode === 'edit' || this.mode === 'detail') {
      const singleTenant = this.singleTenantToEdit();
      const multipleTenants = this.tenantsToEdit();

      if (singleTenant) {
        // Single tenant edit from expanded row
        this.editingTenants = [singleTenant];
        this.editableTenantId = singleTenant.id!;
        this.isEditingFromExpandedRow = true;
      } else if (multipleTenants.length > 0) {
        // Multiple tenants edit from table row
        this.editingTenants = multipleTenants;
        this.isEditingFromExpandedRow = false;
      }
    }

    this.initializeForm();
    this.loadProperties();

    // Initialize document storage
    if (this.mode === 'add') {
      this.tenantDocuments.set(0, new Map());
    } else {
      // Initialize document storage for editing tenants
      this.editingTenants.forEach((tenant, index) => {
        this.tenantDocuments.set(index, new Map());
        // Load existing documents into the map
        this.loadExistingDocuments(tenant, index);
      });
    }
  }

  // Get available categories for dropdown (excluding already used ones)
  getAvailableCategories(tenantIndex: number): SelectOption[] {
    const usedCategories = Array.from(
      this.tenantDocuments.get(tenantIndex)?.keys() || [],
    );
    return this.documentCategories.filter(
      (cat) => !usedCategories.includes(cat.value as DocumentCategory),
    );
  }

  // Open document upload modal
  openDocumentUploadModal(tenantIndex: number) {
    const tenantName = this.getTenantFormGroup(tenantIndex).get('name')?.value;
    const availableCategories = this.getAvailableCategories(tenantIndex);

    if (availableCategories.length === 0) {
      this.alertService.error({
        errors: [
          {
            message:
              'All document categories have been uploaded for this tenant.',
            errorType: 'error',
          },
        ],
        timeout: 3000,
      });
      return;
    }

    const dialogRef = this.dialogService.open(DocumentUploadModalComponent, {
      data: {
        availableCategories,
        tenantName: tenantName || `Tenant ${tenantIndex + 1}`,
        tenantIndex,
      },
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '85vh',
      height: 'auto',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'document-modal-backdrop',
    });

    dialogRef.afterClosed().subscribe((result: DocumentUploadResult | null) => {
      if (result) {
        this.onDocumentCategoryUploaded(
          result.files,
          tenantIndex,
          result.category,
        );
        // Trigger change detection to update the UI immediately
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  // Get uploaded documents count for a tenant
  getUploadedDocumentsCount(tenantIndex: number): number {
    const tenantDocs = this.tenantDocuments.get(tenantIndex);
    if (!tenantDocs) return 0;

    let count = 0;
    tenantDocs.forEach((files) => (count += files.length));
    return count;
  }

  // Get uploaded categories for a tenant
  getUploadedCategories(tenantIndex: number): string[] {
    const tenantDocs = this.tenantDocuments.get(tenantIndex);
    if (!tenantDocs) return [];

    // Create new array to ensure change detection triggers
    return [...Array.from(tenantDocs.keys())].map((category) =>
      this.getCategoryLabel(category),
    );
  }

  // Remove all documents for a category
  removeDocumentCategory(tenantIndex: number, category: DocumentCategory) {
    if (!this.tenantDocuments.has(tenantIndex)) return;

    const tenantDocs = this.tenantDocuments.get(tenantIndex)!;
    tenantDocs.delete(category);

    // Update form control with all documents
    this.updateTenantFormDocuments(tenantIndex);

    // Trigger change detection to update the UI immediately
    this.cdr.detectChanges();
  }

  addTenant() {
    const newTenant = this.createTenantFormGroup();
    const tenantIndex = this.tenantsFormArray.length;
    this.tenantsFormArray.push(newTenant);

    // Initialize document storage for new tenant
    this.tenantDocuments.set(tenantIndex, new Map());
  }

  removeTenant(index: number) {
    if (this.tenantsFormArray.length > 1) {
      this.tenantsFormArray.removeAt(index);

      // Remove documents for this tenant
      this.tenantDocuments.delete(index);

      // Re-index remaining tenant documents
      const newMap = new Map();
      let newIndex = 0;
      this.tenantDocuments.forEach((docs, oldIndex) => {
        if (oldIndex !== index) {
          newMap.set(newIndex, docs);
          newIndex++;
        }
      });
      this.tenantDocuments = newMap;

      // Ensure at least one tenant is marked as primary
      const hasPrimary = this.tenantsFormArray.controls.some(
        (control) => control.get('isPrimary')?.value === true,
      );

      if (!hasPrimary && this.tenantsFormArray.length > 0) {
        this.tenantsFormArray.at(0).patchValue({ isPrimary: true });
      }
    }
  }

  setPrimaryTenant(index: number) {
    // Reset all tenants to not primary
    this.tenantsFormArray.controls.forEach((control) => {
      control.patchValue({ isPrimary: false });
    });

    // Set the selected tenant as primary
    this.tenantsFormArray.at(index).patchValue({ isPrimary: true });
  }

  getTenantFormGroup(index: number): FormGroup {
    return this.tenantsFormArray.at(index) as FormGroup;
  }

  // Check if a tenant is editable (for single tenant edit mode)
  isTenantEditable(tenantIndex: number): boolean {
    if (this.mode === 'detail') return false; // Detail mode - no editing
    if (this.mode === 'add') return true; // Add mode - all editable
    if (!this.isEditingFromExpandedRow) return true; // Table edit - all editable

    // Single tenant edit from expanded row - only specific tenant editable
    const tenant = this.editingTenants[tenantIndex];
    return tenant?.id === this.editableTenantId;
  }

  // Get form title based on mode
  getFormTitle(): string {
    switch (this.mode) {
      case 'add':
        return 'Add New Tenants';
      case 'edit':
        if (this.isEditingFromExpandedRow) {
          return `Edit Tenant: ${this.editingTenants[0]?.name}`;
        }
        return `Edit Tenant Group (${this.editingTenants.length} members)`;
      case 'detail':
        if (this.editingTenants.length === 1) {
          return `Tenant Details: ${this.editingTenants[0]?.name}`;
        }
        return `Tenant Group Details (${this.editingTenants.length} members)`;
      default:
        return 'Tenant Management';
    }
  }

  // Get form description based on mode
  getFormDescription(): string {
    switch (this.mode) {
      case 'add':
        return 'Add tenants to your property with all required information and documents';
      case 'edit':
        if (this.isEditingFromExpandedRow) {
          return 'Edit information for the selected tenant member';
        }
        return 'Edit information for all tenants in this group';
      case 'detail':
        return 'View detailed information for the tenant(s)';
      default:
        return '';
    }
  }

  // Public methods
  // Form submission
  onSubmit() {
    if (this.isSaving) return; // Prevent double submission

    // Clear previous validation errors
    this.validationErrors = [];

    // Validate form using service
    const formErrors = this.tenantService.validateForm(this.tenantForm);
    if (formErrors.length > 0) {
      this.validationErrors = formErrors;
      this.showValidationErrors();
      return;
    }

    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    try {
      const formData = this.tenantForm.value as {
        tenants: ITenant[];
        propertyId: number;
        rentAmount: number;
        securityDeposit: number;
        maintenanceCharges: number;
        tenancyStartDate: string;
        tenancyEndDate: string;
        rentDueDate: string;
        leaseDuration: number;
        noticePeriod: number;
      };
      const landlordId = this.userdetail?.userId
        ? Number(this.userdetail.userId)
        : 0;

      // Prepare tenant data with documents
      const tenantsWithDocuments = formData.tenants.map((tenant, index) => ({
        ...tenant,
        age: this.calculateAge(tenant.dob as string),
        documents: this.convertCategorizedDocuments(index, landlordId),
        landlordId: landlordId,
        // tenantGroup: 0, // Use timestamp as group ID
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        // Default status values
        agreementSigned: false,
        onboardingEmailSent: false,
        onboardingCompleted: false,
        isAcknowledge: false,
        isVerified: false,
        isNewTenant: true,
        isActive: true,
        needsOnboarding: true,
      }));

      // Convert to FormData for file upload support
      const apiFormData = this.tenantService.convertTenantToFormData(
        tenantsWithDocuments as ITenant[],
        {
          propertyId: formData.propertyId,
          rentAmount: formData.rentAmount,
          securityDeposit: formData.securityDeposit,
          maintenanceCharges: formData.maintenanceCharges,
          tenancyStartDate: formData.tenancyStartDate,
          tenancyEndDate: formData.tenancyEndDate,
          rentDueDate: formData.rentDueDate,
          leaseDuration: formData.leaseDuration,
          noticePeriod: formData.noticePeriod,
        },
        landlordId,
      );

      // Choose API call based on mode
      const apiCall =
        this.mode === 'edit'
          ? this.tenantService.updateTenant(apiFormData)
          : this.tenantService.saveTenant(apiFormData);

      apiCall.subscribe({
        next: (response: ITenantSaveResponse) => {
          this.isSaving = false;
          if (response.success) {
            // Clear any previous errors
            this.validationErrors = [];
            this.isShowingValidationErrors = false;

            // Show success message
            const action = this.mode === 'edit' ? 'updated' : 'saved';
            this.alertService.success({
              errors: [
                {
                  message:
                    response.message || `Tenants ${action} successfully!`,
                  errorType: 'success',
                },
              ],
              timeout: 5000,
            });

            // Emit completion event to parent
            this.tenantAdded.emit();
          } else {
            this.validationErrors =
              response.errors?.map((error) => ({
                field: 'general',
                message: error,
              })) || [];
            this.showValidationErrors();
          }
        },
        error: (error) => {
          this.isSaving = false;
          console.error(
            `Error ${this.mode === 'edit' ? 'updating' : 'saving'} tenants:`,
            error,
          );
          const action = this.mode === 'edit' ? 'updating' : 'saving';
          this.alertService.error({
            errors: [
              {
                message: `An error occurred while ${action} the tenants. Please try again.`,
                errorType: 'error',
              },
            ],
          });
        },
      });
    } catch (error) {
      this.isSaving = false;
      this.alertService.error({
        errors: [
          {
            message:
              'Failed to prepare tenant data for saving. Please check your input and try again.',
            errorType: 'error',
          },
        ],
        timeout: 5000,
      });
    }
  }

  onCancel() {
    this.tenantAdded.emit();
  }

  showValidationErrors() {
    if (this.validationErrors.length > 0) {
      this.isShowingValidationErrors = true;

      // Clear any existing alerts first
      this.alertService.clearAlert();

      // Mark all form controls as touched to show validation errors
      this.tenantForm.markAllAsTouched();

      // Create individual error messages
      const errorMessages = this.validationErrors.map((error) => ({
        message: error.message,
        errorType: 'error' as const,
      }));

      // Add header message
      const allMessages = [
        {
          message: `Please fix the following ${this.validationErrors.length} validation error(s):`,
          errorType: 'error' as const,
        },
        ...errorMessages,
      ];

      // Use a small timeout to ensure previous alerts are cleared
      this.alertService.error({
        errors: allMessages,
      });
    }
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const control = this.tenantForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const control = this.tenantForm.get(fieldName);
    if (control && control.errors && control.touched) {
      const errors = control.errors;

      if (errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }

      if (errors['email']) {
        return 'Please enter a valid email address';
      }

      if (errors['min']) {
        const minError = errors['min'] as { min: number; actual: number };
        return `Minimum value is ${minError.min}`;
      }

      if (errors['pattern']) {
        return 'Invalid format';
      }
    }
    return '';
  }

  // Document handling for individual tenants by category
  onDocumentCategoryUploaded(
    files: UploadedFile[],
    tenantIndex: number,
    category: DocumentCategory,
  ) {
    if (!this.tenantDocuments.has(tenantIndex)) {
      this.tenantDocuments.set(tenantIndex, new Map());
    }

    const tenantDocs = this.tenantDocuments.get(tenantIndex)!;
    tenantDocs.set(category, files);

    // Update form control with all documents
    this.updateTenantFormDocuments(tenantIndex);

    // Force UI update by marking form as touched
    this.tenantForm.markAsTouched();

    // Trigger change detection to update the UI immediately
    this.cdr.detectChanges();
  }

  onDocumentCategoryRemoved(
    file: UploadedFile,
    tenantIndex: number,
    category: DocumentCategory,
  ) {
    if (!this.tenantDocuments.has(tenantIndex)) return;

    const tenantDocs = this.tenantDocuments.get(tenantIndex)!;
    const categoryFiles = tenantDocs.get(category) || [];

    const updatedFiles = categoryFiles.filter((f) => f.url !== file.url);

    if (updatedFiles.length > 0) {
      tenantDocs.set(category, updatedFiles);
    } else {
      tenantDocs.delete(category);
    }

    // Update form control with all documents
    this.updateTenantFormDocuments(tenantIndex);

    // Trigger change detection to update the UI immediately
    this.cdr.detectChanges();
  }

  // Get documents for a specific category and tenant
  getDocumentsByCategory(
    tenantIndex: number,
    category: DocumentCategory,
  ): UploadedFile[] {
    const files = this.tenantDocuments.get(tenantIndex)?.get(category) || [];
    // Return new array to ensure change detection triggers
    return [...files];
  }

  // Get all documents for a tenant
  getAllTenantDocuments(tenantIndex: number): UploadedFile[] {
    const tenantDocs = this.tenantDocuments.get(tenantIndex);
    if (!tenantDocs) return [];

    const allDocs: UploadedFile[] = [];
    tenantDocs.forEach((files) => allDocs.push(...files));
    return allDocs;
  }

  // Get category label
  getCategoryLabel(category: DocumentCategory): string {
    const categoryOption = this.documentCategories.find(
      (c) => c.value === category,
    );
    return categoryOption?.label || 'Unknown Category';
  }

  // Get category icon
  getCategoryIcon(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.Aadhaar:
        return 'credit_card';
      case DocumentCategory.PAN:
        return 'credit_card';
      case DocumentCategory.AddressProof:
        return 'home';
      case DocumentCategory.EmploymentProof:
        return 'work';
      case DocumentCategory.BankProof:
        return 'account_balance';
      case DocumentCategory.ProfilePhoto:
        return 'person';
      case DocumentCategory.IdProof:
        return 'badge';
      case DocumentCategory.RentalAgreement:
        return 'description';
      default:
        return 'upload_file';
    }
  }

  // Get category hint
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

  // Check if category is required
  isCategoryRequired(category: DocumentCategory): boolean {
    const requiredCategories = [
      DocumentCategory.Aadhaar,
      DocumentCategory.PAN,
      DocumentCategory.AddressProof,
      DocumentCategory.ProfilePhoto,
    ];
    return requiredCategories.includes(category);
  }

  // Get file icon based on file type
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('doc')) return 'description';
    return 'attach_file';
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  // Private methods
  // Helper method to get user-friendly field names
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      dob: 'Date of Birth',
      occupation: 'Occupation',
      aadhaarNumber: 'Aadhaar Number',
      panNumber: 'PAN Number',
      propertyId: 'Property',
      rentAmount: 'Rent Amount',
      securityDeposit: 'Security Deposit',
      tenancyStartDate: 'Tenancy Start Date',
      rentDueDate: 'Rent Due Date',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactPhone: 'Emergency Contact Phone',
      emergencyContactRelation: 'Emergency Contact Relation',
    };
    return fieldNames[fieldName] || fieldName;
  }

  private initializeForm() {
    if (this.mode === 'add') {
      // Initialize form for adding new tenants
      this.tenantForm = this.fb.group({
        // Property & Tenancy Details (shared for all tenants)
        propertyId: ['', Validators.required],
        rentAmount: ['', [Validators.required, Validators.min(1)]],
        securityDeposit: [0],
        maintenanceCharges: [0],
        tenancyStartDate: ['', Validators.required],
        tenancyEndDate: [''],
        rentDueDate: ['', Validators.required],
        leaseDuration: [12],
        noticePeriod: [30],

        // Tenant Array
        tenants: this.fb.array([this.createTenantFormGroup()]),
      });

      // Set the first tenant as primary by default
      this.tenantsFormArray.at(0).patchValue({ isPrimary: true });
      this.patchTestTenantFormValues();
    } else {
      // Initialize form for editing existing tenants
      this.initializeEditForm();
    }
  }

  private initializeEditForm() {
    if (this.editingTenants.length === 0) return;

    const firstTenant = this.editingTenants[0];

    // Create form with existing data
    this.tenantForm = this.fb.group({
      // Property & Tenancy Details from existing tenant
      propertyId: [
        firstTenant.propertyId?.toString() || '',
        Validators.required,
      ],
      rentAmount: [
        firstTenant.rentAmount || 0,
        [Validators.required, Validators.min(1)],
      ],
      securityDeposit: [firstTenant.securityDeposit || 0],
      maintenanceCharges: [firstTenant.maintenanceCharges || 0],
      tenancyStartDate: [
        firstTenant.tenancyStartDate || '',
        Validators.required,
      ],
      tenancyEndDate: [firstTenant.tenancyEndDate || ''],
      rentDueDate: [firstTenant.rentDueDate || '', Validators.required],
      leaseDuration: [firstTenant.leaseDuration || 12],
      noticePeriod: [firstTenant.noticePeriod || 30],

      // Tenant Array with existing tenants
      tenants: this.fb.array([]),
    });

    // Add existing tenants to form array
    this.editingTenants.forEach((tenant) => {
      const tenantFormGroup = this.createTenantFormGroupFromExisting(tenant);
      this.tenantsFormArray.push(tenantFormGroup);
    });

    // Disable form controls in detail mode
    if (this.mode === 'detail') {
      this.tenantForm.disable();
    }

    // In single tenant edit mode, disable other tenants
    if (this.isEditingFromExpandedRow && this.mode === 'edit') {
      this.tenantsFormArray.controls.forEach((control, index) => {
        const tenant = this.editingTenants[index];
        if (tenant?.id !== this.editableTenantId) {
          control.disable();
        }
      });
    }
  }

  // Load existing documents for editing tenants
  private loadExistingDocuments(tenant: ITenant, tenantIndex: number): void {
    if (!tenant.documents || tenant.documents.length === 0) return;

    const tenantDocs = new Map<DocumentCategory, UploadedFile[]>();

    // Group documents by category
    tenant.documents.forEach((doc) => {
      if (!tenantDocs.has(doc.category)) {
        tenantDocs.set(doc.category, []);
      }

      // Convert IDocument to UploadedFile format for the form
      const uploadedFile: UploadedFile = {
        name: doc.name || 'Unknown Document',
        size: doc.size || 0,
        type: doc.type || 'application/octet-stream',
        url: doc.url || '',
        file: new File([], doc.name || 'document', {
          type: doc.type || 'application/octet-stream',
        }),
      };

      tenantDocs.get(doc.category)!.push(uploadedFile);
    });

    this.tenantDocuments.set(tenantIndex, tenantDocs);
  }

  private createTenantFormGroupFromExisting(tenant: ITenant): FormGroup {
    return this.fb.group({
      // Include ID for updates
      id: [tenant.id],

      // Personal Information
      name: [tenant.name || '', [Validators.required, Validators.minLength(2)]],
      email: [tenant.email || '', [Validators.required, Validators.email]],
      phoneNumber: [tenant.phoneNumber || '', [Validators.required]],
      alternatePhoneNumber: [tenant.alternatePhoneNumber || ''],
      dob: [tenant.dob || '', Validators.required],
      occupation: [tenant.occupation || '', Validators.required],
      gender: [tenant.gender || ''],
      maritalStatus: [tenant.maritalStatus || ''],

      // Address Information
      currentAddress: [tenant.currentAddress || ''],
      permanentAddress: [tenant.permanentAddress || ''],

      // Emergency Contact
      emergencyContactName: [tenant.emergencyContactName || ''],
      emergencyContactPhone: [tenant.emergencyContactPhone || ''],
      emergencyContactRelation: [tenant.emergencyContactRelation || ''],

      // Government IDs
      aadhaarNumber: [tenant.aadhaarNumber || '', [Validators.required]],
      panNumber: [tenant.panNumber || '', [Validators.required]],
      drivingLicenseNumber: [tenant.drivingLicenseNumber || ''],
      voterIdNumber: [tenant.voterIdNumber || ''],

      // Employment Details
      employerName: [tenant.employerName || ''],
      employerAddress: [tenant.employerAddress || ''],
      employerPhone: [tenant.employerPhone || ''],
      monthlyIncome: [tenant.monthlyIncome || 0],
      workExperience: [tenant.workExperience || 0],

      // Flags
      isPrimary: [tenant.isPrimary || false],
      isNewTenant: [tenant.isNewTenant || false],
      isActive: [tenant.isActive !== undefined ? tenant.isActive : true],
      needsOnboarding: [
        tenant.needsOnboarding !== undefined ? tenant.needsOnboarding : true,
      ],

      // Documents
      documents: [tenant.documents || []],
    });
  }

  private createTenantFormGroup(): FormGroup {
    return this.fb.group({
      // Personal Information
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      alternatePhoneNumber: [''],
      dob: ['', Validators.required],
      occupation: ['', Validators.required],
      gender: [''],
      maritalStatus: [''],

      // Address Information
      currentAddress: [''],
      permanentAddress: [''],

      // Emergency Contact
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      emergencyContactRelation: [''],

      // Government IDs
      aadhaarNumber: ['', [Validators.required]],
      panNumber: ['', [Validators.required]],
      drivingLicenseNumber: [''],
      voterIdNumber: [''],

      // Employment Details
      employerName: [''],
      employerAddress: [''],
      employerPhone: [''],
      monthlyIncome: [0],
      workExperience: [0],

      // Flags
      isPrimary: [false],
      isNewTenant: [true],
      isActive: [true],
      needsOnboarding: [true],

      // Documents for this tenant (will be populated from categorized uploads)
      documents: [[]],
    });
  }

  // ...existing code...

  private patchTestTenantFormValues() {
    this.tenantForm.patchValue({
      propertyId: '101',
      rentAmount: 25000,
      securityDeposit: 50000,
      maintenanceCharges: 1500,
      tenancyStartDate: '2025-09-01',
      tenancyEndDate: '2026-08-31',
      rentDueDate: '2025-09-05',
      leaseDuration: 12,
      noticePeriod: 30,
    });

    const firstTenant = this.tenantsFormArray.at(0);
    firstTenant.patchValue({
      name: 'Test Tenant',
      email: 'test.tenant@example.com',
      phoneNumber: '9876543210',
      alternatePhoneNumber: '9123456789',
      dob: '1990-01-01',
      occupation: 'Engineer',
      gender: 'Male',
      maritalStatus: 'Single',
      currentAddress: '123 Test Street',
      permanentAddress: '456 Permanent Ave',
      emergencyContactName: 'John Doe',
      emergencyContactPhone: '9988776655',
      emergencyContactRelation: 'Friend',
      aadhaarNumber: '123412341234',
      panNumber: 'ABCDE1234F',
      drivingLicenseNumber: 'DL1234567890',
      voterIdNumber: 'VOTER12345',
      employerName: 'TestCorp',
      employerAddress: '789 Employer Road',
      employerPhone: '9876543211',
      monthlyIncome: 75000,
      workExperience: 5,
      isPrimary: true,
      isNewTenant: true,
      isActive: true,
      needsOnboarding: true,
      documents: [],
    });
  }

  // ...existing code...
  private calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  private convertToDocuments(
    uploadedFiles: UploadedFile[],
    ownerId: number,
  ): IDocument[] {
    return uploadedFiles.map((file, index) => ({
      ownerId: ownerId,
      ownerType: OwnerType.TENANT,
      category: this.getDocumentCategory(file.name || ''),
      file: file.file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.url,
      uploadedOn: new Date().toISOString(),
      isVerified: false,
      description: `Tenant document ${index + 1}`,
    }));
  }

  // Convert categorized documents to IDocument array
  private convertCategorizedDocuments(
    tenantIndex: number,
    ownerId: number,
  ): IDocument[] {
    const tenantDocs = this.tenantDocuments.get(tenantIndex);
    if (!tenantDocs) return [];

    const documents: IDocument[] = [];

    tenantDocs.forEach((files, category) => {
      files.forEach((file, fileIndex) => {
        documents.push({
          ownerId: ownerId,
          ownerType: OwnerType.TENANT,
          category: category,
          file: file.file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url,
          uploadedOn: new Date().toISOString(),
          isVerified: false,
          description: `${this.getCategoryLabel(category)} - File ${fileIndex + 1}`,
        });
      });
    });

    return documents;
  }

  private getDocumentCategory(fileName: string): DocumentCategory {
    const name = fileName.toLowerCase();
    if (name.includes('aadhaar') || name.includes('aadhar'))
      return DocumentCategory.Aadhaar;
    if (name.includes('pan')) return DocumentCategory.PAN;
    if (name.includes('photo') || name.includes('image'))
      return DocumentCategory.ProfilePhoto;
    if (name.includes('agreement')) return DocumentCategory.RentalAgreement;
    return DocumentCategory.IdProof;
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

  // Load properties for the current landlord
  private loadProperties() {
    const landlordId = this.userdetail?.userId
      ? Number(this.userdetail.userId)
      : 0;
    if (landlordId > 0) {
      this.isLoadingProperties = true;
      this.propertyService.getProperties(landlordId).subscribe({
        next: (response: Result<IProperty[]>) => {
          this.propertyOptions = response.entity
            .filter((p) => p.status === PropertyStatus.Listed) // Only show published properties  !== PropertyStatus.Draft
            .map((property) => ({
              value: property.id!.toString(),
              label: `${property.title} - ${property.locality}, ${property.city}`,
            }));
          this.isLoadingProperties = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.isLoadingProperties = false;
          this.alertService.error({
            errors: [
              {
                message: 'Failed to load properties. Please refresh the page.',
                errorType: 'error',
              },
            ],
            timeout: 5000,
          });
        },
      });
    }
  }

  // Update tenant form control with all documents
  private updateTenantFormDocuments(tenantIndex: number) {
    const allDocuments = this.getAllTenantDocuments(tenantIndex);
    const tenantFormGroup = this.getTenantFormGroup(tenantIndex);
    tenantFormGroup.patchValue({ documents: allDocuments });
  }
}
