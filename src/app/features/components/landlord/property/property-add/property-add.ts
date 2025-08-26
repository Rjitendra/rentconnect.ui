import { Component, OnInit, output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';


// Import shared library components

import {
  IProperty,
  PropertyFormData,
  PropertySaveResponse,
  PropertyValidationError,
} from '../../../../models/property';
import {
  PropertyType,
  FurnishingType,
  LeaseType,
  PropertyStatus,
  DocumentCategory,
} from '../../../../enums/view.enum';
import { PropertyService } from '../../../../service/property.service';
import {
  AlertService,
  FileUploadConfig,
  InputType,
  NgIconComponent,
  NgCardComponent,
  NgCheckbox,
  NgDatepickerComponent,
  NgFileUploadComponent,
  NgInputComponent,
  NgSelectComponent,
  NgTextareaComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../../projects/shared/src/public-api';
import { IDocument } from '../../../../models/document';
import { IUserDetail, OauthService } from '../../../../../oauth/service/oauth.service';
import { OwnerType } from '../../../../constants/owner-type.constants';

@Component({
  selector: 'app-property-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgCardComponent,
    NgIconComponent,
    NgInputComponent,
    NgSelectComponent,
    NgCheckbox,
    NgTextareaComponent,
    NgDatepickerComponent,
    NgFileUploadComponent
  ],
  templateUrl: './property-add.html',
  styleUrl: './property-add.scss',
})
export class PropertyAdd implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private alertService = inject(AlertService);
  private userService = inject(OauthService);
  readonly backToList = output<void>();

  propertyForm!: FormGroup;
  uploadedImages: UploadedFile[] = [];
  isDragOver = false;

  // Image upload configuration
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  readonly maxFiles = 10;
  readonly acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  // Select options for dropdowns using enums
  propertyTypeOptions: SelectOption[] = [
    { value: PropertyType.Apartment, label: 'Apartment' },
    { value: PropertyType.Villa, label: 'Villa' },
    { value: PropertyType.IndependentHouse, label: 'Independent House' },
    { value: PropertyType.RowHouse, label: 'Row House' },
    { value: PropertyType.Studio, label: 'Studio' },
    { value: PropertyType.Plot, label: 'Plot' },
  ];

  bhkConfigurationOptions: SelectOption[] = [
    { value: '1RK', label: '1 RK' },
    { value: '1BHK', label: '1 BHK' },
    { value: '2BHK', label: '2 BHK' },
    { value: '3BHK', label: '3 BHK' },
    { value: '4BHK', label: '4 BHK' },
    { value: '5BHK+', label: '5+ BHK' },
  ];

  furnishingTypeOptions: SelectOption[] = [
    { value: FurnishingType.Unfurnished, label: 'Unfurnished' },
    { value: FurnishingType.SemiFurnished, label: 'Semi Furnished' },
    { value: FurnishingType.FullyFurnished, label: 'Fully Furnished' },
  ];

  leaseTypeOptions: SelectOption[] = [
    { value: LeaseType.ShortTerm, label: 'Short Term (< 11 months)' },
    { value: LeaseType.LongTerm, label: 'Long Term (11+ months)' },
  ];

  imageUploadConfig: FileUploadConfig = {
    maxFileSize: this.maxFileSize,
    acceptedTypes: ['image/*'],
    maxFiles: this.maxFiles,
    allowMultiple: true,
  };

  // Expose InputType enum to template
  InputType = InputType;

  // Loading states
  isSaving = false;
  isSavingDraft = false;

  // Validation errors
  validationErrors: PropertyValidationError[] = [];
  isShowingValidationErrors = false;
  userdetail: Partial<IUserDetail> = {};

  constructor() { this.userdetail = this.userService.getUserInfo(); }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.propertyForm = this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      propertyType: ['', Validators.required],
      bhkConfiguration: ['', Validators.required],
      floorNumber: ['', [Validators.required, Validators.min(0)]],
      totalFloors: ['', [Validators.required, Validators.min(1)]],
      numberOfBathrooms: ['', [Validators.required, Validators.min(1)]],
      numberOfBalconies: ['', [Validators.min(0)]],

      // Area & Furnishing
      carpetAreaSqFt: ['', [Validators.required, Validators.min(50)]],
      builtUpAreaSqFt: ['', [Validators.required, Validators.min(100)]],
      furnishingType: ['', Validators.required],

      // Location
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      landmark: [''],
      locality: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

      // Rent Details
      monthlyRent: ['', [Validators.required, Validators.min(1000)]],
      securityDeposit: ['', [Validators.required, Validators.min(0)]],
      availableFrom: ['', Validators.required],
      leaseType: ['', Validators.required],
      isNegotiable: [false],

      // Amenities
      hasLift: [false],
      hasParking: [false],
      hasPowerBackup: [false],
      hasWaterSupply: [false],
      hasGasPipeline: [false],
      hasSecurity: [false],
      hasInternet: [false],

      // Property Images
      propertyImages: [null], // Remove required validation for images
    });
  }

  onSubmit() {
    this.propertyForm.markAllAsDirty();
    //  if (this.isSaving) return; // Prevent double submission

    // Clear previous validation errors
    this.validationErrors = [];

    // Validate form using service
    const formErrors = this.propertyService.validateForm(this.propertyForm);
    if (formErrors.length > 0) {
      this.validationErrors = formErrors;
      this.showValidationErrors();
      return;
    }
    if (this.propertyForm.invalid) { return; }
    this.isSaving = true;

    try {
      // Create property object with form data and documents
      const propertyData: IProperty = {
        ...this.propertyForm.value,
        landlordId: this.userdetail?.userId ? Number(this.userdetail.userId) : 0,
        documents: this.convertImagesToDocuments(),
        status: PropertyStatus.Listed,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Convert to FormData for file upload support
      const formData = this.convertPropertyToFormData(propertyData);

      this.propertyService.saveProperty(formData).subscribe({
        next: (response: PropertySaveResponse) => {
          this.isSaving = false;
          if (response.success) {
            // Clear any previous errors
            this.validationErrors = [];
            this.isShowingValidationErrors = false;

            // Show success message
            this.alertService.success({
              errors: [
                {
                  message: response.message,
                  errorType: 'success',
                },
              ],
              timeout: 5000,
            });

            // Navigate back to property list or show success page
            setTimeout(() => {
              this.router.navigate(['/landlord/property/dashboard']);
            }, 2000);
          } else {
            this.validationErrors = response.errors || [];
            this.showValidationErrors();
          }
        },
        error: (error: Error) => {
          this.isSaving = false;

          this.alertService.error({
            errors: [
              {
                message:
                  'An error occurred while saving the property. Please try again.',
                errorType: 'error',
              },
            ],
            timeout: 5000,
          });
        },
      });
    } catch (error) {
      this.isSaving = false;
      this.alertService.error({
        errors: [
          {
            message: 'Failed to prepare property data for saving. Please check your input and try again.',
            errorType: 'error',
          },
        ],
        timeout: 5000,
      });
    }
  }

  saveDraft() {
    if (this.isSavingDraft) return; // Prevent double submission

    // Clear previous validation errors
    this.validationErrors = [];

    this.isSavingDraft = true;

    try {
      // Create property object with form data and documents
      const propertyData: IProperty = {
        ...this.propertyForm.value,
        documents: this.convertImagesToDocuments(),
        status: PropertyStatus.Draft,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Convert to FormData for file upload support
      const formData = this.convertPropertyToFormData(propertyData);

      this.propertyService.saveDraft(formData).subscribe({
        next: (response: PropertySaveResponse) => {
          this.isSavingDraft = false;
          if (response.success) {
            // Clear any previous errors
            this.validationErrors = [];
            this.isShowingValidationErrors = false;

            // Show success message
            this.alertService.success({
              errors: [
                {
                  message: response.message,
                  errorType: 'success',
                },
              ],
              timeout: 3000,
            });
          } else {
            this.validationErrors = response.errors || [];
            this.showValidationErrors();
          }
        },
        error: (error: Error) => {
          this.isSavingDraft = false;

          this.alertService.error({
            errors: [
              {
                message:
                  'An error occurred while saving the draft. Please try again.',
                errorType: 'error',
              },
            ],
            timeout: 5000,
          });
        },
      });
    } catch (error) {
      this.isSavingDraft = false;
      this.alertService.error({
        errors: [
          {
            message: 'Failed to prepare draft data for saving. Please check your input and try again.',
            errorType: 'error',
          },
        ],
        timeout: 5000,
      });
    }
  }

  goBack() {
    // Emit event to parent component instead of router navigation
    // TODO: The 'emit' function requires a mandatory void argument
    this.backToList.emit();
  }

  showValidationErrors() {
    if (this.validationErrors.length > 0 ) {
      this.isShowingValidationErrors = true;

      // Clear any existing alerts first
      this.alertService.clearAlert();

      // Mark all form controls as touched to show validation errors
      this.propertyForm.markAllAsTouched();

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
    const control = this.propertyForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const control = this.propertyForm.get(fieldName);
    if (control && control.errors && control.touched) {
      const errors = control.errors;
      if (errors['required'])
        return `${this.getFieldDisplayName(fieldName)} is required`;
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['minlength'])
        return `Minimum length is ${errors['minlength'].requiredLength}`;
      if (errors['maxlength'])
        return `Maximum length is ${errors['maxlength'].requiredLength}`;
      if (errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  // Helper method to get user-friendly field names
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      propertyTitle: 'Property Title',
      propertyType: 'Property Type',
      monthlyRent: 'Monthly Rent',
      securityDeposit: 'Security Deposit',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      area: 'Area',

      city: 'City',
      state: 'State',
      zipCode: 'Zip Code',
      description: 'Description',
      furnishingType: 'Furnishing Type',
      leaseType: 'Lease Type',
      availableFrom: 'Available From',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Image upload handlers for shared component
  onImagesSelected(files: UploadedFile[]): void {
    // Validate files before accepting them
    const validFiles = this.validateUploadedFiles(files);

    if (validFiles.length !== files.length) {
      this.alertService.error({
        errors: [{
          message: `${files.length - validFiles.length} file(s) were rejected due to validation errors.`,
          errorType: 'error'
        }],
        timeout: 5000
      });
    }

    this.uploadedImages = validFiles;
    this.propertyForm
      .get('propertyImages')
      ?.setValue(validFiles, { emitEvent: false });
  }

  onImageRemoved(file: UploadedFile): void {
    const index = this.uploadedImages.findIndex(
      (img) => img.name === file.name && img.size === file.size,
    );

    if (index >= 0) {
      this.uploadedImages.splice(index, 1);
      this.propertyForm
        .get('propertyImages')
        ?.setValue(this.uploadedImages, { emitEvent: false });
    }
  }

  onImageUploadError(error: { file: UploadedFile; error: string }): void {
    this.alertService.error({
      errors: [{
        message: `Error uploading ${error.file.name}: ${error.error}`,
        errorType: 'error'
      }],
      timeout: 5000
    });
  }

  removeImage(image: UploadedFile): void {
    this.removeImageFromList(image);
  }

  // Helper method to debug form errors
  private getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.propertyForm.controls).forEach((key) => {
      const controlErrors = this.propertyForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  private removeImageFromList(image: UploadedFile): void {
    const index = this.uploadedImages.findIndex(
      (img) => img.name === image.name && img.size === image.size,
    );

    if (index >= 0) {
      // Clean up object URL to prevent memory leaks
      if (this.uploadedImages[index].url) {
        URL.revokeObjectURL(this.uploadedImages[index].url);
      }

      // Remove from array
      this.uploadedImages.splice(index, 1);

      // Update form control without triggering validation
      this.propertyForm
        .get('propertyImages')
        ?.setValue(this.uploadedImages, { emitEvent: false });
    }
  }

  // Helper method to validate uploaded files
  private validateUploadedFiles(files: UploadedFile[]): UploadedFile[] {
    const validFiles: UploadedFile[] = [];

    for (const file of files) {
      let isValid = true;

      // Check file size
      if (file.size > this.maxFileSize) {
        this.alertService.error({
          errors: [{
            message: `File "${file.name}" is too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB.`,
            errorType: 'error'
          }],
          timeout: 5000
        });
        isValid = false;
      }

      // Check file type
      if (!this.acceptedTypes.includes(file.type)) {
        this.alertService.error({
          errors: [{
            message: `File "${file.name}" has an unsupported format. Only ${this.acceptedTypes.join(', ')} are allowed.`,
            errorType: 'error'
          }],
          timeout: 5000
        });
        isValid = false;
      }

      // Check total number of files
      if (validFiles.length >= this.maxFiles) {
        this.alertService.error({
          errors: [{
            message: `Maximum ${this.maxFiles} files allowed. Additional files will be ignored.`,
            errorType: 'error'
          }],
          timeout: 5000
        });
        break;
      }

      if (isValid) {
        validFiles.push(file);
      }
    }

    return validFiles;
  }

  // Helper method to convert uploaded files to documents for the property model
  private convertImagesToDocuments(): IDocument[] {
    const ownerId = this.userdetail?.userId ? Number(this.userdetail.userId) : 0;
    return this.uploadedImages.map((image, index) => ({
      ownerId: ownerId, // Will be set when property is saved
      ownerType: OwnerType.LANDLORD,
      category: DocumentCategory.PropertyPhoto,
      name: image.name,
      type: image.type,
      size: image.size,
      url: image.url,
      file: image.file, // Include the actual File object
      uploadedOn: new Date().toISOString(),
      isVerified: false,
      description: index === 0 ? 'Primary property image' : `Property image ${index + 1}`
    }));
  }

  private convertPropertyToFormData(property: IProperty): FormData {
    const formData = new FormData();



    // Handle documents (files + metadata)
    if (property.documents && Array.isArray(property.documents)) {
      property.documents.forEach((doc: IDocument, index: number) => {
        if (doc.file instanceof File) {
          // Append the actual file
          formData.append(`documents[${index}].file`, doc.file, doc.file.name);
        }

        // Append metadata fields individually (so .NET model binder can map)
        if (doc.name) formData.append(`documents[${index}].name`, doc.name);
        if (doc.type) formData.append(`documents[${index}].type`, doc.type);
        if (doc.size) formData.append(`documents[${index}].size`, doc.size.toString());
        if (doc.category) formData.append(`documents[${index}].category`, doc.category.toString());
        if (doc.description) formData.append(`documents[${index}].description`, doc.description);
        if (doc.ownerId) formData.append(`documents[${index}].ownerId`, doc.ownerId.toString());
        if (doc.ownerType) formData.append(`documents[${index}].ownerType`, doc.ownerType);
      });
    }

    // Handle other property fields
    Object.entries(property).forEach(([key, value]) => {
      // Skip documents as they're handled above
      if (key === 'documents') return;

      // Skip null/undefined values
      if (value === null || value === undefined) return;

      // Handle arrays (excluding documents)
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      }
      // Handle Date objects
      else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      }
      // Handle nested objects
      else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      }
      // Handle primitives (string, number, boolean)
      else {
        formData.append(key, value.toString());
      }
    });

    return formData;
  }

}
