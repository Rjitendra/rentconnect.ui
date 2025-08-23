import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

import { IProperty } from '../../../../models/property';
import { PropertyType, FurnishingType, LeaseType, PropertyStatus } from '../../../../enums/view.enum';

@Component({
  selector: 'app-property-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './property-add.html',
  styleUrl: './property-add.scss'
})
export class PropertyAdd implements OnInit {
  @Output() backToList = new EventEmitter<void>();
  
  propertyForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
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
      hasInternet: [false]
    });
  }

  onSubmit() {
    if (this.propertyForm.valid) {
      const propertyData: IProperty = {
        ...this.propertyForm.value,
        landlordId: 1, // This should come from authenticated user
        status: PropertyStatus.Listed,
        createdOn: new Date(),
        updatedOn: new Date()
      };

      console.log('Property data to submit:', propertyData);
      
      // Here you would typically call a service to save the property
      // this.propertyService.createProperty(propertyData).subscribe(
      //   response => {
      //     // Navigate to property detail or dashboard
      //     this.router.navigate(['/landlord/property/detail', response.id]);
      //   },
      //   error => {
      //     console.error('Error creating property:', error);
      //   }
      // );

      // For now, just navigate to a success page or back to dashboard
      alert('Property listed successfully!');
      this.router.navigate(['/landlord/property/dashboard']);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.propertyForm.controls).forEach(key => {
        this.propertyForm.get(key)?.markAsTouched();
      });
      
      alert('Please fill in all required fields correctly.');
    }
  }

  saveDraft() {
    const propertyData: IProperty = {
      ...this.propertyForm.value,
      landlordId: 1, // This should come from authenticated user
      status: PropertyStatus.Draft,
      createdOn: new Date(),
      updatedOn: new Date()
    };

    console.log('Property draft data:', propertyData);
    
    // Here you would typically call a service to save the draft
    // this.propertyService.saveDraft(propertyData).subscribe(
    //   response => {
    //     alert('Draft saved successfully!');
    //   },
    //   error => {
    //     console.error('Error saving draft:', error);
    //   }
    // );

    alert('Draft saved successfully!');
  }

  goBack() {
    // Emit event to parent component instead of router navigation
    this.backToList.emit();
  }
}