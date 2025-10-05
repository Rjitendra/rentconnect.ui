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
import { DocumentCategory } from '../../../enums/view.enum';
import { IDocument } from '../../../models/document';
import { IProperty } from '../../../models/property';
import { ITenant } from '../../../models/tenant';
import { PropertyService as DocumentService } from '../../../service/document.service';
import { PropertyService } from '../../../service/property.service';
import { TenantService } from '../../../service/tenant.service';

interface PropertyImage {
  id?: number;
  url: string;
  name: string;
  type: 'landlord' | 'tenant';
  uploadedBy: string;
  uploadedOn: Date | string;
  description?: string;
}

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
  landlordImages: PropertyImage[] = [];
  tenantImages: PropertyImage[] = [];

  // UI State
  loading = true;
  showUploadModal = false;
  uploading = false;
  selectedImage: PropertyImage | null = null;
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

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    const file = event.file;
    this.selectedFiles = this.selectedFiles.filter((f) => f.url !== file.url);
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0 || !this.tenant) return;

    this.uploading = true;

    try {
      // Here you would upload files to your backend
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add uploaded files to tenant images
      this.selectedFiles.forEach((file) => {
        this.tenantImages.push({
          url: file.url || '',
          name: file.file.name,
          type: 'tenant',
          uploadedBy: this.tenant!.name,
          uploadedOn: new Date(),
          description: 'Property photo uploaded by tenant',
        });
      });

      this.selectedFiles = [];
      this.closeUploadModal();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      this.uploading = false;
    }
  }

  deleteImage(image: PropertyImage) {
    if (image.type === 'tenant') {
      const index = this.tenantImages.findIndex((img) => img.url === image.url);
      if (index > -1) {
        this.tenantImages.splice(index, 1);
      }
    }
  }

  openImageModal(image: PropertyImage) {
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
            return this.loadPropertyImages();
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
    if (!this.tenant?.propertyId || !this.tenant?.landlordId) {
      return of(null);
    }

    // Load property images from backend
    return this.propertyService
      .getPropertyImagesUrl(this.tenant.landlordId, this.tenant.propertyId)
      .pipe(
        switchMap((result) => {
          if (result?.success && result.entity) {
            this.landlordImages = result.entity.map((img: IDocument) => ({
              id: img.id || 0,
              url: img.url || '',
              name: img.name || 'Property Image',
              type: 'landlord',
              uploadedBy: 'Landlord',
              uploadedOn: new Date(img.uploadedOn || Date.now()),
              description: img.description || '',
            }));
          } else {
            this.landlordImages = [];
          }

          // Load tenant uploaded images (from documents)
          return this.tenantService.getTenantDocuments(this.tenant!.id!);
        }),
        switchMap((tenantDocsResult) => {
          if (
            tenantDocsResult?.status === ResultStatusType.Success &&
            tenantDocsResult.entity
          ) {
            this.tenantImages = tenantDocsResult.entity
              .filter(
                (doc) => doc.category === DocumentCategory.PropertyCondition,
              )
              .map((doc) => ({
                id: doc.id || 0,
                url: doc.url || '',
                name: doc.name || 'Tenant Image',
                type: 'tenant',
                uploadedBy: 'Tenant',
                uploadedOn: new Date(doc.uploadedOn || ''),
                description: doc.description || '',
              }));
          } else {
            this.tenantImages = [];
          }
          return of(null);
        }),
      );
  }
}
