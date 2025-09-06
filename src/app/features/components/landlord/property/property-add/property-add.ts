import { DatePipe } from '@angular/common';
import { Component, inject, input, OnInit, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// Import shared library components
import { catchError, filter, of, switchMap, tap } from 'rxjs';

import {
  AlertInfo,
  AlertService,
  FileUploadConfig,
  InputType,
  NgCardComponent,
  NgCheckbox,
  NgDatepickerComponent,
  NgDialogService,
  NgFileUploadComponent,
  NgIconComponent,
  NgInputComponent,
  NgSelectComponent,
  NgTextareaComponent,
  UploadedFile,
} from '../../../../../../../projects/shared/src/public-api';
import { Result } from '../../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../../oauth/service/oauth.service';
import { acceptedTypes } from '../../../../constants/document.constants';
import {
  bhkConfigurationOptions,
  furnishingTypeOptions,
  leaseTypeOptions,
  propertyTypeOptions,
} from '../../../../constants/properties.constants';
import {
  FurnishingType,
  LeaseType,
  PropertyStatus,
  PropertyType,
} from '../../../../enums/view.enum';
import { IDocument } from '../../../../models/document';
import {
  IProperty,
  PropertySaveResponse,
  PropertyValidationError,
} from '../../../../models/property';
import { CommonService } from '../../../../service/common.service';
import { PropertyService } from '../../../../service/property.service';

@Component({
  selector: 'app-property-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
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
  // Inputs and Outputs
  readonly property = input<IProperty | null>(null);
  readonly backToList = output<void>();

  // Image upload configuration
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  readonly maxImageFiles = 10;
  readonly acceptedTypes = acceptedTypes.filter((type) =>
    type.startsWith('image/'),
  );
  readonly imageUploadConfig: FileUploadConfig = {
    maxFileSize: this.maxFileSize,
    acceptedTypes: ['image/*'],
    maxFiles: this.maxImageFiles,
    allowMultiple: true,
  };

  // Select options for dropdowns using enums
  readonly propertyTypeOptions = propertyTypeOptions;
  readonly bhkConfigurationOptions = bhkConfigurationOptions;
  readonly furnishingTypeOptions = furnishingTypeOptions;
  readonly leaseTypeOptions = leaseTypeOptions;

  // Expose Enums to Template
  readonly InputType = InputType;
  readonly PropertyStatus = PropertyStatus;

  // Form and State Management
  propertyForm!: FormGroup;
  uploadedImages: UploadedFile[] = [];
  isEditMode = false;
  isSaving = false;
  isSavingDraft = false;

  // Validation errors
  validationErrors: PropertyValidationError[] = [];
  isShowingValidationErrors = false;

  userdetail: Partial<IUserDetail> = {};
  propertiesImages: IDocument[] = [];

  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly propertyService = inject(PropertyService);
  private readonly alertService = inject(AlertService);
  private readonly userService = inject(OauthService);
  private readonly commonService = inject(CommonService);
  private dialogService = inject(NgDialogService);

  constructor() {
    this.userdetail = this.userService.getUserInfo();
  }

  ngOnInit() {
    this.isEditMode = !!this.property();
    this.initializeForm();

    if (this.isEditMode && this.property()) {
      this.populateFormForEdit();
    } else {
      this.populateTestDefaults();
    }
  }

  // --- Form Actions ---
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

    if (this.propertyForm.invalid) {
      return;
    }

    try {
      const propertyData = this.preparePropertyData(
        PropertyStatus.Listed,
        true,
      );
      const formData = this.convertPropertyToFormData(propertyData);

      this.propertyService.saveProperty(formData).subscribe({
        next: (response: Result<PropertySaveResponse>) => {
          this.isSaving = false;
          if (response.success) {
            this.handleSuccessfulSave(
              response.message,
              'Property saved successfully!',
              'Property updated successfully!',
            );
          }
        },
        error: () => {
          this.isSaving = false;
          this.handleError(
            'An error occurred while saving the property. Please try again.',
          );
        },
      });
    } catch (error) {
      this.isSaving = false;
      this.handleError(
        'Failed to prepare property data for saving. Please check your input and try again.',
      );
    }
  }

  saveDraft(): void {
    if (this.isSavingDraft) {
      return;
    }

    this.validationErrors = [];
    this.isSavingDraft = true;

    try {
      const propertyData = this.preparePropertyData(
        PropertyStatus.Draft,
        false,
      );
      const formData = this.convertPropertyToFormData(propertyData);

      this.propertyService.saveDraft(formData).subscribe({
        next: (response: Result<PropertySaveResponse>) => {
          this.isSavingDraft = false;
          if (response.success) {
            this.handleSuccessfulSave(
              response.message,
              'Draft saved successfully!',
              'Draft updated successfully!',
            );
          }
        },
        error: () => {
          this.isSavingDraft = false;
          this.handleError(
            'An error occurred while saving the draft. Please try again.',
          );
        },
      });
    } catch (error) {
      this.isSavingDraft = false;
      this.handleError(
        'Failed to prepare draft data for saving. Please check your input and try again.',
      );
    }
  }

  goBack() {
    this.backToList.emit();
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const control = this.propertyForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Image upload handlers for shared component
  onImagesSelected(files: UploadedFile[]): void {
    const validFiles = this.propertyService.validateUploadedFiles(files);

    if (validFiles.length !== files.length) {
      const rejectedCount = files.length - validFiles.length;
      this.alertService.error({
        errors: [
          {
            message: `${rejectedCount} file(s) were rejected due to validation errors.`,
            errorType: 'error',
          },
        ],
        timeout: 5000,
      });
    }

    this.uploadedImages = validFiles;
    this.propertyForm
      .get('propertyImages')
      ?.setValue(validFiles, { emitEvent: false });
  }

  onImageRemoved({ file, index }: { file: UploadedFile; index: number }): void {
    this.dialogService
      .confirm({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete the image?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warning',
        icon: 'warning',
        disableClose: true,
      })
      .pipe(
        filter((result) => result.action === 'confirm'),
        switchMap(() => {
          if (file.url && file.id) {
            // ✅ Image exists in backend → call API delete
            return this.propertyService.deletePropertyImage(file.id).pipe(
              tap((success: Result<boolean>) => {
                if (success.success) {
                  this.uploadedImages = this.uploadedImages.filter(
                    (img) => img !== file,
                  );
                  this.propertyForm
                    .get('propertyImages')
                    ?.setValue(this.uploadedImages, { emitEvent: false });

                  this.alertService.success({
                    errors: [
                      {
                        message: 'Image deleted successfully',
                        errorType: 'success',
                      },
                    ],
                  });
                }
              }),
              catchError(() => {
                this.alertService.error({
                  errors: [
                    { message: 'Failed to delete image', errorType: 'error' },
                  ],
                });
                return of(null);
              }),
            );
          } else {
            // ✅ Soft delete → remove locally only using index
            if (index >= 0) {
              this.uploadedImages.splice(index, 1);
              this.propertyForm
                .get('propertyImages')
                ?.setValue(this.uploadedImages, { emitEvent: false });

              this.alertService.success({
                errors: [
                  { message: 'Image removed locally', errorType: 'info' },
                ],
              });
            }

            return of(null); // keep observable chain valid
          }
        }),
      )
      .subscribe();
  }

  onImageUploadError(error: { file: UploadedFile; error: string }): void {
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

  getTenantsList() {
    const prop = this.property();
    return prop?.tenants || [];
  }
  //Private method
  private initializeForm() {
    this.propertyForm = this.fb.group({
      // Basic Information
      title: ['test jitendra', [Validators.required, Validators.minLength(5)]],
      description: [
        'test jitendratest jitendratest jitendra',
        [Validators.required, Validators.minLength(20)],
      ],
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

  private populateFormForEdit() {
    const prop = this.property();
    if (!prop) return;

    // Populate form with existing property data
    this.propertyForm.patchValue({
      title: prop.title,
      description: prop.description,
      propertyType: prop.propertyType,
      bhkConfiguration: prop.bhkConfiguration,
      floorNumber: prop.floorNumber,
      totalFloors: prop.totalFloors,
      numberOfBathrooms: prop.numberOfBathrooms,
      numberOfBalconies: prop.numberOfBalconies,
      carpetAreaSqFt: prop.carpetAreaSqFt,
      builtUpAreaSqFt: prop.builtUpAreaSqFt,
      furnishingType: prop.furnishingType,

      addressLine1: prop.addressLine1,
      addressLine2: prop.addressLine2,
      landmark: prop.landmark,
      locality: prop.locality,
      city: prop.city,
      state: prop.state,
      pinCode: prop.pinCode,

      monthlyRent: prop.monthlyRent,
      securityDeposit: prop.securityDeposit,
      availableFrom: prop.availableFrom,
      leaseType: prop.leaseType,
      isNegotiable: prop.isNegotiable,

      hasLift: prop.hasLift,
      hasParking: prop.hasParking,
      hasPowerBackup: prop.hasPowerBackup,
      hasWaterSupply: prop.hasWaterSupply,
      hasGasPipeline: prop.hasGasPipeline,
      hasSecurity: prop.hasSecurity,
      hasInternet: prop.hasInternet,
    });

    // Load existing images/documents
    if (prop.documents && prop.documents.length > 0) {
      this.loadExistingDocuments(prop.documents);
    }
  }

  private convertPropertyToFormData(property: IProperty): FormData {
    return this.propertyService.convertPropertyToFormData(property);
  }

  private loadExistingDocuments(documents: IDocument[]) {
    this.uploadedImages = this.commonService.loadExistingDocuments(documents);
    this.propertyForm
      .get('propertyImages')
      ?.setValue(this.uploadedImages, { emitEvent: false });
  }

  private populateTestDefaults() {
    // Get next month's date for availableFrom field
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );

    this.propertyForm.patchValue({
      // Basic Information
      title: 'Beautiful 2BHK Apartment with Modern Amenities',
      description:
        'Spacious and well-ventilated 2BHK apartment located in a prime location with excellent connectivity to IT hubs and shopping centers. The property features modern amenities and is perfect for families.',
      propertyType: PropertyType.Apartment,
      bhkConfiguration: '2BHK',
      floorNumber: 2,
      totalFloors: 5,
      numberOfBathrooms: 2,
      numberOfBalconies: 1,

      // Area & Furnishing
      carpetAreaSqFt: 850,
      builtUpAreaSqFt: 1200,
      furnishingType: FurnishingType.SemiFurnished,

      // Location
      addressLine1: '123 Green Valley Apartments, MG Road',
      addressLine2: 'Near Metro Station',
      landmark: 'Opposite City Mall',
      locality: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pinCode: '560095',

      // Rent Details
      monthlyRent: 25000,
      securityDeposit: 50000,
      availableFrom: nextMonth.toISOString().split('T')[0],
      leaseType: LeaseType.LongTerm,
      isNegotiable: true,

      // Amenities
      hasLift: true,
      hasParking: true,
      hasPowerBackup: true,
      hasWaterSupply: true,
      hasGasPipeline: false,
      hasSecurity: true,
      hasInternet: true,
    });
  }

  private preparePropertyData(
    status: PropertyStatus,
    isValid: boolean,
  ): IProperty {
    const property: IProperty = {
      ...this.propertyForm.value,
      landlordId: this.userdetail.userId,
      documents: this.commonService.convertImagesToDocuments(
        this.uploadedImages,
        this.userdetail.userId!,
      ),
      status: status,
      IsValid: isValid,
      id: this.property()?.id,
    };

    if (property['propertyImages']) {
      delete property['propertyImages'];
    }
    return property;
  }

  private showValidationErrors(): void {
    if (this.validationErrors.length === 0) {
      return;
    }

    this.isShowingValidationErrors = true;
    this.alertService.clearAlert();
    this.propertyForm.markAllAsTouched();

    const errorMessages: AlertInfo[] = this.validationErrors.map(
      (error: AlertInfo) => ({ message: error.message, errorType: 'error' }),
    );

    const allMessages: AlertInfo[] = [
      {
        message: `Please fix the following ${this.validationErrors.length} validation error(s):`,
        errorType: 'error',
      },
      ...errorMessages,
    ];

    this.alertService.error({ errors: allMessages });
  }

  private handleSuccessfulSave(
    message: string | string[],
    defaultMessageSuccess: string,
    defaultMessageUpdate: string,
  ): void {
    this.validationErrors = [];
    this.isShowingValidationErrors = false;

    const successMessage = Array.isArray(message)
      ? message.join(', ')
      : this.isEditMode
        ? defaultMessageUpdate
        : defaultMessageSuccess;

    this.alertService.success({
      errors: [{ message: successMessage, errorType: 'success' }],
      timeout: 3000,
    });
    this.goBack();
  }

  private handleError(errorMessage: string): void {
    this.alertService.error({
      errors: [{ message: errorMessage, errorType: 'error' }],
      timeout: 5000,
    });
  }
}
