import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgButton } from 'shared';

import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { ITenant } from '../../../models/tenant';
import { TenantService } from '../../../service/tenant.service';
import { ChatbotComponent } from '../../chatbot/chatbot.component';
import { AgreementModalComponent } from '../agreement-modal/agreement-modal.component';

@Component({
  selector: 'app-tenant-portal',
  standalone: true,
  imports: [CommonModule, AgreementModalComponent, ChatbotComponent, NgButton],
  templateUrl: './tenant-portal.html',
  styleUrl: './tenant-portal.scss',
})
export class TenantPortalComponent implements OnInit {
  // Current user data
  userDetail: Partial<IUserDetail> = {};
  currentTenant: ITenant | null = null;

  // UI state
  loading = true;
  showAgreementModal = false;

  // Agreement status
  isAgreementAccepted = false;
  isPrimaryTenant = false;
  primaryTenantName = '';
  agreementStatus: unknown = null;

  // private alertService = inject(AlertService); // TODO: Add alert service
  private tenantService = inject(TenantService);
  private userService = inject(OauthService);
  public router = inject(Router);

  constructor() {
    this.userDetail = this.userService.getUserInfo();
  }

  ngOnInit() {
    this.loadTenantData();
  }

  private async loadTenantData() {
    try {
      this.loading = true;

      // Get current tenant data based on logged-in user
      const userEmail = this.userDetail.email;
      if (!userEmail) {
        this.showError('User email not found');
        return;
      }

      // Find tenant by email
      const result = await this.tenantService
        .getTenantByEmail(userEmail)
        .toPromise();

      if (
        result &&
        result.status === ResultStatusType.Success &&
        result.entity
      ) {
        this.currentTenant = result.entity;
        this.isPrimaryTenant = this.currentTenant.isPrimary || false;

        // Check agreement status
        await this.checkAgreementStatus();
      } else {
        this.showError('Tenant data not found');
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
      this.showError('Failed to load tenant information');
    } finally {
      this.loading = false;
    }
  }

  private async checkAgreementStatus() {
    if (!this.currentTenant) return;

    try {
      const statusResult = await this.tenantService
        .getAgreementStatus(this.currentTenant.id!)
        .toPromise();

      if (
        statusResult &&
        statusResult.status === ResultStatusType.Success &&
        statusResult.entity
      ) {
        const status = statusResult.entity as any;
        this.agreementStatus = status;
        this.isAgreementAccepted = status.agreementAccepted || false;
        this.primaryTenantName = status.tenantName || '';

        // Show agreement modal if needed
        if (
          !this.isAgreementAccepted &&
          this.isPrimaryTenant &&
          status.agreementCreated
        ) {
          this.showAgreementModal = true;
        }
      }
    } catch (error) {
      console.error('Error checking agreement status:', error);
    }
  }

  onAgreementAccepted() {
    this.showAgreementModal = false;
    this.isAgreementAccepted = true;
    this.showSuccess(
      'Agreement accepted successfully! Welcome to your tenant portal.',
    );
  }

  onAgreementCancelled() {
    this.showAgreementModal = false;
    this.showInfo(
      'Please accept the agreement to activate your tenancy and access all portal features.',
    );
  }

  navigateToSection(section: string) {
    if (!this.isAgreementAccepted) {
      this.showWarning(
        'Please accept the rental agreement first to access portal features.',
      );
      return;
    }
    this.router.navigate(['/tenant', section]);
  }

  showAgreementDetails() {
    if (this.isPrimaryTenant && !this.isAgreementAccepted) {
      this.showAgreementModal = true;
    }
  }

  // Alert helper methods
  private showSuccess(message: string) {
    console.log('Success:', message);
    // Replace with actual alert service implementation
  }

  private showError(message: string) {
    console.error('Error:', message);
    // Replace with actual alert service implementation
  }

  private showInfo(message: string) {
    console.log('Info:', message);
    // Replace with actual alert service implementation
  }

  private showWarning(message: string) {
    console.warn('Warning:', message);
    // Replace with actual alert service implementation
  }
}
