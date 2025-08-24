import { Component, OnInit, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-property-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgCardComponent,
    NgIconComponent,
    NgInputComponent,
    NgSelectComponent,
    NgCheckbox,
    NgTextareaComponent,
    NgDatepickerComponent,
    NgFileUploadComponent,
  ],
  templateUrl: './property-add.html',
  styleUrl: './property-add.scss',
})
export class PropertyAdd implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private propertyService: PropertyService,
    private alertService: AlertService,
  ) {}

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
    if (this.isSaving) return; // Prevent double submission

    // Clear previous validation errors
    this.validationErrors = [];

    // Validate form using service
    const formErrors = this.propertyService.validateForm(this.propertyForm);
    if (formErrors.length > 0) {
      this.validationErrors = formErrors;
      this.showValidationErrors();
      return;
    }

    this.isSaving = true;

    const formData: PropertyFormData = {
      ...this.propertyForm.value,
      documents: this.convertImagesToDocuments(),
    };

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
  }

  saveDraft() {
    if (this.isSavingDraft) return; // Prevent double submission

    // Clear previous validation errors
    this.validationErrors = [];

    this.isSavingDraft = true;

    const formData: PropertyFormData = {
      ...this.propertyForm.value,
      documents: this.convertImagesToDocuments(),
    };

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
  }

  goBack() {
    // Emit event to parent component instead of router navigation
    // TODO: The 'emit' function requires a mandatory void argument
    this.backToList.emit();
  }

  showValidationErrors() {
    if (this.validationErrors.length > 0 && !this.isShowingValidationErrors) {
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
    this.uploadedImages = files;
    this.propertyForm
      .get('propertyImages')
      ?.setValue(files, { emitEvent: false });
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
    alert(`Error uploading ${error.file.name}: ${error.error}`);
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

  // Helper method to convert uploaded files to documents for the property model
  private convertImagesToDocuments(): any[] {
    return this.uploadedImages.map((image, index) => ({
      name: image.name,
      type: image.type,
      size: image.size,
      url: image.url,
      isPrimary: index === 0, // First image is primary
      documentType: 'PropertyImage',
      uploadedAt: new Date(),
    }));
  }
}
