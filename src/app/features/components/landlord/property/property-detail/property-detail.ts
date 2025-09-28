import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import {
  AlertService,
  NgButton,
  NgCardComponent,
  NgDivider,
  NgIconComponent,
  NgMenuComponent,
  NgMenuItemDirective,
  NgMenuTriggerDirective,
} from '../../../../../../../projects/shared/src/public-api';
import { Result } from '../../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../../oauth/service/oauth.service';
import {
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
import { ILandlord } from '../../../../models/landlord';
import { IProperty } from '../../../../models/property';
import { CommonService } from '../../../../service/common.service';
import { PropertyService } from '../../../../service/property.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgCardComponent,
    NgButton,
    NgIconComponent,
    NgMenuComponent,
    NgDivider,
    NgMenuTriggerDirective,
    NgMenuItemDirective,
  ],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss',
})
export class PropertyDetail implements OnInit {
  readonly selectedProperties = input<IProperty | null>(null);
  readonly backToList = output<void>();

  initPage$!: Observable<boolean>;
  property!: IProperty;
  userdetail: Partial<IUserDetail> = {};
  propertiesImages: IDocument[] = [];
  selectedImage!: IDocument;
  defaultImage: string =
    'https://via.placeholder.com/800x400/667eea/ffffff?text=Property+Image';
  landlordDetails!: ILandlord;

  private propertyTypeOptions = propertyTypeOptions;
  private furnishingTypeOptions = furnishingTypeOptions;
  private leaseTypeOptions = leaseTypeOptions;

  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private alertService = inject(AlertService);
  private userService = inject(OauthService);
  private commonService = inject(CommonService);

  constructor() {
    this.userdetail = this.userService.getUserInfo();
    this.landlordDetails = this.commonService.getLandlordDetails();
  }

  ngOnInit() {
    this.loadProperty();
    this.getPropertyImages(this.landlordDetails.id!, this.property.id!);
  }

  selectImage(image: IDocument) {
    this.selectedImage = image;
  }

  openGallery() {
    // Implement image gallery modal
    console.log('Opening image gallery...');
  }

  getStatusClass(): string {
    if (!this.property?.status) return '';
    return `status-${this.property.status}`;
  }

  getStatusIcon(): string {
    switch (this.property?.status) {
      case PropertyStatus.Listed:
        return 'visibility';
      case PropertyStatus.Draft:
        return 'edit';
      case PropertyStatus.Rented:
        return 'home';
      case PropertyStatus.Archived:
        return 'archive';
      default:
        return 'help_outline';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Not specified';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-IN');
  }

  goBack() {
    this.backToList.emit();
  }

  editProperty() {
    if (this.property?.id) {
      this.router.navigate(['/landlord/property/edit', this.property.id]);
    }
  }

  shareProperty() {
    if (navigator.share) {
      navigator.share({
        title: this.property?.title || 'Property Details',
        text: `Check out this property: ${this.property?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Property link copied to clipboard!');
      });
    }
  }

  markAsFavorite() {
    console.log('Adding to favorites...');
    // Implement favorite functionality
    alert('Property added to favorites!');
  }

  reportProperty() {
    console.log('Reporting property...');
    // Implement report functionality
    alert('Property reported. Thank you for your feedback.');
  }

  downloadDetails() {
    console.log('Downloading property details...');
    // Implement PDF download functionality
    alert('Property details will be downloaded shortly.');
  }

  deleteProperty() {
    const confirmed = confirm(
      'Are you sure you want to delete this property? This action cannot be undone.',
    );
    if (confirmed) {
      console.log('Deleting property...');
      // Implement delete functionality
      alert('Property deleted successfully.');
      this.router.navigate(['/landlord/property/dashboard']);
    }
  }

  showOnMap() {
    // Implement map functionality
    console.log('Opening map view...');
    alert('Map view coming soon!');
  }

  getPropertyType(propertyTypes: PropertyType): string {
    return this.propertyTypeOptions[propertyTypes].label;
  }

  getFurnishingType(furnishTypes: FurnishingType): string {
    return this.furnishingTypeOptions[furnishTypes].label;
  }

  getLeaseType(leaseTypes: LeaseType): string {
    return this.leaseTypeOptions[leaseTypes].label;
  }

  private loadProperty() {
    this.property = this.selectedProperties()!;
  }

  private getPropertyImages(landlordId: number, propertyId: number) {
    this.propertyService
      .getPropertyImagesUrl(landlordId, propertyId)
      .subscribe((res: Result<IDocument[]>) => {
        this.propertiesImages = res.entity;
        if (this.property) {
          this.property.documents = this.propertiesImages;
          this.selectedImage = this.propertiesImages[0] || this.defaultImage;
          this.initPage$ = of(true);
        }
      });
  }
}
