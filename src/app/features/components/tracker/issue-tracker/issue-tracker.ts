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
  AlertService,
  FileUploadConfig,
  InputType,
  NgButton,
  NgCardComponent,
  NgDialogService,
  NgFileUploadComponent,
  NgIconComponent,
  NgInputComponent,
  NgMatTable,
  NgSelectComponent,
  NgTextareaComponent,
  SelectOption,
  TableColumn,
  UploadedFile,
  model,
} from '../../../../../../projects/shared/src/public-api';
import { Result } from '../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { IProperty } from '../../../models/property';
import {
  CreatedByType,
  ITicket,
  ITicketSaveResponse,
  TicketCategory,
  TicketPriority,
  TicketStatusType,
} from '../../../models/tickets';
import { DemoTicketService } from '../../../service/demo-ticket.service';
import { PropertyService } from '../../../service/property.service';
import { TenantService } from '../../../service/tenant.service';
import { TicketService } from '../../../service/ticket.service';

// Interface for transformed ticket data for table display
interface ITransformedTicket {
  // Original ticket properties
  id?: number;
  landlordId: number;
  propertyId: number;
  tenantId?: number;
  title: string;
  description: string;

  // Transformed properties for display
  ticketNumber: string;
  propertyTitle: string;
  tenantName: string;
  dateCreated: string;
  dateModified: string;
  currentStatus: string;
  priority: string;
  category: string;

  // Keep original nested objects for navigation
  property?: { id?: number; title?: string };
  tenant?: { id?: number; name?: string };
}

@Component({
  selector: 'app-issue-tracker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgCardComponent,
    NgButton,
    NgIconComponent,
    NgInputComponent,
    NgSelectComponent,
    NgTextareaComponent,
    NgMatTable,
    NgFileUploadComponent,
  ],
  templateUrl: './issue-tracker.html',
  styleUrl: './issue-tracker.scss',
})
export class IssueTracker implements OnInit {
  // Form and data
  ticketForm!: FormGroup;
  tickets: ITicket[] = [];
  filteredTickets: ITransformedTicket[] = [];

  // UI State
  currentView: 'table' | 'create' = 'table';
  isLoading = false;
  isSaving = false;

  // User info
  userDetail: Partial<IUserDetail> = {};
  userType: 'landlord' | 'tenant' = 'landlord';

  // Dropdown options
  propertyOptions: SelectOption[] = [];
  tenantOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  priorityOptions: SelectOption[] = [];
  statusOptions: SelectOption[] = [];

  // File upload
  attachments: UploadedFile[] = [];
  fileUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    acceptedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'text/plain',
    ],
    allowMultiple: true,
  };

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: true,
      width: '120px',
      type: 'text',
    },
    {
      key: 'propertyTitle',
      label: 'Property',
      sortable: true,
      width: '200px',
      type: 'text',
    },
    {
      key: 'tenantName',
      label: 'Tenant',
      sortable: true,
      width: '150px',
      type: 'text',
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '120px',
      type: 'text',
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      width: '200px',
      type: 'text',
      truncateText: true,
    },
    {
      key: 'currentStatus',
      label: 'Status',
      sortable: true,
      width: '120px',
      type: 'text',
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      width: '100px',
      type: 'text',
    },
    {
      key: 'dateCreated',
      label: 'Created',
      sortable: true,
      width: '130px',
      type: 'text',
    },
    {
      key: 'dateModified',
      label: 'Updated',
      sortable: true,
      width: '130px',
      type: 'text',
    },
  ];

  // Enums for template
  InputType = InputType;
  TicketCategory = TicketCategory;
  TicketPriority = TicketPriority;
  TicketStatusType = TicketStatusType;

  // Services
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private dialogService = inject(NgDialogService);
  private oauthService = inject(OauthService);
  private propertyService = inject(PropertyService);
  private tenantService = inject(TenantService);
  private ticketService = inject(TicketService);
  private demoTicketService = inject(DemoTicketService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();

    // For demo purposes, if no user info is available, use mock data
    if (!this.userDetail.userId) {
      this.userDetail = {
        userId: 1,
        firstName: 'Demo',
        lastName: 'Landlord',
        fullName: 'Demo Landlord',
        email: 'demo@landlord.com',
        roleId: 1,
        roleName: 'landlord',
      };
    }

    // Determine user type based on role or other criteria
    this.userType = 'landlord'; // This should be determined from user info
  }

  ngOnInit() {
    this.initializeForm();
    this.loadDropdownData();
    this.loadTickets();
  }

  // Show create ticket form
  onCreateTicket() {
    this.currentView = 'create';
    this.ticketForm.reset();
    this.ticketForm.patchValue({
      priority: TicketPriority.Medium,
    });
    this.attachments = [];
  }

  // Show table view
  showTable() {
    this.currentView = 'table';
    this.loadTickets(); // Refresh data
  }

  // Handle form submission
  onSubmit() {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const formValue = this.ticketForm.value as {
      propertyId: string;
      tenantId?: string;
      category: TicketCategory;
      title: string;
      description: string;
      priority: TicketPriority;
    };
    const ticket: Partial<ITicket> = {
      landlordId: Number(this.userDetail.userId),
      propertyId: Number(formValue.propertyId),
      tenantId: formValue.tenantId ? Number(formValue.tenantId) : undefined,
      category: formValue.category,
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      createdBy: Number(this.userDetail.userId),
      createdByType:
        this.userType === 'landlord'
          ? CreatedByType.Landlord
          : CreatedByType.Tenant,
    };

    // Convert to FormData for file upload support
    const attachmentFiles = this.attachments.map((file) => file.file);
    const formData = this.ticketService.convertTicketToFormData(
      ticket,
      attachmentFiles,
    );

    // Use real service for production
    this.ticketService.createTicket(formData).subscribe({
      next: (response: ITicketSaveResponse) => {
        this.isSaving = false;
        if (response.success) {
          this.alertService.success({
            errors: [
              {
                message: response.message || 'Ticket created successfully!',
                errorType: 'success',
              },
            ],
            timeout: 5000,
          });
          this.showTable();
        } else {
          this.alertService.error({
            errors: response.errors?.map((error) => ({
              message: error,
              errorType: 'error',
            })) || [
              {
                message: 'Failed to create ticket. Please try again.',
                errorType: 'error',
              },
            ],
            timeout: 5000,
          });
        }
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error creating ticket:', error);
        this.alertService.error({
          errors: [
            {
              message:
                'An error occurred while creating the ticket. Please try again.',
              errorType: 'error',
            },
          ],
          timeout: 5000,
        });
      },
    });
  }

  // Handle file uploads
  onFilesSelected(files: UploadedFile[]) {
    this.attachments = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    this.attachments = this.attachments.filter((f) => f.url !== event.file.url);
  }

  // Table actions
  onViewTicket(ticket: model) {
    this.router.navigate(['/landlord/issue-tracker/history', ticket['id']]);
  }

  onEditTicket(ticket: ITicket) {
    // Navigate to edit mode or open edit modal
    this.router.navigate(['/landlord/issue-tracker/history', ticket.id], {
      queryParams: { mode: 'edit' },
    });
  }

  // Utility methods for template
  getCategoryIcon(category: TicketCategory): string {
    return this.ticketService.getCategoryIcon(category);
  }

  getCategoryLabel(category: TicketCategory): string {
    const option = this.categoryOptions.find((opt) => opt.value === category);
    return option?.label || 'Unknown';
  }

  getPriorityClass(priority: TicketPriority): string {
    return this.ticketService.getPriorityClass(priority);
  }

  getStatusClass(status: TicketStatusType): string {
    return this.ticketService.getStatusClass(status);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Filter and search functionality
  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value;

    if (!searchTerm.trim()) {
      this.refreshFilteredTickets();
      return;
    }

    const term = searchTerm.toLowerCase();
    const transformedTickets = this.transformTicketsForTable(this.tickets);
    this.filteredTickets = transformedTickets.filter(
      (ticket) =>
        ticket.ticketNumber?.toLowerCase().includes(term) ||
        ticket.title.toLowerCase().includes(term) ||
        ticket.propertyTitle?.toLowerCase().includes(term) ||
        ticket.tenantName?.toLowerCase().includes(term) ||
        ticket.category.toLowerCase().includes(term),
    );
  }

  onFilterByStatus(status: TicketStatusType | '') {
    if (!status) {
      this.refreshFilteredTickets();
      return;
    }

    const filteredTickets = this.tickets.filter(
      (ticket) => ticket.currentStatus === status,
    );
    this.filteredTickets = this.transformTicketsForTable(filteredTickets);
  }

  onFilterByCategory(category: TicketCategory | '') {
    if (!category) {
      this.refreshFilteredTickets();
      return;
    }

    const filteredTickets = this.tickets.filter(
      (ticket) => ticket.category === category,
    );
    this.filteredTickets = this.transformTicketsForTable(filteredTickets);
  }

  // Helper methods for filter options
  getStatusFilterOptions(): SelectOption[] {
    return [{ value: '', label: 'All Statuses' }, ...this.statusOptions];
  }

  getCategoryFilterOptions(): SelectOption[] {
    return [{ value: '', label: 'All Categories' }, ...this.categoryOptions];
  }

  // Helper method to transform tickets for table display
  private transformTicketsForTable(tickets: ITicket[]): ITransformedTicket[] {
    return tickets.map((ticket) => ({
      ...ticket,
      ticketNumber: ticket.ticketNumber || `#${ticket.id}`,
      propertyTitle: ticket.property?.title || 'N/A',
      tenantName: ticket.tenant?.name || 'General',
      dateCreated: this.formatDate(ticket.dateCreated || new Date()),
      dateModified: this.formatDate(
        ticket.dateModified || ticket.dateCreated || new Date(),
      ),
      currentStatus: this.ticketService.getEnumDisplayValue(
        ticket.currentStatus,
        'status',
      ),
      priority: this.ticketService.getEnumDisplayValue(
        ticket.priority,
        'priority',
      ),
      category: this.ticketService.getEnumDisplayValue(
        ticket.category,
        'category',
      ),
    }));
  }

  // Helper method to refresh filtered tickets
  private refreshFilteredTickets() {
    this.filteredTickets = this.transformTicketsForTable(this.tickets);
  }

  // Initialize reactive form
  private initializeForm() {
    this.ticketForm = this.fb.group({
      propertyId: ['', Validators.required],
      tenantId: [''], // Optional - landlord can create tickets without specific tenant
      category: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: [TicketPriority.Medium, Validators.required],
    });

    // Load category and priority options
    this.categoryOptions = this.ticketService.getCategoryOptions();
    this.priorityOptions = this.ticketService.getPriorityOptions();
    this.statusOptions = this.ticketService.getStatusOptions();
  }

  // Load dropdown data
  private loadDropdownData() {
    const landlordId = Number(this.userDetail.userId);

    if (landlordId) {
      // Load properties
      this.propertyService.getProperties(landlordId).subscribe({
        next: (response: Result<IProperty[]>) => {
          if (response.success && response.entity) {
            this.propertyOptions = response.entity.map((property) => ({
              value: property.id!.toString(),
              label: `${property.title} - ${property.locality}, ${property.city}`,
            }));
          }
        },
        error: (error) => {
          console.error('Error loading properties:', error);
        },
      });

      // Load tenants
      this.tenantService.getAllTenants().subscribe({
        next: (response) => {
          if (response && response.entity && response.entity.length > 0) {
            this.tenantOptions = response.entity.map((tenant) => ({
              value: tenant.id!.toString(),
              label: `${tenant.name} - ${tenant.email}`,
            }));
          }
        },
        error: (error) => {
          console.error('Error loading tenants:', error);
        },
      });
    }
  }

  // Load tickets
  private loadTickets() {
    this.isLoading = true;
    const userId = Number(this.userDetail.userId);

    // Debug logging
    console.log('User Detail:', this.userDetail);
    console.log('User ID:', userId);
    console.log('User Type:', this.userType);

    // Use real service for production
    const ticketObservable =
      this.userType === 'landlord'
        ? this.ticketService.getLandlordTickets(userId || 1) // Default to 1 for demo
        : this.ticketService.getTenantTickets(userId);

    ticketObservable.subscribe({
      next: (response: Result<ITicket[]>) => {
        console.log('Received response:', response);
        console.log('Response entity length:', response.entity?.length);

        this.isLoading = false;
        if (response.success && response.entity) {
          this.tickets = response.entity;
          console.log('Setting tickets:', this.tickets.length);
          this.refreshFilteredTickets();
          console.log(
            'Filtered tickets after refresh:',
            this.filteredTickets.length,
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading tickets:', error);
        this.alertService.error({
          errors: [
            {
              message: 'Failed to load tickets. Please try again.',
              errorType: 'error',
            },
          ],
          timeout: 5000,
        });
      },
    });
  }
}
