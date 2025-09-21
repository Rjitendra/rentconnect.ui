/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgInputComponent,
  NgLabelComponent,
  NgSelectComponent,
  NgTextareaComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { ITenant } from '../../../models/tenant';
import {
  CreatedByType,
  ITicket,
  TicketCategory,
  TicketPriority,
  TicketStatusType,
} from '../../../models/tickets';
import { TenantService } from '../../../service/tenant.service';
import { TicketService } from '../../../service/ticket.service';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgCardComponent,
    NgButton,
    NgInputComponent,
    NgLabelComponent,
    NgSelectComponent,
    NgTextareaComponent,
    NgFileUploadComponent,
  ],
  template: `
    <div class="issues">
      <div class="page-header">
        <ng-button
          [type]="'text'"
          [label]="'Back to Portal'"
          [icon]="'arrow_back'"
          [buttonType]="'button'"
          [cssClass]="'back-btn'"
          (buttonClick)="goBack()"
        />
        <h1>Issue Tracker</h1>
        <ng-button
          [type]="'filled'"
          [label]="showCreateForm ? 'Cancel' : 'Report New Issue'"
          [icon]="'add'"
          [buttonType]="'button'"
          (buttonClick)="showCreateForm = !showCreateForm"
        />
      </div>

      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading issues...</p>
        </div>
      }

      @if (!loading) {
        <!-- Create Issue Form -->
        @if (showCreateForm) {
          <ng-card class="create-issue-card">
            <div class="card-header">
              <i class="material-icons">bug_report</i>
              <h2>Report New Issue</h2>
            </div>

            <form [formGroup]="issueForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <div class="form-group">
                  <ng-select
                    label="Issue Category"
                    placeholder="Select category"
                    formControlName="category"
                    [options]="categoryOptions"
                    [required]="true"
                  />
                </div>

                <div class="form-group">
                  <ng-select
                    label="Priority"
                    formControlName="priority"
                    [options]="priorityOptions"
                    [required]="true"
                  />
                </div>

                <div class="form-group full-width">
                  <ng-input
                    label="Issue Title"
                    placeholder="Brief description of the issue"
                    formControlName="title"
                    [required]="true"
                  />
                </div>

                <div class="form-group full-width">
                  <ng-textarea
                    label="Detailed Description"
                    placeholder="Provide detailed information about the issue"
                    formControlName="description"
                    [required]="true"
                    [rows]="4"
                  />
                </div>

                <div class="form-group full-width">
                  <ng-label
                    [label]="'Attach Photos/Documents (Optional)'"
                    [toolTip]="
                      'Upload photos or documents related to the issue'
                    "
                    [required]="false"
                  />
                  <ng-file-upload
                    [config]="fileUploadConfig"
                    (filesSelected)="onFilesSelected($event)"
                    (fileRemoved)="onFileRemoved($event)"
                  />
                </div>
              </div>

              <div class="form-actions">
                <ng-button
                  type="button"
                  variant="secondary"
                  (click)="cancelCreate()"
                >
                  Cancel
                </ng-button>
                <ng-button
                  type="submit"
                  variant="primary"
                  [disabled]="issueForm.invalid || isSubmitting"
                >
                  {{ isSubmitting ? 'Submitting...' : 'Submit Issue' }}
                </ng-button>
              </div>
            </form>
          </ng-card>
        }

        <!-- Issues List -->
        <ng-card class="issues-list-card">
          <div class="card-header">
            <i class="material-icons">list</i>
            <h2>Your Issues</h2>
            <div class="filters">
              <ng-select
                label="Filter by Status"
                placeholder="All Statuses"
                [options]="statusFilterOptions"
                [(ngModel)]="selectedStatusFilter"
                (ngModelChange)="filterIssues()"
              />
              <ng-select
                label="Filter by Category"
                placeholder="All Categories"
                [options]="categoryFilterOptions"
                [(ngModel)]="selectedCategoryFilter"
                (ngModelChange)="filterIssues()"
              />
            </div>
          </div>

          @if (filteredIssues.length > 0) {
            <div class="issues-list">
              @for (issue of filteredIssues; track issue.id) {
                <div class="issue-item" (click)="viewIssue(issue)">
                  <div class="issue-header">
                    <div class="issue-meta">
                      <span class="issue-number"
                        >#{{ issue.ticketNumber || issue.id }}</span
                      >
                      <span
                        class="category-badge"
                        [attr.data-category]="getCategoryClass(issue.category)"
                      >
                        <i class="material-icons">{{
                          getCategoryIcon(issue.category)
                        }}</i>
                        {{ getCategoryLabel(issue.category) }}
                      </span>
                      <span
                        class="priority-badge"
                        [attr.data-priority]="getPriorityClass(issue.priority)"
                      >
                        {{ getPriorityLabel(issue.priority) }}
                      </span>
                    </div>
                    <div class="issue-status">
                      <span
                        class="status-badge"
                        [attr.data-status]="getStatusClass(issue.currentStatus)"
                      >
                        {{ getStatusLabel(issue.currentStatus) }}
                      </span>
                    </div>
                  </div>

                  <div class="issue-content">
                    <h3>{{ issue.title }}</h3>
                    <p class="description">{{ issue.description }}</p>
                    <div class="issue-footer">
                      <span class="date"
                        >Created:
                        {{ issue.dateCreated | date: 'MMM dd, yyyy' }}</span
                      >
                      @if (
                        issue.dateModified &&
                        issue.dateModified !== issue.dateCreated
                      ) {
                        <span class="date"
                          >Updated:
                          {{ issue.dateModified | date: 'MMM dd, yyyy' }}</span
                        >
                      }
                    </div>
                  </div>

                  <div class="issue-actions">
                    <i class="material-icons">arrow_forward</i>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              @if (issues.length === 0) {
                <i class="material-icons">sentiment_satisfied</i>
                <p>No issues reported yet</p>
                <p class="sub-text">
                  When you have maintenance issues, you can report them here
                </p>
              } @else {
                <i class="material-icons">filter_list</i>
                <p>No issues match your filters</p>
                <p class="sub-text">Try adjusting your filter criteria</p>
              }
            </div>
          }
        </ng-card>

        <!-- Quick Issue Types -->
        @if (!showCreateForm) {
          <ng-card class="quick-issues-card">
            <div class="card-header">
              <i class="material-icons">flash_on</i>
              <h2>Quick Report</h2>
            </div>

            <p class="quick-info">Need to report a common issue quickly?</p>

            <div class="quick-issues-grid">
              @for (quickIssue of quickIssueTypes; track quickIssue.category) {
                <div
                  class="quick-issue-item"
                  (click)="createQuickIssue(quickIssue)"
                >
                  <i class="material-icons">{{ quickIssue.icon }}</i>
                  <span>{{ quickIssue.label }}</span>
                </div>
              }
            </div>
          </ng-card>
        }
      }
    </div>
  `,
  styleUrl: './issues.scss',
})
export class IssuesComponent implements OnInit {
  // Data
  tenant: ITenant | null = null;
  issues: ITicket[] = [];
  filteredIssues: ITicket[] = [];
  selectedFiles: UploadedFile[] = [];

  // UI State
  loading = true;
  showCreateForm = false;
  isSubmitting = false;
  selectedStatusFilter: TicketStatusType | '' = '';
  selectedCategoryFilter: TicketCategory | '' = '';

  // Form
  issueForm!: FormGroup;

  // User info
  userDetail: Partial<IUserDetail> = {};

  // Options
  categoryOptions: SelectOption[] = [];
  priorityOptions: SelectOption[] = [];
  statusFilterOptions: SelectOption[] = [];
  categoryFilterOptions: SelectOption[] = [];

  // Quick issue types
  quickIssueTypes = [
    {
      category: TicketCategory.Plumbing,
      icon: 'plumbing',
      label: 'Plumbing Issue',
      title: 'Plumbing Problem',
      description: 'There is a plumbing issue that needs attention.',
    },
    {
      category: TicketCategory.Electricity,
      icon: 'electrical_services',
      label: 'Electrical Issue',
      title: 'Electrical Problem',
      description: 'There is an electrical issue that needs attention.',
    },
    {
      category: TicketCategory.AirConditioning,
      icon: 'ac_unit',
      label: 'AC/Heating Issue',
      title: 'AC/Heating Problem',
      description: 'There is an issue with air conditioning or heating.',
    },
    {
      category: TicketCategory.Maintenance,
      icon: 'build',
      label: 'General Maintenance',
      title: 'Maintenance Required',
      description: 'General maintenance work is needed.',
    },
    {
      category: TicketCategory.Cleaning,
      icon: 'cleaning_services',
      label: 'Cleaning Issue',
      title: 'Cleaning Required',
      description: 'Cleaning service is needed.',
    },
    {
      category: TicketCategory.Security,
      icon: 'security',
      label: 'Security Concern',
      title: 'Security Issue',
      description: 'There is a security concern that needs attention.',
    },
  ];

  // File upload config
  fileUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    acceptedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    allowMultiple: true,
  };

  // Services
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);
  private ticketService = inject(TicketService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
    this.initializeForm();
    this.loadDropdownOptions();
  }

  ngOnInit() {
    this.loadTenantData();
  }
  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    const file = event.file;
    this.selectedFiles = this.selectedFiles.filter((f) => f.url !== file.url);
  }

  async onSubmit() {
    if (this.issueForm.invalid || !this.tenant) return;

    this.isSubmitting = true;

    try {
      const formValue = this.issueForm.value;
      const ticket: Partial<ITicket> = {
        landlordId: this.tenant.landlordId,
        propertyId: this.tenant.propertyId,
        tenantId: this.tenant.id,
        category: formValue.category,
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        createdBy: this.tenant.id!,
        createdByType: CreatedByType.Tenant,
      };

      const attachmentFiles = this.selectedFiles.map((file) => file.file);
      const formData = this.ticketService.convertTicketToFormData(
        ticket,
        attachmentFiles,
      );

      const result = await this.ticketService
        .createTicket(formData)
        .toPromise();

      if (result?.success) {
        // Add to local list for immediate feedback
        const newIssue: ITicket = {
          ...ticket,
          id: Date.now(),
          ticketNumber: `TKT-${Date.now()}`,
          currentStatus: TicketStatusType.Open,
          dateCreated: new Date(),
        } as ITicket;

        this.issues.unshift(newIssue);
        this.filterIssues();

        this.cancelCreate();
        alert('Issue reported successfully!');
      } else {
        throw new Error(result?.message || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to report issue. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  createQuickIssue(quickIssue: {
    category: number;
    title: string;
    description: string;
  }) {
    this.issueForm.patchValue({
      category: quickIssue.category,
      priority: TicketPriority.Medium,
      title: quickIssue.title,
      description: quickIssue.description,
    });
    this.showCreateForm = true;
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.issueForm.reset();
    this.issueForm.patchValue({ priority: TicketPriority.Medium });
    this.selectedFiles = [];
  }

  filterIssues() {
    this.filteredIssues = this.issues.filter((issue) => {
      const statusMatch =
        this.selectedStatusFilter === '' ||
        issue.currentStatus === this.selectedStatusFilter;
      const categoryMatch =
        this.selectedCategoryFilter === '' ||
        issue.category === this.selectedCategoryFilter;
      return statusMatch && categoryMatch;
    });
  }

  viewIssue(issue: ITicket) {
    this.router.navigate(['/tenant/issues', issue.id]);
  }

  // Utility methods
  getCategoryIcon(category: TicketCategory): string {
    return this.ticketService.getCategoryIcon(category);
  }

  getCategoryLabel(category: TicketCategory): string {
    const option = this.categoryOptions.find(
      (opt) => Number(opt.value) === Number(category),
    );
    return option?.label || 'Unknown';
  }

  getPriorityLabel(priority: TicketPriority): string {
    const option = this.priorityOptions.find(
      (opt) => Number(opt.value) === Number(priority),
    );
    return option?.label || 'Medium';
  }

  getStatusLabel(status: TicketStatusType): string {
    return this.ticketService.getEnumDisplayValue(status, 'status');
  }

  getCategoryClass(category: TicketCategory): string {
    return category.toString().toLowerCase();
  }

  getPriorityClass(priority: TicketPriority): string {
    return this.ticketService.getPriorityClass(priority);
  }

  getStatusClass(status: TicketStatusType): string {
    return this.ticketService.getStatusClass(status);
  }

  goBack() {
    this.router.navigate(['/tenant']);
  }
  private initializeForm() {
    this.issueForm = this.fb.group({
      category: ['', Validators.required],
      priority: [TicketPriority.Medium, Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  private loadDropdownOptions() {
    this.categoryOptions = this.ticketService.getCategoryOptions();
    this.priorityOptions = this.ticketService.getPriorityOptions();

    this.statusFilterOptions = [
      { value: '', label: 'All Statuses' },
      ...this.ticketService.getStatusOptions(),
    ];

    this.categoryFilterOptions = [
      { value: '', label: 'All Categories' },
      ...this.categoryOptions,
    ];
  }

  private async loadTenantData() {
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
        await this.loadIssues();
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadIssues() {
    if (!this.tenant?.id) return;

    try {
      const result = await this.ticketService
        .getTenantTickets(this.tenant.id)
        .toPromise();

      if (result?.success && result.entity) {
        this.issues = result.entity;
        this.filteredIssues = [...this.issues];
      }
    } catch (error) {
      console.error('Error loading issues:', error);
      this.issues = [];
      this.filteredIssues = [];
    }
  }
}
