import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
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
    NgLabelComponent,
    NgFileUploadComponent,
  ],
  template: `
    <div class="property-info">
      <div class="page-header">
        <ng-button
          [type]="'text'"
          [label]="'Back to Portal'"
          [icon]="'arrow_back'"
          [buttonType]="'button'"
          [cssClass]="'back-btn'"
          (buttonClick)="goBack()"
        />
        <h1>Property Information</h1>
      </div>

      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading property information...</p>
        </div>
      }

      @if (!loading && property && tenant) {
        <!-- Property Details -->
        <ng-card class="property-details-card">
          <div class="card-header">
            <i class="material-icons">home</i>
            <h2>Property Details</h2>
          </div>

          <div class="property-grid">
            <div class="detail-item">
              <ng-label
                [label]="'Property Name'"
                [toolTip]="'Name of the property'"
              />
              <span>{{ property.title || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Property Type'"
                [toolTip]="'Type of property (apartment, house, etc.)'"
              />
              <span>{{ property.propertyType || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Address'"
                [toolTip]="'Full property address'"
              />
              <span>{{ getFullAddress() }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'City'"
                [toolTip]="'City where property is located'"
              />
              <span>{{ property.city || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'State'"
                [toolTip]="'State where property is located'"
              />
              <span>{{ property.state || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'PIN Code'"
                [toolTip]="'Postal code of the property'"
              />
              <span>{{ property['pincode'] || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label [label]="'Bedrooms'" [toolTip]="'Number of bedrooms'" />
              <span>{{ property['bedrooms'] || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Bathrooms'"
                [toolTip]="'Number of bathrooms'"
              />
              <span>{{ property['bathrooms'] || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Area (sq ft)'"
                [toolTip]="'Property area in square feet'"
              />
              <span>{{ (property['area'] | number) || 'N/A' }}</span>
            </div>
          </div>
        </ng-card>

        <!-- Rental Information -->
        <ng-card class="rental-info-card">
          <div class="card-header">
            <i class="material-icons">receipt_long</i>
            <h2>Rental Information</h2>
          </div>

          <div class="rental-grid">
            <div class="detail-item">
              <ng-label
                [label]="'Monthly Rent'"
                [toolTip]="'Monthly rental amount'"
              />
              <span class="amount"
                >â‚¹{{ (tenant.rentAmount | number) || 0 }}</span
              >
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Security Deposit'"
                [toolTip]="'Security deposit amount'"
              />
              <span class="amount"
                >â‚¹{{ (tenant.securityDeposit | number) || 0 }}</span
              >
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Maintenance Charges'"
                [toolTip]="'Monthly maintenance charges'"
              />
              <span class="amount"
                >â‚¹{{ (tenant.maintenanceCharges | number) || 0 }}</span
              >
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Tenancy Start Date'"
                [toolTip]="'Date when tenancy begins'"
              />
              <span>{{
                (tenant.tenancyStartDate | date: 'MMM dd, yyyy') || 'N/A'
              }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Tenancy End Date'"
                [toolTip]="'Date when tenancy ends'"
              />
              <span>{{
                (tenant.tenancyEndDate | date: 'MMM dd, yyyy') || 'N/A'
              }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Rent Due Date'"
                [toolTip]="'Day of month when rent is due'"
              />
              <span
                >{{ (tenant.rentDueDate | date: 'dd') || 'N/A' }} of every
                month</span
              >
            </div>
          </div>
        </ng-card>

        <!-- Property Images -->
        <ng-card class="property-images-card">
          <div class="card-header">
            <i class="material-icons">photo_library</i>
            <h2>Property Images</h2>
          </div>

          <!-- Landlord Images -->
          @if (landlordImages.length > 0) {
            <div class="images-section">
              <h3>
                <i class="material-icons">business</i>
                Property Photos by Landlord
              </h3>
              <div class="images-grid">
                @for (image of landlordImages; track image.url) {
                  <div class="image-item">
                    <img
                      [src]="image.url"
                      [alt]="image.name"
                      (click)="openImageModal(image)"
                    />
                    <div class="image-info">
                      <span class="image-name">{{ image.name }}</span>
                      <span class="image-date">{{
                        image.uploadedOn | date: 'MMM dd, yyyy'
                      }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Tenant Images -->
          <div class="images-section">
            <div class="section-header">
              <h3>
                <i class="material-icons">person</i>
                Your Property Photos
              </h3>
              <ng-button
                variant="primary"
                size="small"
                (click)="showUploadModal = true"
              >
                <i class="material-icons">add_photo_alternate</i>
                Upload Photos
              </ng-button>
            </div>

            @if (tenantImages.length > 0) {
              <div class="images-grid">
                @for (image of tenantImages; track image.url) {
                  <div class="image-item">
                    <img
                      [src]="image.url"
                      [alt]="image.name"
                      (click)="openImageModal(image)"
                    />
                    <div class="image-info">
                      <span class="image-name">{{ image.name }}</span>
                      <span class="image-date">{{
                        image.uploadedOn | date: 'MMM dd, yyyy'
                      }}</span>
                    </div>
                    <ng-button
                      [type]="'icon'"
                      [icon]="'delete'"
                      [buttonType]="'button'"
                      [tooltip]="'Delete image'"
                      [cssClass]="'delete-btn'"
                      (buttonClick)="deleteImage(image)"
                    />
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <i class="material-icons">photo_camera</i>
                <p>No photos uploaded yet</p>
                <p class="sub-text">
                  Upload photos to document the property condition
                </p>
              </div>
            }
          </div>
        </ng-card>

        <!-- Amenities -->
        @if (property['amenities'] && property['amenities'].length > 0) {
          <ng-card class="amenities-card">
            <div class="card-header">
              <i class="material-icons">apartment</i>
              <h2>Amenities</h2>
            </div>

            <div class="amenities-grid">
              @for (amenity of property['amenities']; track amenity) {
                <div class="amenity-item">
                  <i class="material-icons">check_circle</i>
                  <span>{{ amenity }}</span>
                </div>
              }
            </div>
          </ng-card>
        }
      }

      <!-- Upload Modal -->
      @if (showUploadModal) {
        <div class="modal-overlay" (click)="closeUploadModal()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Upload Property Photos</h3>
              <ng-button
                [type]="'icon'"
                [icon]="'close'"
                [buttonType]="'button'"
                [cssClass]="'close-btn'"
                (buttonClick)="closeUploadModal()"
              />
            </div>

            <div class="modal-body">
              <ng-file-upload
                [config]="fileUploadConfig"
                (filesSelected)="onFilesSelected($event)"
                (fileRemoved)="onFileRemoved($event)"
              />
            </div>

            <div class="modal-footer">
              <ng-button variant="secondary" (click)="closeUploadModal()">
                Cancel
              </ng-button>
              <ng-button
                variant="primary"
                [disabled]="selectedFiles.length === 0 || uploading"
                (click)="uploadFiles()"
              >
                {{ uploading ? 'Uploading...' : 'Upload Photos' }}
              </ng-button>
            </div>
          </div>
        </div>
      }

      <!-- Image Modal -->
      @if (selectedImage) {
        <div class="image-modal-overlay" (click)="closeImageModal()">
          <div class="image-modal-container" (click)="$event.stopPropagation()">
            <ng-button
              [type]="'icon'"
              [icon]="'close'"
              [buttonType]="'button'"
              [cssClass]="'close-btn'"
              (buttonClick)="closeImageModal()"
            />
            <img [src]="selectedImage.url" [alt]="selectedImage.name" />
            <div class="image-modal-info">
              <h4>{{ selectedImage.name }}</h4>
              <p>
                Uploaded by {{ selectedImage.uploadedBy }} on
                {{ selectedImage.uploadedOn | date: 'MMM dd, yyyy' }}
              </p>
              @if (selectedImage.description) {
                <p class="description">{{ selectedImage.description }}</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
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

  private async loadPropertyInfo() {
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

        // Get property details
        await this.loadPropertyDetails();
        await this.loadPropertyImages();
      }
    } catch (error) {
      console.error('Error loading property info:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadPropertyDetails() {
    if (!this.tenant?.propertyId) return;

    try {
      const propertyResult = await this.propertyService
        .getPropertyById(this.tenant.propertyId)
        .toPromise();

      if (propertyResult?.success && propertyResult.entity) {
        this.property = propertyResult.entity;
      }
    } catch (error) {
      console.error('Error loading property details:', error);
    }
  }

  private async loadPropertyImages() {
    if (!this.tenant?.propertyId || !this.tenant?.landlordId) return;

    try {
      // Load property images from backend
      const result = await this.propertyService
        .getPropertyImagesUrl(this.tenant.landlordId, this.tenant.propertyId)
        .toPromise();

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
      const tenantDocsResult = await this.tenantService
        .getTenantDocuments(this.tenant.id!)
        .toPromise();
      if (
        tenantDocsResult?.status === ResultStatusType.Success &&
        tenantDocsResult.entity
      ) {
        this.tenantImages = tenantDocsResult.entity
          .filter((doc) => doc.category === DocumentCategory.PropertyCondition)
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
    } catch (error) {
      console.error('Error loading property images:', error);
      this.landlordImages = [];
      this.tenantImages = [];
    }
  }
}
