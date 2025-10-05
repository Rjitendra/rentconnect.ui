import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgLabelComponent,
  NgTextareaComponent,
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
  ITicketComment,
  TicketCategory,
  TicketPriority,
  TicketStatusType,
} from '../../../models/tickets';
import { TenantService } from '../../../service/tenant.service';
import { TicketService } from '../../../service/ticket.service';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgCardComponent,
    NgButton,
    NgLabelComponent,
    NgTextareaComponent,
    NgFileUploadComponent,
  ],
  templateUrl: './issues-details.html',
  styleUrl: './issues-details.scss',
})
export class IssueDetailComponent implements OnInit {
  // Data
  issueId: number = 0;
  issue: ITicket | null = null;
  comments: ITicketComment[] = [];
  tenant: ITenant | null = null;
  selectedFiles: UploadedFile[] = [];

  // UI State
  loading = true;
  isSubmittingComment = false;

  // Form
  commentForm!: FormGroup;

  // User info
  userDetail: Partial<IUserDetail> = {};

  // File upload config
  fileUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
    acceptedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    allowMultiple: true,
  };

  // Enums for template
  CreatedByType = CreatedByType;
  TicketStatusType = TicketStatusType;

  // Services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);
  private ticketService = inject(TicketService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.issueId = +params['id'];
      if (this.issueId) {
        this.loadIssueDetails();
      }
    });
  }

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(file: UploadedFile) {
    this.selectedFiles = this.selectedFiles.filter((f) => f.url !== file.url);
  }

  async onSubmitComment() {
    if (this.commentForm.invalid || !this.issue || !this.tenant) return;

    this.isSubmittingComment = true;

    try {
      const formValue = this.commentForm.value;
      const attachmentFiles = this.selectedFiles.map((file) => file.file);

      const result = await this.ticketService
        .addComment(
          this.issue.id!,
          formValue.comment,
          this.tenant.id!,
          this.tenant.name,
          CreatedByType.Tenant,
          attachmentFiles,
        )
        .toPromise();

      if (result && result.success && result.entity) {
        // Add comment to local list
        this.comments.push(result.entity);

        // Reset form
        this.commentForm.reset();
        this.selectedFiles = [];

        alert('Comment added successfully!');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      this.isSubmittingComment = false;
    }
  }

  // Utility methods
  getCategoryIcon(category: TicketCategory): string {
    return this.ticketService.getCategoryIcon(category);
  }

  getCategoryLabel(category: TicketCategory): string {
    return this.ticketService.getEnumDisplayValue(category, 'category');
  }

  getPriorityLabel(priority: TicketPriority): string {
    return this.ticketService.getEnumDisplayValue(priority, 'priority');
  }

  getStatusLabel(status: TicketStatusType): string {
    return this.ticketService.getEnumDisplayValue(status, 'status');
  }

  getPriorityClass(priority: TicketPriority): string {
    return this.ticketService.getPriorityClass(priority);
  }

  getStatusClass(status: TicketStatusType): string {
    return this.ticketService.getStatusClass(status);
  }

  getStatusIcon(status: TicketStatusType): string {
    switch (status) {
      case TicketStatusType.Open:
        return 'radio_button_unchecked';
      case TicketStatusType.InProgress:
        return 'autorenew';
      case TicketStatusType.Pending:
        return 'pause';
      case TicketStatusType.Resolved:
        return 'check_circle';
      case TicketStatusType.Closed:
        return 'lock';
      case TicketStatusType.Cancelled:
        return 'cancel';
      default:
        return 'radio_button_unchecked';
    }
  }

  goBack() {
    this.router.navigate(['/tenant/issues']);
  }

  private initializeForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  private async loadIssueDetails() {
    try {
      this.loading = true;

      // Get current tenant first
      const userEmail = this.userDetail.email;
      if (userEmail) {
        const tenantResult = await this.tenantService
          .getTenantByEmail(userEmail)
          .toPromise();
        if (
          tenantResult &&
          tenantResult.status === ResultStatusType.Success &&
          tenantResult.entity
        ) {
          this.tenant = tenantResult.entity;
        }
      }

      // Load issue details
      const result = await this.ticketService
        .getTicketById(this.issueId)
        .toPromise();

      if (result && result.success && result.entity) {
        this.issue = result.entity;
        await this.loadComments();
      } else {
        // Issue not found
        console.error('Issue not found or could not be loaded');
        this.issue = null;
      }
    } catch (error) {
      console.error('Error loading issue details:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadComments() {
    if (!this.issue?.id) return;

    try {
      const result = await this.ticketService
        .getTicketComments(this.issue.id)
        .toPromise();

      if (result && result.success && result.entity) {
        this.comments = result.entity;
      } else {
        // No comments found or error loading
        this.comments = [];
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }
}
