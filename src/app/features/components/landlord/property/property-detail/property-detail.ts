import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { IProperty } from '../../../../models/property';
import { PropertyStatus, PropertyType, FurnishingType, LeaseType } from '../../../../enums/view.enum';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss'
})
export class PropertyDetail implements OnInit {
  @Output() backToList = new EventEmitter<void>();
  
  property: IProperty | null = null;
  selectedImage: string = '';
  defaultImage: string = 'https://via.placeholder.com/800x400/667eea/ffffff?text=Property+Image';
  
  propertyImages: string[] = [
    'https://via.placeholder.com/800x400/667eea/ffffff?text=Main+View',
    'https://via.placeholder.com/800x400/764ba2/ffffff?text=Living+Room',
    'https://via.placeholder.com/800x400/667eea/ffffff?text=Bedroom',
    'https://via.placeholder.com/800x400/764ba2/ffffff?text=Kitchen',
    'https://via.placeholder.com/800x400/667eea/ffffff?text=Bathroom'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProperty();
    this.selectedImage = this.propertyImages[0] || this.defaultImage;
  }

  private loadProperty() {
    // Get property ID from route
    const propertyId = this.route.snapshot.paramMap.get('id');
    
    // Mock property data - in real app, this would come from a service
    this.property = {
      id: 1,
      landlordId: 1,
      title: 'Luxurious 3BHK Apartment in Prime Location',
      description: 'This beautiful 3BHK apartment is located in the heart of the city with excellent connectivity to metro stations, shopping malls, and schools. The apartment features modern amenities, spacious rooms, and a stunning view of the city skyline. Perfect for families looking for a comfortable and convenient lifestyle.',
      propertyType: PropertyType.Apartment,
      bhkConfiguration: '3BHK',
      floorNumber: 5,
      totalFloors: 12,
      carpetAreaSqFt: 1200,
      builtUpAreaSqFt: 1450,
      furnishingType: FurnishingType.SemiFurnished,
      numberOfBathrooms: 2,
      numberOfBalconies: 2,
      
      // Location
      addressLine1: 'Tower A, Skyline Residency',
      addressLine2: 'Sector 18, Noida Extension',
      landmark: 'Metro Station',
      locality: 'Noida Extension',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pinCode: '201009',
      
      // Rent Details
      monthlyRent: 28000,
      securityDeposit: 56000,
      isNegotiable: true,
      availableFrom: new Date('2024-02-01'),
      leaseType: LeaseType.LongTerm,
      
      // Amenities
      hasLift: true,
      hasParking: true,
      hasPowerBackup: true,
      hasWaterSupply: true,
      hasGasPipeline: false,
      hasSecurity: true,
      hasInternet: true,
      
      // Status
      status: PropertyStatus.Listed,
      createdOn: new Date('2024-01-15'),
      updatedOn: new Date('2024-01-20')
    };
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  openGallery() {
    // Implement image gallery modal
    console.log('Opening image gallery...');
  }

  getStatusClass(): string {
    if (!this.property?.status) return '';
    return `status-${this.property.status.toLowerCase()}`;
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
      day: 'numeric' 
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-IN');
  }

  goBack() {
    // Emit event to parent component instead of router navigation
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
        url: window.location.href
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
    const confirmed = confirm('Are you sure you want to delete this property? This action cannot be undone.');
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
}