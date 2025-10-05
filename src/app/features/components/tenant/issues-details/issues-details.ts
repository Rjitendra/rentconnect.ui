import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';

import {
  AlertService,
  FileUploadConfig,
  NgButton,
  NgCardComponent,
  NgFileUploadComponent,
  NgIconComponent,
  NgLabelComponent,
  NgTextareaComponent,
  UploadedFile,
} from '../../../../../../projects/shared/src/public-api';
import { environment } from '../../../../../environments/environment';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import { ITenant } from '../../../models/tenant';
import {
  CreatedByType,
  ITicket,
  ITicketAttachment,
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
    FormsModule,
    ReactiveFormsModule,
    NgCardComponent,
    NgButton,
    NgIconComponent,
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
  private http = inject(HttpClient);
  private oauthService = inject(OauthService);
  private tenantService = inject(TenantService);
  private ticketService = inject(TicketService);
  private alertService = inject(AlertService);

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

  onSubmitComment() {
    if (this.commentForm.invalid || !this.issue || !this.tenant) return;

    this.isSubmittingComment = true;

    const formValue = this.commentForm.value as { comment: string };
    const commentText = (formValue.comment ?? '').trim();
    const attachmentFiles = this.selectedFiles.map((file) => file.file);

    this.ticketService
      .addComment(
        this.issue.id!,
        commentText,
        this.tenant.id!,
        this.tenant.name,
        CreatedByType.Tenant,
        attachmentFiles,
      )
      .subscribe({
        next: (result) => {
          if (result && result.success && result.entity) {
            // Add comment to local list
            this.comments.push(result.entity);

            // Reset form
            this.commentForm.reset();
            this.selectedFiles = [];

            this.alertService.success({
              errors: [
                {
                  message: 'Comment added successfully!',
                  errorType: 'success',
                },
              ],
            });
          } else {
            this.alertService.error({
              errors: [
                {
                  message: 'Failed to add comment. Please try again.',
                  errorType: 'error',
                },
              ],
            });
          }
          this.isSubmittingComment = false;
        },
        error: () => {
          this.alertService.error({
            errors: [
              {
                message: 'Failed to add comment. Please try again.',
                errorType: 'error',
              },
            ],
          });
          this.isSubmittingComment = false;
        },
      });
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

  downloadAttachment(attachment: ITicketAttachment) {
    if (!attachment.id) {
      this.alertService.error({
        errors: [
          {
            message: 'Attachment ID not available',
            errorType: 'error',
          },
        ],
      });
      return;
    }

    const url = `${environment.apiBaseUrl}ticket/attachment/${attachment.id}/download`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          this.alertService.error({
            errors: [
              {
                message: 'Downloaded file is empty',
                errorType: 'error',
              },
            ],
          });
          return;
        }

        // Create blob URL and trigger download
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = attachment.fileName || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        this.alertService.success({
          errors: [
            {
              message: `Attachment "${attachment.fileName}" downloaded successfully`,
              errorType: 'success',
            },
          ],
        });
      },
      error: () => {
        this.alertService.error({
          errors: [
            {
              message: `Failed to download attachment "${attachment.fileName}". Please try again.`,
              errorType: 'error',
            },
          ],
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/tenant/issues']);
  }

  private initializeForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  private loadIssueDetails() {
    this.loading = true;

    const userEmail = this.userDetail.email;
    if (!userEmail) {
      this.alertService.error({
        errors: [
          {
            message: 'User email not found. Please log in again.',
            errorType: 'error',
          },
        ],
      });
      this.loading = false;
      return;
    }

    this.tenantService
      .getTenantByEmail(userEmail)
      .pipe(
        switchMap((tenantResult) => {
          if (
            tenantResult &&
            tenantResult.status === ResultStatusType.Success &&
            tenantResult.entity
          ) {
            this.tenant = tenantResult.entity;
          }
          return this.ticketService.getTicketById(this.issueId);
        }),
        switchMap((issueResult) => {
          if (issueResult && issueResult.success && issueResult.entity) {
            this.issue = issueResult.entity;
            return this.ticketService.getTicketComments(this.issue.id!);
          }
          return of(null);
        }),
      )
      .subscribe({
        next: (commentsResult) => {
          if (
            commentsResult &&
            commentsResult.success &&
            commentsResult.entity
          ) {
            this.comments = commentsResult.entity;
          }
          this.loading = false;
        },
        error: () => {
          this.alertService.error({
            errors: [
              {
                message: 'Error loading issue details. Please try again.',
                errorType: 'error',
              },
            ],
          });
          this.loading = false;
        },
      });
  }
}
