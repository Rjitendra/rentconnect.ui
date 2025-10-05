import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgIconComponent,
  NgLabelComponent,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import {
  DocumentCategory,
  DocumentUploadContext,
  FurnishingType,
  LeaseType,
  PropertyStatus,
  PropertyType,
} from '../../../enums/view.enum';
import { IDocument } from '../../../models/document';
import { IProperty } from '../../../models/property';
import { ITenant } from '../../../models/tenant';
import { PropertyService as DocumentService } from '../../../service/document.service';
import { PropertyService } from '../../../service/property.service';
import { TenantService } from '../../../service/tenant.service';

// interface PropertyImage {
//   id?: number;
//   url: string;
//   name: string;
//   type: 'landlord' | 'tenant';
//   uploadedBy: string;
//   uploadedOn: Date | string;
//   description?: string;
// }

@Component({
  selector: 'app-property-info',
  standalone: true,
  imports: [
    CommonModule,
    NgCardComponent,
    NgButton,
    NgIconComponent,
    NgLabelComponent,
    NgFileUploadComponent,
  ],
  templateUrl: './property-info.html',
  styleUrl: './property-info.scss',
})
export class PropertyInfoComponent implements OnInit {
  // Data
  tenant: ITenant | null = null;
  property: IProperty | null = null;
  landlordImages: IDocument[] = [];
  tenantImages: IDocument[] = [];

  // UI State
  loading = true;
  showUploadModal = false;
  uploading = false;
  selectedImage: IDocument | null = null;
  selectedFiles: UploadedFile[] = [];

  // User info
  userDetail: Partial<IUserDetail> = {};

  // File upload config
  fileUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowMultiple: true,
  };

  // Services
  private router = inject(Router);
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);
  private propertyService = inject(PropertyService);
  private documentService = inject(DocumentService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
  }

  ngOnInit() {
    this.loadPropertyInfo();
  }

  getFullAddress(): string {
    if (!this.property) return 'N/A';

    const parts = [
      this.property['address'],
      this.property.locality,
      this.property.city,
      this.property.state,
      this.property['pincode'],
    ].filter(Boolean);

    return parts.join(', ') || 'N/A';
  }

  getPropertyType(): string {
    if (
      this.property?.propertyType === undefined ||
      this.property?.propertyType === null
    ) {
      return 'N/A';
    }
    return PropertyType[this.property.propertyType] || 'N/A';
  }

  getFurnishingType(): string {
    if (
      this.property?.furnishingType === undefined ||
      this.property?.furnishingType === null
    ) {
      return 'N/A';
    }
    return this.formatEnumName(FurnishingType[this.property.furnishingType]);
  }

  getLeaseType(): string {
    if (
      this.property?.leaseType === undefined ||
      this.property?.leaseType === null
    ) {
      return 'N/A';
    }
    return this.formatEnumName(LeaseType[this.property.leaseType]);
  }

  getPropertyStatus(): string {
    if (this.property?.status === undefined || this.property?.status === null) {
      return 'N/A';
    }
    return PropertyStatus[this.property.status] || 'N/A';
  }
  getPropertyAmenities(): string[] {
    if (!this.property) return [];

    const amenities: string[] = [];

    if (this.property.hasLift) amenities.push('Lift');
    if (this.property.hasParking) amenities.push('Parking');
    if (this.property.hasPowerBackup) amenities.push('Power Backup');
    if (this.property.hasWaterSupply) amenities.push('Water Supply');
    if (this.property.hasGasPipeline) amenities.push('Gas Pipeline');
    if (this.property.hasSecurity) amenities.push('Security');
    if (this.property.hasInternet) amenities.push('Internet');

    return amenities;
  }

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    const file = event.file;
    this.selectedFiles = this.selectedFiles.filter((f) => f.url !== file.url);
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0 || !this.tenant?.id) return;

    this.uploading = true;

    // Prepare documents for upload
    const documents = this.selectedFiles.map((file) => ({
      file: file.file,
      category: DocumentCategory.PropertyImages.toString(),
      description: 'Property condition photo',
      ownerId: this.tenant?.id || 0,
      ownerType: 'Tenant',
      tenantId: this.tenant?.id,
      propertyId: this.tenant?.propertyId,
      landlordId: this.property?.landlordId,
      name: file.file.name,
      size: file.file.size,
      type: file.file.type,
      uploadContext: DocumentUploadContext.None,
    }));

    this.tenantService
      .uploadTenantDocuments(this.tenant.id, documents)
      .subscribe({
        next: (result) => {
          if (result.status === ResultStatusType.Success && result.entity) {
            // Add newly uploaded images to tenant images array
            const newImages = result.entity.map((doc) => ({
              id: doc.id || 0,
              url: doc.url || '',
              name: doc.name || 'Tenant Image',
              ownerType: 'Tenant',
              uploadedBy: 'By You',
              uploadedOn: new Date(doc.uploadedOn || Date.now()).toISOString(),
              description: doc.description || '',
              ownerId: doc.ownerId,
              category: doc.category,
              uploadContext: DocumentUploadContext.None,
            }));

            this.tenantImages = [...this.tenantImages, ...newImages];
            this.selectedFiles = [];
            this.closeUploadModal();
            console.log('Images uploaded successfully');
          } else {
            console.error('Failed to upload images');
          }
          this.uploading = false;
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.uploading = false;
        },
      });
  }

  deleteImage(image: IDocument) {
    if (image.type === 'tenant' && image.id) {
      // Show confirmation before delete
      if (!confirm('Are you sure you want to delete this image?')) {
        return;
      }

      this.tenantService.deleteTenantDocument(image.id).subscribe({
        next: (result) => {
          if (result.status === ResultStatusType.Success) {
            // Remove from local array
            this.tenantImages = this.tenantImages.filter(
              (img) => img.id !== image.id,
            );
            console.log('Image deleted successfully');
          } else {
            console.error('Failed to delete image');
          }
        },
        error: (error) => {
          console.error('Error deleting image:', error);
        },
      });
    }
  }

  openImageModal(image: IDocument) {
    this.selectedImage = image;
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFiles = [];
  }

  goBack() {
    this.router.navigate(['/tenant']);
  }
  // Format enum names from PascalCase to human-readable
  private formatEnumName(value: string): string {
    if (!value) return 'N/A';
    // Add space before capital letters and capitalize first letter
    return value.replace(/([A-Z])/g, ' $1').trim();
  }

  private loadPropertyInfo() {
    this.loading = true;

    // Get current tenant
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
            // Load property details
            return this.loadPropertyDetails();
          }
          return of(null);
        }),
        switchMap(() => {
          // Load property images after property details
          if (this.tenant) {
            this.loadPropertyImages();
            return of(null);
          }
          return of(null);
        }),
      )
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading property info:', error);
          this.loading = false;
        },
      });
  }

  private loadPropertyDetails() {
    if (!this.tenant?.propertyId) {
      return of(null);
    }

    return this.propertyService.getPropertyById(this.tenant.propertyId).pipe(
      switchMap((propertyResult) => {
        if (propertyResult?.success && propertyResult.entity) {
          this.property = propertyResult.entity;
        }
        return of(null);
      }),
    );
  }

  private loadPropertyImages() {
    this.landlordImages =
      this.property?.documents
        ?.filter(
          (x) =>
            x.category === DocumentCategory.PropertyImages &&
            x.ownerType === 'Landlord',
        )
        .map((img: IDocument) => ({
          id: img.id || 0,
          url: img.url || '',
          name: img.name || 'Property Image',
          type: 'landlord' as const,
          uploadedBy: 'By Landlord',
          uploadedOn: new Date(img.uploadedOn || Date.now()).toISOString(),
          description: img.description || '',
          ownerId: img.ownerId,
          ownerType: img.ownerType,
          category: img.category,
        })) ?? [];

    this.tenantImages =
      this.property?.documents
        ?.filter(
          (x) =>
            x.category === DocumentCategory.PropertyImages &&
            x.ownerType === 'Tenant',
        )
        .map((img: IDocument) => ({
          id: img.id || 0,
          url: img.url || '',
          name: img.name || 'Property Image',
          type: 'landlord' as const,
          uploadedBy: 'By Landlord',
          uploadedOn: new Date(img.uploadedOn || Date.now()).toISOString(),
          description: img.description || '',
          ownerId: img.ownerId,
          ownerType: img.ownerType,
          category: img.category,
        })) ?? [];
  }
}
