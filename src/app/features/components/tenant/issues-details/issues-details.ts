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
  NgIconComponent,
  NgLabelComponent,
  NgTextareaComponent,
  UploadedFile,
} from 'shared';

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
    NgIconComponent,
    NgLabelComponent,
    NgTextareaComponent,
    NgFileUploadComponent,
  ],
  template: `
    <div class="issue-detail">
      <div class="page-header">
        <ng-button
          [type]="'text'"
          [label]="'Back to Issues'"
          [icon]="'arrow_back'"
          [buttonType]="'button'"
          [cssClass]="'back-btn'"
          (buttonClick)="goBack()"
        />
        <h1>Issue Details</h1>
      </div>

      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading issue details...</p>
        </div>
      }

      @if (!loading && issue) {
        <!-- Issue Header -->
        <ng-card class="issue-header-card">
          <div class="issue-header">
            <div class="issue-meta">
              <div class="issue-number">
                <span class="label">Issue #</span>
                <span class="value">{{ issue.ticketNumber || issue.id }}</span>
              </div>
              <div class="issue-category">
                <i class="material-icons">{{
                  getCategoryIcon(issue.category)
                }}</i>
                <span>{{ getCategoryLabel(issue.category) }}</span>
              </div>
              <div
                class="issue-priority"
                [attr.data-priority]="getPriorityClass(issue.priority)"
              >
                <span>{{ getPriorityLabel(issue.priority) }} Priority</span>
              </div>
            </div>
            <div
              class="issue-status"
              [attr.data-status]="getStatusClass(issue.currentStatus)"
            >
              <span>{{ getStatusLabel(issue.currentStatus) }}</span>
            </div>
          </div>

          <div class="issue-content">
            <h2>{{ issue.title }}</h2>
            <p class="description">{{ issue.description }}</p>

            <div class="issue-timeline">
              <div class="timeline-item">
                <i class="material-icons">schedule</i>
                <span
                  >Created:
                  {{
                    issue.dateCreated | date: "MMM dd, yyyy 'at' h:mm a"
                  }}</span
                >
              </div>
              @if (
                issue.dateModified && issue.dateModified !== issue.dateCreated
              ) {
                <div class="timeline-item">
                  <i class="material-icons">update</i>
                  <span
                    >Last Updated:
                    {{
                      issue.dateModified | date: "MMM dd, yyyy 'at' h:mm a"
                    }}</span
                  >
                </div>
              }
              @if (issue.dateResolved) {
                <div class="timeline-item resolved">
                  <i class="material-icons">check_circle</i>
                  <span
                    >Resolved:
                    {{
                      issue.dateResolved | date: "MMM dd, yyyy 'at' h:mm a"
                    }}</span
                  >
                </div>
              }
            </div>
          </div>
        </ng-card>

        <!-- Comments Section -->
        <ng-card class="comments-card">
          <div class="card-header">
            <i class="material-icons">chat</i>
            <h3>Comments & Updates</h3>
          </div>

          @if (comments.length > 0) {
            <div class="comments-list">
              @for (comment of comments; track comment.id) {
                <div
                  class="comment-item"
                  [class.tenant-comment]="
                    comment.addedByType === CreatedByType.Tenant
                  "
                >
                  <div class="comment-header">
                    <div class="comment-author">
                      <i class="material-icons">{{
                        comment.addedByType === CreatedByType.Tenant
                          ? 'person'
                          : 'business'
                      }}</i>
                      <span class="author-name">{{ comment.addedByName }}</span>
                      <span class="author-type">{{
                        comment.addedByType === CreatedByType.Tenant
                          ? 'Tenant'
                          : 'Landlord'
                      }}</span>
                    </div>
                    <div class="comment-date">
                      {{
                        comment.dateCreated | date: "MMM dd, yyyy 'at' h:mm a"
                      }}
                    </div>
                  </div>
                  <div class="comment-content">
                    <p>{{ comment.comment }}</p>
                    @if (
                      comment.attachments && comment.attachments.length > 0
                    ) {
                      <div class="comment-attachments">
                        <span class="attachments-label">Attachments:</span>
                        @for (
                          attachment of comment.attachments;
                          track attachment.id
                        ) {
                          <a
                            class="attachment-link"
                            target="_blank"
                            [href]="attachment.fileUrl"
                          >
                            <i class="material-icons">attach_file</i>
                            {{ attachment.fileName }}
                          </a>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-comments">
              <i class="material-icons">chat_bubble_outline</i>
              <p>No comments yet</p>
              <p class="sub-text">
                Add a comment below to communicate about this issue
              </p>
            </div>
          }

          <!-- Add Comment Form -->
          @if (
            issue.currentStatus !== TicketStatusType.Closed &&
            issue.currentStatus !== TicketStatusType.Cancelled
          ) {
            <div class="add-comment-section">
              <h4>Add Comment</h4>
              <form [formGroup]="commentForm" (ngSubmit)="onSubmitComment()">
                <div class="form-group">
                  <ng-textarea
                    label="Your Comment"
                    placeholder="Add a comment or update about this issue..."
                    formControlName="comment"
                    [required]="true"
                    [rows]="3"
                  />
                </div>

                <div class="form-group">
                  <ng-label
                    [label]="'Attach Files (Optional)'"
                    [toolTip]="'Upload files related to this issue'"
                    [required]="false"
                  />
                  <ng-file-upload
                    id="file-upload"
                    [config]="fileUploadConfig"
                    (filesSelected)="onFilesSelected($event)"
                    (fileRemoved)="onFileRemoved($event)"
                  />
                </div>

                <div class="form-actions">
                  <ng-button
                    type="submit"
                    variant="primary"
                    [disabled]="commentForm.invalid || isSubmittingComment"
                    [loading]="isSubmittingComment"
                  >
                    {{
                      isSubmittingComment ? 'Adding Comment...' : 'Add Comment'
                    }}
                  </ng-button>
                </div>
              </form>
            </div>
          } @else {
            <div class="issue-closed-notice">
              <i class="material-icons">info</i>
              <span
                >This issue has been
                {{
                  issue.currentStatus === TicketStatusType.Closed
                    ? 'closed'
                    : 'cancelled'
                }}. No further comments can be added.</span
              >
            </div>
          }
        </ng-card>

        <!-- Status History -->
        @if (issue.statusHistory && issue.statusHistory.length > 0) {
          <ng-card class="status-history-card">
            <div class="card-header">
              <i class="material-icons">history</i>
              <h3>Status History</h3>
            </div>

            <div class="status-timeline">
              @for (status of issue.statusHistory; track status.id) {
                <div class="timeline-item">
                  <div
                    class="timeline-marker"
                    [attr.data-status]="getStatusClass(status.status)"
                  >
                    <i class="material-icons">{{
                      getStatusIcon(status.status)
                    }}</i>
                  </div>
                  <div class="timeline-content">
                    <div class="status-change">
                      <span class="status-label">{{
                        getStatusLabel(status.status)
                      }}</span>
                      <span class="status-date">{{
                        status.dateCreated | date: "MMM dd, yyyy 'at' h:mm a"
                      }}</span>
                    </div>
                    <div class="status-author">
                      by {{ status.addedByName }} ({{
                        status.addedByType === CreatedByType.Tenant
                          ? 'Tenant'
                          : 'Landlord'
                      }})
                    </div>
                    @if (status.comment) {
                      <p class="status-comment">{{ status.comment }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          </ng-card>
        }
      }

      @if (!loading && !issue) {
        <div class="error-state">
          <i class="material-icons">error_outline</i>
          <h2>Issue Not Found</h2>
          <p>
            The requested issue could not be found or you don't have permission
            to view it.
          </p>
          <ng-button variant="primary" (click)="goBack()">
            Go Back to Issues
          </ng-button>
        </div>
      }
    </div>
  `,
  styleUrl: './issue-detail.scss',
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

  onFilesSelected(files: UploadedFile[]) {
    this.selectedFiles = files;
  }

  onFileRemoved(event: { file: UploadedFile; index: number }) {
    this.selectedFiles = this.selectedFiles.filter(
      (f) => f.url !== event.file.url,
    );
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
}
