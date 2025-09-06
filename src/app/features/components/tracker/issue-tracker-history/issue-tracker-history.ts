import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Shared library imports
import {
  AlertService,
  FileUploadConfig,
  InputType,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgIconComponent,
  NgSelectComponent,
  NgTextareaComponent,
  SelectOption,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
import { Result } from '../../../../common/models/common';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import {
  ITicket,
  ITicketComment,
  TicketCategory,
  TicketPriority,
  TicketStatusType,
} from '../../../models/tickets';
import { DemoTicketService } from '../../../service/demo-ticket.service';
import { TicketService } from '../../../service/ticket.service';

@Component({
  selector: 'app-issue-tracker-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgCardComponent,
    NgButton,
    NgIconComponent,
    NgSelectComponent,
    NgTextareaComponent,
    NgFileUploadComponent,
  ],
  templateUrl: './issue-tracker-history.html',
  styleUrl: './issue-tracker-history.scss',
})
export class IssueTrackerHistory implements OnInit {
  // Data
  ticket: ITicket | null = null;
  comments: ITicketComment[] = [];

  // Forms
  commentForm!: FormGroup;
  statusForm!: FormGroup;

  // UI State
  isLoading = false;
  isLoadingComments = false;
  isAddingComment = false;
  isUpdatingStatus = false;
  mode: 'view' | 'edit' = 'view';

  // User info
  userDetail: Partial<IUserDetail> = {};
  userType: 'landlord' | 'tenant' = 'landlord';

  // File upload for comments
  commentAttachments: UploadedFile[] = [];
  fileUploadConfig: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
    acceptedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'text/plain',
    ],
    allowMultiple: true,
  };

  // Dropdown options
  statusOptions: SelectOption[] = [];

  // Enums for template
  InputType = InputType;
  TicketStatusType = TicketStatusType;
  TicketPriority = TicketPriority;
  TicketCategory = TicketCategory;

  // Services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private oauthService = inject(OauthService);
  private ticketService = inject(TicketService);
  private demoTicketService = inject(DemoTicketService);

  constructor() {
    this.userDetail = this.oauthService.getUserInfo();
    // Determine user type based on role or other criteria
    this.userType = 'landlord'; // This should be determined from user info
  }

  ngOnInit() {
    this.initializeForms();
    this.loadDropdownData();
    this.loadTicketData();

    // Check if edit mode is requested
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'edit') {
        this.mode = 'edit';
      }
    });
  }

  // Navigation
  goBack() {
    this.router.navigate(['/landlord/issue-tracker']);
  }

  // Comment handling
  onAddComment() {
    if (this.commentForm.invalid || !this.ticket?.id) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isAddingComment = true;

    const formValue = this.commentForm.value as { comment: string };
    const commentText = formValue.comment;
    const userId = Number(this.userDetail.userId);

    // Use demo service for testing
    this.demoTicketService
      .addComment(this.ticket.id, commentText, userId, this.userType)
      .subscribe({
        next: (response: Result<ITicketComment>) => {
          this.isAddingComment = false;
          if (response.success && response.entity) {
            // Add new comment to the list
            this.comments.push(response.entity);

            // Reset form and attachments
            this.commentForm.reset();
            this.commentAttachments = [];

            this.alertService.success({
              errors: [
                {
                  message: 'Comment added successfully',
                  errorType: 'success',
                },
              ],
              timeout: 3000,
            });
          } else {
            this.alertService.error({
              errors: [
                {
                  message: 'Failed to add comment',
                  errorType: 'error',
                },
              ],
              timeout: 3000,
            });
          }
        },
        error: (error) => {
          this.isAddingComment = false;
          console.error('Error adding comment:', error);
          this.alertService.error({
            errors: [
              {
                message: 'An error occurred while adding comment',
                errorType: 'error',
              },
            ],
            timeout: 3000,
          });
        },
      });
  }

  // Status update
  onUpdateStatus() {
    if (this.statusForm.invalid || !this.ticket?.id) {
      this.statusForm.markAllAsTouched();
      return;
    }

    this.isUpdatingStatus = true;

    const formValue = this.statusForm.value as {
      status: TicketStatusType;
      comment: string;
    };

    // Use demo service for testing
    this.demoTicketService
      .updateTicketStatus(this.ticket.id, formValue.status, formValue.comment)
      .subscribe({
        next: (response: Result<ITicket>) => {
          this.isUpdatingStatus = false;
          if (response.success && response.entity) {
            // Update ticket status
            this.ticket = response.entity;

            // Reload comments to show status change
            this.loadComments();

            this.alertService.success({
              errors: [
                {
                  message: 'Status updated successfully',
                  errorType: 'success',
                },
              ],
              timeout: 3000,
            });
          } else {
            this.alertService.error({
              errors: [
                {
                  message: 'Failed to update status',
                  errorType: 'error',
                },
              ],
              timeout: 3000,
            });
          }
        },
        error: (error) => {
          this.isUpdatingStatus = false;
          console.error('Error updating status:', error);
          this.alertService.error({
            errors: [
              {
                message: 'An error occurred while updating status',
                errorType: 'error',
              },
            ],
            timeout: 3000,
          });
        },
      });
  }

  // File upload handling
  onCommentFilesSelected(files: UploadedFile[]) {
    this.commentAttachments = files;
  }

  onCommentFileRemoved(event: { file: UploadedFile; index: number }) {
    this.commentAttachments = this.commentAttachments.filter(
      (f) => f.url !== event.file.url,
    );
  }

  // Utility methods for template
  getCategoryIcon(category: TicketCategory): string {
    return this.ticketService.getCategoryIcon(category);
  }

  getCategoryLabel(category: TicketCategory): string {
    const categoryOptions = this.ticketService.getCategoryOptions();
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.label || category;
  }

  getPriorityClass(priority: TicketPriority): string {
    return this.ticketService.getPriorityClass(priority);
  }

  getStatusClass(status: TicketStatusType): string {
    return this.ticketService.getStatusClass(status);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateShort(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getCommentAuthorClass(comment: ITicketComment): string {
    return comment.addedByType === 'landlord'
      ? 'landlord-comment'
      : 'tenant-comment';
  }

  isCurrentUser(comment: ITicketComment): boolean {
    return comment.addedBy === Number(this.userDetail.userId);
  }

  canUpdateStatus(): boolean {
    // Only landlords can update status, or if user is the creator
    return (
      this.userType === 'landlord' ||
      this.ticket?.createdBy === Number(this.userDetail.userId)
    );
  }

  downloadAttachment(attachment: { fileUrl?: string }) {
    // Implement file download logic
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  }

  private initializeForms() {
    // Comment form
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(5)]],
    });

    // Status update form
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      comment: [''], // Optional comment when updating status
    });

    // Load status options
    this.statusOptions = this.ticketService.getStatusOptions();
  }

  private loadDropdownData() {
    // Status options are already loaded in initializeForms
  }

  private loadTicketData() {
    const ticketId = Number(this.route.snapshot.paramMap.get('id'));

    if (!ticketId) {
      this.alertService.error({
        errors: [
          {
            message: 'Invalid ticket ID',
            errorType: 'error',
          },
        ],
        timeout: 3000,
      });
      this.goBack();
      return;
    }

    this.isLoading = true;

    // Load ticket details - use demo service for testing
    this.demoTicketService.getTicketById(ticketId).subscribe({
      next: (response: Result<ITicket>) => {
        this.isLoading = false;
        if (response.success && response.entity) {
          this.ticket = response.entity;

          // Set current status in status form
          this.statusForm.patchValue({
            status: this.ticket.currentStatus,
          });

          // Load comments
          this.loadComments();
        } else {
          this.alertService.error({
            errors: [
              {
                message: 'Failed to load ticket details',
                errorType: 'error',
              },
            ],
            timeout: 3000,
          });
          this.goBack();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading ticket:', error);
        this.alertService.error({
          errors: [
            {
              message: 'An error occurred while loading ticket details',
              errorType: 'error',
            },
          ],
          timeout: 3000,
        });
        this.goBack();
      },
    });
  }

  private loadComments() {
    if (!this.ticket?.id) return;

    this.isLoadingComments = true;

    // Use demo service for testing
    this.demoTicketService.getTicketComments(this.ticket.id).subscribe({
      next: (response: Result<ITicketComment[]>) => {
        this.isLoadingComments = false;
        if (response.success && response.entity) {
          this.comments = response.entity.sort(
            (a, b) =>
              new Date(a.dateCreated).getTime() -
              new Date(b.dateCreated).getTime(),
          );
        }
      },
      error: (error) => {
        this.isLoadingComments = false;
        console.error('Error loading comments:', error);
      },
    });
  }
}
