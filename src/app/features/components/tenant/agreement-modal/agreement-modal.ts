import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgButton,
  NgCardComponent,
  NgCheckbox,
  NgDialogService,
  NgIconComponent,
  NgLabelComponent,
} from 'shared';

import { ResultStatusType } from '../../../../common/enums/common.enums';
import { ITenant } from '../../../models/tenant';
import { TenantService } from '../../../service/tenant.service';

@Component({
  selector: 'app-agreement-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgCardComponent,
    NgButton,
    NgCheckbox,
    NgIconComponent,
    NgLabelComponent,
  ],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>
            <i class="material-icons">description</i>
            Rental Agreement Acceptance
          </h2>
          <ng-button
            [type]="'icon'"
            [icon]="'close'"
            [buttonType]="'button'"
            [cssClass]="'close-btn'"
            (buttonClick)="onCancel()"
          />
        </div>

        <div class="modal-body">
          @if (tenant) {
            <div class="agreement-info">
              <div class="info-section">
                <h3>Property Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <ng-label
                      [label]="'Property:'"
                      [toolTip]="'Property name'"
                    />
                    <span>{{ tenant.propertyName || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <ng-label [label]="'Tenant:'" [toolTip]="'Tenant name'" />
                    <span>{{ tenant.name }}</span>
                  </div>
                  <div class="info-item">
                    <ng-label
                      [label]="'Monthly Rent:'"
                      [toolTip]="'Monthly rental amount'"
                    />
                    <span>₹{{ (tenant.rentAmount | number) || 0 }}</span>
                  </div>
                  <div class="info-item">
                    <ng-label
                      [label]="'Security Deposit:'"
                      [toolTip]="'Security deposit amount'"
                    />
                    <span>₹{{ (tenant.securityDeposit | number) || 0 }}</span>
                  </div>
                  <div class="info-item">
                    <ng-label
                      [label]="'Tenancy Period:'"
                      [toolTip]="'Duration of the lease'"
                    />
                    <span>{{ tenant.leaseDuration || 12 }} months</span>
                  </div>
                  <div class="info-item">
                    <ng-label
                      [label]="'Start Date:'"
                      [toolTip]="'Tenancy start date'"
                    />
                    <span>{{
                      (tenant.tenancyStartDate | date: 'MMM dd, yyyy') || 'N/A'
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="agreement-content">
                <h3>Agreement Terms</h3>
                <div class="terms-container">
                  <div class="term-item">
                    <i class="material-icons term-icon">check_circle</i>
                    <span
                      >Monthly rent of ₹{{ tenant.rentAmount }} is due on
                      {{ (tenant.rentDueDate | date: 'dd') || '1st' }} of each
                      month</span
                    >
                  </div>
                  <div class="term-item">
                    <i class="material-icons term-icon">check_circle</i>
                    <span
                      >Security deposit of ₹{{ tenant.securityDeposit }} has
                      been received</span
                    >
                  </div>
                  <div class="term-item">
                    <i class="material-icons term-icon">check_circle</i>
                    <span
                      >Notice period of {{ tenant.noticePeriod || 30 }} days
                      required for termination</span
                    >
                  </div>
                  <div class="term-item">
                    <i class="material-icons term-icon">check_circle</i>
                    <span
                      >Maintenance charges of ₹{{
                        tenant.maintenanceCharges || 0
                      }}
                      per month (if applicable)</span
                    >
                  </div>
                  <div class="term-item">
                    <i class="material-icons term-icon">check_circle</i>
                    <span
                      >Tenant is responsible for keeping the property in good
                      condition</span
                    >
                  </div>
                  <div class="term-item">
                    <i class="material-icons term-icon">check_circle</i>
                    <span
                      >All utility bills and maintenance requests should be
                      handled through the tenant portal</span
                    >
                  </div>
                </div>
              </div>

              <div class="acceptance-section">
                <div class="checkbox-container">
                  <ng-checkbox
                    [label]="
                      'I, ' +
                      tenant.name +
                      ', acknowledge that I have read and understood all the terms and conditions of this rental agreement. I agree to abide by all the terms mentioned above and accept this agreement.'
                    "
                    [uniqueId]="'agreement-accept'"
                    [(ngModel)]="agreementAccepted"
                  />
                </div>

                @if (isPrimaryTenant) {
                  <div class="primary-tenant-note">
                    <i class="material-icons">info</i>
                    <span
                      >As the primary tenant, your acceptance will activate the
                      tenancy for all family members/co-tenants.</span
                    >
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="modal-footer">
          <ng-button
            variant="secondary"
            size="medium"
            [disabled]="isAccepting"
            (click)="onCancel()"
          >
            Cancel
          </ng-button>
          <ng-button
            variant="primary"
            size="medium"
            [disabled]="!agreementAccepted || isAccepting"
            [loading]="isAccepting"
            (click)="onAccept()"
          >
            {{ isAccepting ? 'Accepting...' : 'Accept Agreement' }}
          </ng-button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
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
        max-width: 800px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        animation: modalSlideIn 0.3s ease-out;
      }

      @keyframes modalSlideIn {
        from {
          transform: translateY(-50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .modal-header h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.5rem;
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
      }

      .close-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .modal-body {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .agreement-info {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .info-section h3,
      .agreement-content h3 {
        margin: 0 0 16px 0;
        color: #2d3748;
        font-size: 1.25rem;
        font-weight: 600;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 8px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .info-item label {
        font-weight: 600;
        color: #4a5568;
        font-size: 0.875rem;
      }

      .info-item span {
        color: #2d3748;
        font-size: 1rem;
      }

      .terms-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .term-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        background-color: #f7fafc;
        border-radius: 8px;
        border-left: 4px solid #48bb78;
      }

      .term-icon {
        color: #48bb78;
        font-size: 20px;
        margin-top: 2px;
      }

      .term-item span {
        color: #2d3748;
        line-height: 1.5;
      }

      .acceptance-section {
        background-color: #fff5f5;
        border: 1px solid #fed7d7;
        border-radius: 8px;
        padding: 20px;
      }

      .checkbox-container {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }

      .checkbox-container input[type='checkbox'] {
        margin-top: 4px;
        transform: scale(1.2);
      }

      .checkbox-container label {
        color: #2d3748;
        line-height: 1.6;
        cursor: pointer;
      }

      .primary-tenant-note {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: #ebf8ff;
        border: 1px solid #bee3f8;
        border-radius: 6px;
        color: #2b6cb0;
        font-size: 0.875rem;
      }

      .primary-tenant-note i {
        color: #3182ce;
      }

      .modal-footer {
        background-color: #f7fafc;
        padding: 20px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid #e2e8f0;
      }

      @media (max-width: 768px) {
        .modal-container {
          width: 95%;
          margin: 20px;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .modal-footer {
          flex-direction: column-reverse;
        }
      }
    `,
  ],
})
export class AgreementModalComponent {
  @Input() tenant: ITenant | null = null;
  @Input() isPrimaryTenant = false;
  @Output() accepted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  agreementAccepted = false;
  isAccepting = false;

  private tenantService = inject(TenantService);
  private dialogService = inject(NgDialogService);

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  async onAccept() {
    if (!this.agreementAccepted || !this.tenant || this.isAccepting) {
      return;
    }

    this.isAccepting = true;

    try {
      const result = await this.tenantService
        .acceptAgreement(this.tenant.id!)
        .toPromise();

      if (result?.status === ResultStatusType.Success) {
        this.accepted.emit();
      } else {
        this.showError('Failed to accept agreement. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting agreement:', error);
      this.showError('An error occurred while accepting the agreement.');
    } finally {
      this.isAccepting = false;
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  private showError(message: string) {
    this.dialogService.alert({
      title: 'Error',
      message,
      confirmText: 'OK',
    });
  }
}
