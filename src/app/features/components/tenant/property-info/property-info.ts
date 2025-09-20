.property-info {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: #4a5568;
      font-size: 0.9rem;

      &:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
        transform: translateX(-2px);
      }

      i {
        font-size: 20px;
      }
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2d3748;
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    gap: 20px;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e3f2fd;
      border-top: 4px solid #2196f3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  // Card styles
  ng-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e2e8f0;

      i {
        font-size: 24px;
        color: #4299e1;
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #2d3748;
      }
    }
  }

  // Property details grid
  .property-grid,
  .rental-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      span {
        font-size: 1rem;
        color: #2d3748;

        &.amount {
          font-size: 1.1rem;
          font-weight: 600;
          color: #38a169;
        }
      }
    }
  }

  // Images section
  .images-section {
    margin-bottom: 32px;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #2d3748;

        i {
          font-size: 20px;
          color: #4299e1;
        }
      }
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #2d3748;

      i {
        font-size: 20px;
        color: #4299e1;
      }
    }
  }

  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;

    .image-item {
      position: relative;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

      .image-info {
        padding: 12px;

        .image-name {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .image-date {
          font-size: 0.8rem;
          color: #718096;
        }
      }

      .delete-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;

        &:hover {
          background: #e53e3e;
        }

        i {
          font-size: 18px;
        }
      }

      &:hover .delete-btn {
        opacity: 1;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #718096;

    i {
      font-size: 48px;
      color: #cbd5e0;
      margin-bottom: 16px;
    }

    p {
      margin: 0 0 8px 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .sub-text {
      font-size: 0.9rem;
      font-weight: normal;
    }
  }

  // Amenities grid
  .amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;

    .amenity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f0fff4;
      border: 1px solid #c6f6d5;
      border-radius: 6px;

      i {
        color: #38a169;
        font-size: 18px;
      }

      span {
        font-size: 0.9rem;
        color: #2d3748;
      }
    }
  }

  // Modal styles
  .modal-overlay,
  .image-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

    .modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.2s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .modal-body {
      padding: 24px;
      max-height: 50vh;
      overflow-y: auto;
    }

    .modal-footer {
      background-color: #f7fafc;
      padding: 20px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #e2e8f0;
    }
  }

  .image-modal-container {
    position: relative;
    background: white;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.9);
      }

      i {
        font-size: 20px;
      }
    }

    img {
      width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }

    .image-modal-info {
      padding: 20px;
      background: white;

      h4 {
        margin: 0 0 8px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
        color: #718096;

        &.description {
          margin-top: 8px;
          color: #4a5568;
        }
      }
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      h1 {
        font-size: 1.5rem;
      }
    }

    .property-grid,
    .rental-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .images-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .amenities-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .modal-container {
      width: 95%;
      margin: 20px;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;

    .images-grid {
      grid-template-columns: 1fr;
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgIconComponent,
  NgLabelComponent,
  FileUploadConfig,
  UploadedFile,
} from 'shared';
import { Result } from '../../../../common/models/common';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { ITenant } from '../../../models/tenant';
import { IProperty } from '../../../models/property';
import { DocumentCategory } from '../../../enums/view.enum';
import { TenantService } from '../../../service/tenant.service';
import { PropertyService } from '../../../service/property.service';
import { DocumentService } from '../../../service/document.service';

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
              <span>{{ property.pincode || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Bedrooms'"
                [toolTip]="'Number of bedrooms'"
              />
              <span>{{ property.bedrooms || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Bathrooms'"
                [toolTip]="'Number of bathrooms'"
              />
              <span>{{ property.bathrooms || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Area (sq ft)'"
                [toolTip]="'Property area in square feet'"
              />
              <span>{{ (property.area | number) || 'N/A' }}</span>
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
                >₹{{ (tenant.rentAmount | number) || 0 }}</span
              >
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Security Deposit'"
                [toolTip]="'Security deposit amount'"
              />
              <span class="amount"
                >₹{{ (tenant.securityDeposit | number) || 0 }}</span
              >
            </div>
            <div class="detail-item">
              <ng-label
                [label]="'Maintenance Charges'"
                [toolTip]="'Monthly maintenance charges'"
              />
              <span class="amount"
                >₹{{ (tenant.maintenanceCharges | number) || 0 }}</span
              >
            </div>
            <div class="detail-item">
              <ng-label [label]="'Tenancy Start Date'" [toolTip]="'Date when tenancy begins'" />
              <span>{{
                (tenant.tenancyStartDate | date: 'MMM dd, yyyy') || 'N/A'
              }}</span>
            </div>
            <div class="detail-item">
              <ng-label [label]="'Tenancy End Date'" [toolTip]="'Date when tenancy ends'" />
              <span>{{
                (tenant.tenancyEndDate | date: 'MMM dd, yyyy') || 'N/A'
              }}</span>
            </div>
            <div class="detail-item">
              <ng-label [label]="'Rent Due Date'" [toolTip]="'Day of month when rent is due'" />
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
        @if (property.amenities && property.amenities.length > 0) {
          <ng-card class="amenities-card">
            <div class="card-header">
              <i class="material-icons">apartment</i>
              <h2>Amenities</h2>
            </div>

            <div class="amenities-grid">
              @for (amenity of property.amenities; track amenity) {
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
                [loading]="uploading"
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
        this.landlordImages = result.entity.map((img: any) => ({
          id: img.id,
          url: img.url,
          name: img.name || 'Property Image',
          type: 'landlord',
          uploadedBy: 'Landlord',
          uploadedOn: new Date(img.uploadedOn || img.dateCreated),
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
    this.selectedFiles = this.selectedFiles.filter(
      (f) => f.url !== event.file.url,
    );
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
}
