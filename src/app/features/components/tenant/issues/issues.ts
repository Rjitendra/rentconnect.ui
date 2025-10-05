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
  templateUrl: './issues.html',
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
