import { Component, OnInit, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Shared library imports


// Models and enums
import { ITenant } from '../../../../models/tenant';
import { DocumentCategory } from '../../../../enums/view.enum';
import { TenantService } from '../../../../service/tenant.service';
import { NgCardComponent, NgInputComponent, NgSelectComponent, NgDatepickerComponent, NgFileUploadComponent, NgIconComponent, SelectOption, InputType, FileUploadConfig, AlertService, UploadedFile } from '../../../../../../../projects/shared/src/public-api';

@Component({
  selector: 'app-tenant-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgCardComponent,
    NgInputComponent,
    NgSelectComponent,
    NgDatepickerComponent,
    NgFileUploadComponent,
    NgIconComponent
  ],
  templateUrl: './tenant-add.html',
  styleUrl: './tenant-add.scss'
})
export class TenantAddComponent implements OnInit {
  @Input() propertyOptions: SelectOption[] = [];
  readonly tenantAdded = output<void>();
  readonly cancel = output<void>();

  // Form
  tenantForm!: FormGroup;
  isSaving = false;
  
  // Enums for template
  InputType = InputType;

  // Document upload configuration
  documentUploadConfig: FileUploadConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    allowMultiple: true
  };

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private tenantService: TenantService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
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
      tenants: this.fb.array([this.createTenantFormGroup()])
    });

    // Set the first tenant as primary by default
    this.tenantsFormArray.at(0).patchValue({ isPrimary: true });
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

      // Documents for this tenant
      documents: [[]]
    });
  }

  // Form Array Helper Methods
  get tenantsFormArray(): FormArray {
    return this.tenantForm.get('tenants') as FormArray;
  }

  addTenant() {
    const newTenant = this.createTenantFormGroup();
    this.tenantsFormArray.push(newTenant);
  }

  removeTenant(index: number) {
    if (this.tenantsFormArray.length > 1) {
      this.tenantsFormArray.removeAt(index);
      
      // Ensure at least one tenant is marked as primary
      const hasPrimary = this.tenantsFormArray.controls.some(control => 
        control.get('isPrimary')?.value === true
      );
      
      if (!hasPrimary && this.tenantsFormArray.length > 0) {
        this.tenantsFormArray.at(0).patchValue({ isPrimary: true });
      }
    }
  }

  setPrimaryTenant(index: number) {
    // Reset all tenants to not primary
    this.tenantsFormArray.controls.forEach(control => {
      control.patchValue({ isPrimary: false });
    });
    
    // Set the selected tenant as primary
    this.tenantsFormArray.at(index).patchValue({ isPrimary: true });
  }

  getTenantFormGroup(index: number): FormGroup {
    return this.tenantsFormArray.at(index) as FormGroup;
  }

  // Form submission
  onSubmit() {
    if (this.tenantForm.valid && !this.isSaving) {
      this.isSaving = true;
      
      const formData = this.tenantForm.value;
      const tenantPromises: Promise<any>[] = [];

      // Create tenant save requests for each tenant
      formData.tenants.forEach((tenantData: any) => {
        const tenantToSave: Partial<ITenant> = {
          ...tenantData,
          // Copy shared property/tenancy details to each tenant
          propertyId: formData.propertyId,
          rentAmount: formData.rentAmount,
          securityDeposit: formData.securityDeposit,
          maintenanceCharges: formData.maintenanceCharges,
          tenancyStartDate: formData.tenancyStartDate,
          tenancyEndDate: formData.tenancyEndDate,
          rentDueDate: formData.rentDueDate,
          leaseDuration: formData.leaseDuration,
          noticePeriod: formData.noticePeriod,
          
          // Calculate age from DOB
          age: this.calculateAge(tenantData.dob),
          
          // Set default values
          landlordId: 1, // TODO: Get from auth service
          tenantGroup: Date.now(), // Use timestamp as group ID for now
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          
          // Default status values
          agreementSigned: false,
          onboardingEmailSent: false,
          onboardingCompleted: false,
          isAcknowledge: false,
          isVerified: false
        };

        tenantPromises.push(
          this.tenantService.saveTenant(tenantToSave).toPromise()
        );
      });

      // Execute all tenant save operations
      Promise.all(tenantPromises).then(responses => {
        this.isSaving = false;
        
        const successCount = responses.filter(r => r.success).length;
        const totalCount = responses.length;
        
        if (successCount === totalCount) {
          this.showSuccess(`Successfully added ${successCount} tenant${successCount > 1 ? 's' : ''} to the property`);
          // TODO: The 'emit' function requires a mandatory void argument
          this.tenantAdded.emit();
        } else {
          this.showError(`Added ${successCount} out of ${totalCount} tenants. Some tenants failed to save.`);
          // Show individual errors
          responses.forEach((response, index) => {
            if (!response.success) {
              this.showError(`Tenant ${index + 1}: ${response.message}`);
            }
          });
        }
      }).catch(error => {
        this.isSaving = false;
        this.showError('Failed to save tenants');
        console.error('Error saving tenants:', error);
      });
    }
  }

  onCancel() {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cancel.emit();
  }

  // Document handling for individual tenants
  onTenantDocumentsUploaded(files: UploadedFile[], tenantIndex: number) {
    const tenantFormGroup = this.getTenantFormGroup(tenantIndex);
    const currentDocuments = tenantFormGroup.get('documents')?.value || [];
    
    const newDocuments = files.map(file => ({
      category: this.getDocumentCategory(file.name || ''),
      fileUrl: file.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    }));

    tenantFormGroup.patchValue({
      documents: [...currentDocuments, ...newDocuments]
    });
  }

  onTenantDocumentDeleted(file: UploadedFile, tenantIndex: number) {
    const tenantFormGroup = this.getTenantFormGroup(tenantIndex);
    const currentDocuments = tenantFormGroup.get('documents')?.value || [];
    
    const updatedDocuments = currentDocuments.filter((doc: any) => doc.fileUrl !== file.url);
    
    tenantFormGroup.patchValue({
      documents: updatedDocuments
    });
  }

  private calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private getDocumentCategory(fileName: string): DocumentCategory {
    const name = fileName.toLowerCase();
    if (name.includes('aadhaar') || name.includes('aadhar')) return DocumentCategory.Aadhaar;
    if (name.includes('pan')) return DocumentCategory.PAN;
    if (name.includes('photo') || name.includes('image')) return DocumentCategory.ProfilePhoto;
    if (name.includes('agreement')) return DocumentCategory.Agreement;
    return DocumentCategory.IdProof;
  }

  // Alert helper methods
  private showSuccess(message: string) {
    this.alertService.success({
      errors: [{ message, errorType: 'success' }],
      timeout: 3000
    });
  }

  private showError(message: string) {
    this.alertService.error({
      errors: [{ message, errorType: 'error' }],
      timeout: 5000
    });
  }
}