/* eslint-disable @typescript-eslint/require-await */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  NgButton,
  NgCardComponent,
  NgLabelComponent,
  NgMatTable,
  NgSelectComponent,
  SelectOption,
  TableColumn,
} from '../../../../../../../projects/shared/src/public-api';
import { ResultStatusType } from '../../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../../oauth/service/oauth.service';
import { ITenant } from '../../../../models/tenant';
import { TenantService } from '../../../../service/tenant.service';

interface PaymentRecord {
  id: number;
  month: string;
  year: number;
  rentAmount: number;
  maintenanceCharges: number;
  lateCharges: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentDate: Date | string | null;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  dueDate: Date | string;
  transactionId?: string;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  nextDueAmount: number;
  nextDueDate: Date | string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgCardComponent,
    NgButton,
    NgLabelComponent,
    NgMatTable,
    NgSelectComponent,
  ],
  template: `
    <div class="payments">
      <div class="page-header">
        <ng-button
          [type]="'text'"
          [label]="'Back to Portal'"
          [icon]="'arrow_back'"
          [buttonType]="'button'"
          [cssClass]="'back-btn'"
          (buttonClick)="goBack()"
        />
        <h1>Rent & Payments</h1>
      </div>

      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading payment information...</p>
        </div>
      }

      @if (!loading && tenant) {
        <!-- Payment Summary -->
        <div class="summary-grid">
          <ng-card class="summary-card total-paid">
            <div class="summary-content">
              <div class="summary-icon">
                <i class="material-icons">check_circle</i>
              </div>
              <div class="summary-details">
                <h3>Total Paid</h3>
                <span class="amount"
                  >₹{{ (paymentSummary.totalPaid | number) || 0 }}</span
                >
              </div>
            </div>
          </ng-card>

          <ng-card class="summary-card total-pending">
            <div class="summary-content">
              <div class="summary-icon">
                <i class="material-icons">schedule</i>
              </div>
              <div class="summary-details">
                <h3>Total Pending</h3>
                <span class="amount"
                  >₹{{ (paymentSummary.totalPending | number) || 0 }}</span
                >
              </div>
            </div>
          </ng-card>

          <ng-card class="summary-card total-overdue">
            <div class="summary-content">
              <div class="summary-icon">
                <i class="material-icons">warning</i>
              </div>
              <div class="summary-details">
                <h3>Overdue</h3>
                <span class="amount"
                  >₹{{ (paymentSummary.totalOverdue | number) || 0 }}</span
                >
              </div>
            </div>
          </ng-card>

          <ng-card class="summary-card next-due">
            <div class="summary-content">
              <div class="summary-icon">
                <i class="material-icons">event</i>
              </div>
              <div class="summary-details">
                <h3>Next Due</h3>
                <span class="amount"
                  >₹{{ (paymentSummary.nextDueAmount | number) || 0 }}</span
                >
                <span class="due-date"
                  >Due:
                  {{ paymentSummary.nextDueDate | date: 'MMM dd, yyyy' }}</span
                >
              </div>
            </div>
          </ng-card>
        </div>

        <!-- Current Month Payment -->
        @if (currentMonthPayment) {
          <ng-card class="current-payment-card">
            <div class="card-header">
              <i class="material-icons">payment</i>
              <h2>
                Current Month - {{ currentMonthPayment.month }}
                {{ currentMonthPayment.year }}
              </h2>
              <div
                class="payment-status"
                [attr.data-status]="currentMonthPayment.status"
              >
                {{ getStatusLabel(currentMonthPayment.status) }}
              </div>
            </div>

            <div class="payment-breakdown">
              <div class="breakdown-grid">
                <div class="breakdown-item">
                  <ng-label
                    [label]="'Rent Amount'"
                    [toolTip]="'Monthly rent amount'"
                  />
                  <span>₹{{ currentMonthPayment.rentAmount | number }}</span>
                </div>
                <div class="breakdown-item">
                  <ng-label
                    [label]="'Maintenance Charges'"
                    [toolTip]="'Monthly maintenance charges'"
                  />
                  <span
                    >₹{{
                      currentMonthPayment.maintenanceCharges | number
                    }}</span
                  >
                </div>
                @if (currentMonthPayment.lateCharges > 0) {
                  <div class="breakdown-item late-charges">
                    <ng-label
                      [label]="'Late Charges'"
                      [toolTip]="'Additional charges for late payment'"
                    />
                    <span>₹{{ currentMonthPayment.lateCharges | number }}</span>
                  </div>
                }
                <div class="breakdown-item total">
                  <ng-label
                    [label]="'Total Amount'"
                    [toolTip]="'Total amount due'"
                  />
                  <span>₹{{ currentMonthPayment.totalAmount | number }}</span>
                </div>
                @if (currentMonthPayment.paidAmount > 0) {
                  <div class="breakdown-item paid">
                    <ng-label
                      [label]="'Paid Amount'"
                      [toolTip]="'Amount already paid'"
                    />
                    <span>₹{{ currentMonthPayment.paidAmount | number }}</span>
                  </div>
                }
                @if (currentMonthPayment.pendingAmount > 0) {
                  <div class="breakdown-item pending">
                    <ng-label
                      [label]="'Pending Amount'"
                      [toolTip]="'Amount still pending'"
                    />
                    <span
                      >₹{{ currentMonthPayment.pendingAmount | number }}</span
                    >
                  </div>
                }
              </div>

              <div class="payment-actions">
                @if (currentMonthPayment.status !== 'paid') {
                  <ng-button
                    variant="primary"
                    size="large"
                    (click)="payNow(currentMonthPayment)"
                  >
                    <i class="material-icons">payment</i>
                    Pay Now - ₹{{ currentMonthPayment.pendingAmount | number }}
                  </ng-button>
                }
                <ng-button
                  variant="secondary"
                  size="medium"
                  [disabled]="currentMonthPayment.status === 'pending'"
                  (click)="downloadReceipt(currentMonthPayment)"
                >
                  <i class="material-icons">receipt</i>
                  Download Receipt
                </ng-button>
              </div>
            </div>
          </ng-card>
        }

        <!-- Payment History -->
        <ng-card class="payment-history-card">
          <div class="card-header">
            <i class="material-icons">history</i>
            <h2>Payment History</h2>
            <div class="history-filters">
              <ng-select
                [label]="'Year'"
                [placeholder]="'All Years'"
                [options]="yearOptions"
                [(ngModel)]="selectedYear"
                (selectionChange)="filterPayments()"
              />
              <ng-select
                [label]="'Status'"
                [placeholder]="'All Status'"
                [options]="statusOptions"
                [(ngModel)]="selectedStatus"
                (selectionChange)="filterPayments()"
              />
            </div>
          </div>

          @if (filteredPayments.length > 0) {
            <div class="payment-history-table">
              <ng-mat-table [data]="filteredPayments" [columns]="tableColumns">
                <!-- Custom cell templates -->
                <ng-template #monthCell let-row="row">
                  <div class="month-cell">
                    <span class="month">{{ row.month }}</span>
                    <span class="year">{{ row.year }}</span>
                  </div>
                </ng-template>

                <ng-template #amountCell let-row="row">
                  <div class="amount-cell">
                    <span class="total">₹{{ row.totalAmount | number }}</span>
                    @if (
                      row.paidAmount > 0 && row.paidAmount < row.totalAmount
                    ) {
                      <span class="paid"
                        >Paid: ₹{{ row.paidAmount | number }}</span
                      >
                    }
                  </div>
                </ng-template>

                <ng-template #statusCell let-row="row">
                  <span class="status-badge" [attr.data-status]="row.status">
                    {{ getStatusLabel(row.status) }}
                  </span>
                </ng-template>

                <ng-template #actionsCell let-row="row">
                  <div class="action-buttons">
                    @if (row.status !== 'paid') {
                      <ng-button
                        [type]="'icon'"
                        [icon]="'payment'"
                        [buttonType]="'button'"
                        [tooltip]="'Pay Now'"
                        [cssClass]="'action-btn pay'"
                        (buttonClick)="payNow(row)"
                      />
                    }
                    <ng-button
                      [type]="'icon'"
                      [icon]="'receipt'"
                      [buttonType]="'button'"
                      [disabled]="row.status === 'pending'"
                      [tooltip]="'Download Receipt'"
                      [cssClass]="'action-btn receipt'"
                      (buttonClick)="downloadReceipt(row)"
                    />
                    <ng-button
                      [type]="'icon'"
                      [icon]="'visibility'"
                      [buttonType]="'button'"
                      [tooltip]="'View Details'"
                      [cssClass]="'action-btn details'"
                      (buttonClick)="viewDetails(row)"
                    />
                  </div>
                </ng-template>
              </ng-mat-table>
            </div>
          } @else {
            <div class="empty-state">
              <i class="material-icons">receipt_long</i>
              <p>No payment records found</p>
              <p class="sub-text">
                Payment history will appear here once payments are made
              </p>
            </div>
          }
        </ng-card>

        <!-- Payment Methods -->
        <ng-card class="payment-methods-card">
          <div class="card-header">
            <i class="material-icons">credit_card</i>
            <h2>Payment Methods</h2>
          </div>

          <div class="payment-methods-grid">
            <div class="payment-method">
              <i class="material-icons">account_balance</i>
              <h4>Bank Transfer</h4>
              <p>Direct transfer to landlord's account</p>
            </div>
            <div class="payment-method">
              <i class="material-icons">credit_card</i>
              <h4>Credit/Debit Card</h4>
              <p>Pay securely with your card</p>
            </div>
            <div class="payment-method">
              <i class="material-icons">account_balance_wallet</i>
              <h4>Digital Wallet</h4>
              <p>UPI, Paytm, PhonePe, etc.</p>
            </div>
            <div class="payment-method">
              <i class="material-icons">receipt</i>
              <h4>Cheque</h4>
              <p>Traditional cheque payment</p>
            </div>
          </div>
        </ng-card>
      }
    </div>
  `,
  styleUrl: './payments.scss',
})
export class PaymentsComponent implements OnInit {
  // Data
  tenant: ITenant | null = null;
  paymentRecords: PaymentRecord[] = [];
  filteredPayments: PaymentRecord[] = [];
  currentMonthPayment: PaymentRecord | null = null;
  paymentSummary: PaymentSummary = {
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    nextDueAmount: 0,
    nextDueDate: new Date(),
  };

  // UI State
  loading = true;
  selectedYear: number | '' = '';
  selectedStatus: string = '';
  availableYears: number[] = [];

  // Dropdown options
  yearOptions: SelectOption[] = [{ value: '', label: 'All Years' }];

  statusOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'partial', label: 'Partial' },
  ];

  // User info
  userDetail: Partial<IUserDetail> = {};

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      key: 'month',
      label: 'Month/Year',
      sortable: true,
      width: '120px',
      type: 'custom',
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      width: '120px',
      type: 'text',
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      width: '140px',
      type: 'custom',
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      sortable: true,
      width: '130px',
      type: 'text',
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      sortable: true,
      width: '100px',
      type: 'text',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      type: 'custom',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: '120px',
      type: 'custom',
    },
  ];

  // Services
  private router = inject(Router);
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
  }

  ngOnInit() {
    this.loadPaymentData();
  }
  filterPayments() {
    this.filteredPayments = this.paymentRecords.filter((payment) => {
      const yearMatch =
        this.selectedYear === '' || payment.year === this.selectedYear;
      const statusMatch =
        this.selectedStatus === '' || payment.status === this.selectedStatus;
      return yearMatch && statusMatch;
    });
  }

  payNow(payment: PaymentRecord) {
    // In a real app, this would redirect to payment gateway
    alert(`Redirecting to payment gateway for ₹${payment.pendingAmount}`);
    console.log('Payment initiated for:', payment);
  }

  downloadReceipt(payment: PaymentRecord) {
    if (payment.status === 'pending') {
      alert('Receipt not available for pending payments');
      return;
    }

    // In a real app, this would download the actual receipt
    alert(`Downloading receipt for ${payment.month} ${payment.year}`);
    console.log('Downloading receipt for:', payment);
  }

  viewDetails(payment: PaymentRecord) {
    // In a real app, this might open a modal or navigate to a detail page
    alert(`Viewing details for ${payment.month} ${payment.year}`);
    console.log('Viewing details for:', payment);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      case 'partial':
        return 'Partial';
      default:
        return 'Unknown';
    }
  }

  goBack() {
    this.router.navigate(['/tenant']);
  }
  private async loadPaymentData() {
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
        await this.loadPaymentHistory();
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadPaymentHistory() {
    if (!this.tenant) return;

    try {
      // TODO: Replace with real API call when payment endpoints are available
      // const paymentResult = await this.paymentService.getPaymentHistory(this.tenant.id).toPromise();
      // if (paymentResult?.success && paymentResult.entity) {
      //   this.paymentRecords = paymentResult.entity;
      // } else {
      //   this.paymentRecords = [];
      // }

      // For now, initialize empty arrays until payment API is implemented
      this.paymentRecords = [];
      this.filteredPayments = [];
      this.availableYears = [];

      console.log(
        'Payment history API not yet implemented - displaying empty state',
      );
    } catch (error) {
      console.error('Error loading payment history:', error);
      this.paymentRecords = [];
      this.filteredPayments = [];
    }
  }

  // TODO: Remove this mock method when payment API is implemented
  private generateMockPaymentData() {
    const currentDate = new Date();
    const rentAmount = this.tenant?.rentAmount || 25000;
    const maintenanceCharges = this.tenant?.maintenanceCharges || 2000;

    this.paymentRecords = [];

    // Generate data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const isCurrentMonth = i === 0;
      const isPastMonth = i > 0;

      let status: 'paid' | 'pending' | 'overdue' | 'partial';
      let paidAmount = 0;
      let paymentDate: Date | null = null;
      let paymentMethod = '';
      let transactionId = '';

      if (isCurrentMonth) {
        // Current month - pending
        status = 'pending';
      } else if (isPastMonth) {
        // Past months - mostly paid, some overdue
        const random = Math.random();
        if (random < 0.8) {
          status = 'paid';
          paidAmount = rentAmount + maintenanceCharges;
          paymentDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            Math.floor(Math.random() * 10) + 1,
          );
          paymentMethod = ['Bank Transfer', 'Credit Card', 'UPI'][
            Math.floor(Math.random() * 3)
          ];
          transactionId = `TXN${Date.now() + Math.random()}`;
        } else if (random < 0.9) {
          status = 'partial';
          paidAmount = rentAmount; // Only rent paid, maintenance pending
          paymentDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            Math.floor(Math.random() * 10) + 1,
          );
          paymentMethod = 'Bank Transfer';
          transactionId = `TXN${Date.now() + Math.random()}`;
        } else {
          status = 'overdue';
        }
      } else {
        status = 'paid';
        paidAmount = rentAmount + maintenanceCharges;
        paymentDate = new Date(date.getFullYear(), date.getMonth(), 5);
        paymentMethod = 'Bank Transfer';
        transactionId = `TXN${Date.now() + Math.random()}`;
      }

      const totalAmount = rentAmount + maintenanceCharges;
      const pendingAmount = totalAmount - paidAmount;
      const dueDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        this.tenant?.rentDueDate
          ? new Date(this.tenant.rentDueDate).getDate()
          : 5,
      );

      this.paymentRecords.push({
        id: i + 1,
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        rentAmount,
        maintenanceCharges,
        lateCharges: status === 'overdue' ? 500 : 0,
        totalAmount: totalAmount + (status === 'overdue' ? 500 : 0),
        paidAmount,
        pendingAmount,
        paymentDate,
        paymentMethod,
        status,
        dueDate,
        transactionId,
      });
    }

    // Sort by date (newest first)
    this.paymentRecords.sort(
      (a, b) =>
        b.year - a.year ||
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    );
  }

  private calculatePaymentSummary() {
    this.paymentSummary = {
      totalPaid: this.paymentRecords.reduce(
        (sum, record) => sum + record.paidAmount,
        0,
      ),
      totalPending: this.paymentRecords.reduce(
        (sum, record) => sum + record.pendingAmount,
        0,
      ),
      totalOverdue: this.paymentRecords
        .filter((record) => record.status === 'overdue')
        .reduce((sum, record) => sum + record.pendingAmount, 0),
      nextDueAmount:
        this.paymentRecords.find((record) => record.status === 'pending')
          ?.pendingAmount || 0,
      nextDueDate:
        this.paymentRecords.find((record) => record.status === 'pending')
          ?.dueDate || new Date(),
    };
  }

  private findCurrentMonthPayment() {
    const currentDate = new Date();
    this.currentMonthPayment =
      this.paymentRecords.find(
        (record) =>
          record.year === currentDate.getFullYear() &&
          record.month ===
            currentDate.toLocaleString('default', { month: 'long' }),
      ) || null;
  }

  private extractAvailableYears() {
    const years = [
      ...new Set(this.paymentRecords.map((record) => record.year)),
    ];
    this.availableYears = years.sort((a, b) => b - a);
  }
}
