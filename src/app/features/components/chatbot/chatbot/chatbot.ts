import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

import {
  AlertService,
  NgButton,
  NgCardComponent,
  NgInputComponent,
} from '../../../../../../projects/shared/src/public-api';
import { ResultStatusType } from '../../../../common/enums/common.enums';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import {
  ChatAction,
  ChatMessage,
  ChatbotContext,
  DocumentItem,
  ImageItem,
  IssueCreationData,
  QuickReply,
} from '../../../models/chatbot';
import { ITenant } from '../../../models/tenant';
import { ChatbotService } from '../../../service/chatbot.service';
import { TenantService } from '../../../service/tenant.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgButton,
    NgInputComponent,
    NgCardComponent,
  ],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // UI State
  isExpanded = false;
  isOnline = true;
  isTyping = false;
  currentMessage = '';
  showChatbot = false; // Control chatbot visibility

  // Chat Data
  messages: ChatMessage[] = [];
  userDetail: Partial<IUserDetail> = {};
  userType: 'tenant' | 'landlord' = 'tenant';
  tenantData: ITenant | null = null;
  private readonly chatbotService = inject(ChatbotService);
  private readonly oauthService = inject(OauthService);
  private readonly tenantService = inject(TenantService);
  private readonly alertService = inject(AlertService);
  private readonly destroy$ = new Subject<void>();
  private readonly cd$ = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initializeUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  toggleChatbot(): void {
    this.isExpanded = !this.isExpanded;
    this.cd$.detectChanges();
    if (this.isExpanded) {
      setTimeout(() => this.scrollToBottom(), 100);
      setTimeout(() => this.scrollToBottom(), 300);
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const message = this.currentMessage.trim();
    this.currentMessage = '';
    this.isTyping = true;
    this.cd$.detectChanges();
    setTimeout(() => this.scrollToBottom(), 0);

    this.chatbotService
      .sendMessage(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTyping = false;
          this.cd$.detectChanges();
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: () => {
          this.alertService.error({
            errors: [{ message: 'Failed to send message. Please try again.' }],
          });
          this.isTyping = false;
          this.cd$.detectChanges();
        },
      });
  }

  sendSuggestedMessage(message: string): void {
    this.currentMessage = message;
    this.sendMessage();
  }

  handleQuickReply(reply: QuickReply): void {
    this.isTyping = true;
    this.cd$.detectChanges();

    this.chatbotService
      .handleQuickReply(reply.payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTyping = false;
          this.cd$.detectChanges();
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: () => {
          this.alertService.error({
            errors: [
              { message: 'Failed to process quick reply. Please try again.' },
            ],
          });
          this.isTyping = false;
          this.cd$.detectChanges();
        },
      });
  }

  handleAction(action: ChatAction): void {
    this.chatbotService
      .executeAction(action)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.alertService.success({
              errors: [{ message: result.message }],
            });
          } else {
            this.alertService.error({
              errors: [{ message: result.message }],
            });
          }
          this.cd$.detectChanges();
        },
        error: () => {
          this.alertService.error({
            errors: [
              { message: 'Failed to execute action. Please try again.' },
            ],
          });
          this.cd$.detectChanges();
        },
      });
  }

  createIssue(issueData: IssueCreationData): void {
    const action: ChatAction = {
      id: 'create_issue_action',
      text: 'Create Issue',
      action: 'create_issue',
      data: issueData,
    };

    this.handleAction(action);
  }

  modifyIssue(issueData: IssueCreationData): void {
    // Allow user to modify the suggested issue details
    const modifyMessage = `I'd like to modify the issue details. The current suggestion is: "${issueData.suggestedTitle}". What would you like to change?`;
    this.currentMessage = modifyMessage;
    this.sendMessage();
  }

  clearChat(): void {
    this.chatbotService.clearChat();
    // Re-add welcome message
    this.initializeChatbot();
    this.cd$.detectChanges();
  }

  getSuggestedQuestions(): string[] {
    if (this.userType === 'tenant') {
      return [
        "What's my monthly rent amount?",
        'When is my rent due?',
        'Show me my issues',
        'I need to report a maintenance issue',
        'Show me my property details',
      ];
    } else {
      return [
        'Show me my property portfolio',
        'Which tenants have pending rent?',
        'What maintenance requests are open?',
        'How can I add a new property?',
        'Show me tenant contact information',
      ];
    }
  }

  // Document and Image handling methods
  openDocument(doc: DocumentItem): void {
    // Open document in new tab
    window.open(doc.url, '_blank');
  }

  openImageViewer(image: ImageItem): void {
    // Open image in new tab
    window.open(image.url, '_blank');
  }

  getDocumentIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      xls: 'table_chart',
      xlsx: 'table_chart',
      txt: 'text_snippet',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      webp: 'image',
    };
    return iconMap[fileType.toLowerCase()] || 'insert_drive_file';
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
  private initializeUser(): void {
    this.userDetail = this.oauthService.getUserInfo();

    // Determine user type based on role
    this.userType = this.determineUserType(this.userDetail);

    // Check if chatbot should be shown
    this.shouldShowChatbot()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (shouldShow) => {
          if (shouldShow) {
            this.showChatbot = true;
            // Initialize chatbot with user context
            this.initializeChatbot();
            // Subscribe to chat messages after initialization
            this.subscribeToChatMessages();
            this.cd$.detectChanges();
          }
        },
        error: () => {
          this.alertService.error({
            errors: [
              {
                message:
                  'Failed to initialize chatbot. Please refresh the page.',
              },
            ],
          });
        },
      });
  }

  private determineUserType(
    userDetail: Partial<IUserDetail>,
  ): 'tenant' | 'landlord' {
    // Determine based on role from user profile
    const roleName = userDetail.roleName?.toLowerCase();

    if (roleName === 'tenant') {
      return 'tenant';
    } else if (roleName === 'landlord') {
      return 'landlord';
    }

    // Fallback: check email (legacy)
    if (userDetail.email?.toLowerCase().includes('tenant')) {
      return 'tenant';
    }

    return 'landlord';
  }

  private shouldShowChatbot() {
    // Always show for landlords
    if (this.userType === 'landlord') {
      return of(true);
    }

    // For tenants, check if they have started tenancy
    if (this.userType === 'tenant') {
      const email = this.userDetail.email;

      if (!email) {
        return of(false);
      }

      // Get tenant data using RxJS
      return this.tenantService.getTenantByEmail(email).pipe(
        switchMap((result) => {
          if (
            (result?.status === ResultStatusType.Success ||
              result?.status === ResultStatusType.None) &&
            result.entity
          ) {
            this.tenantData = result.entity;

            // Check if tenant has started tenancy
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tenancyStartDate = new Date(result.entity.tenancyStartDate);
            tenancyStartDate.setHours(0, 0, 0, 0);

            // Show chatbot only if:
            // 1. Tenancy has started (start date is today or in the past)
            // 2. Agreement is accepted
            // 3. Tenant is active
            const hasStarted = tenancyStartDate <= today;
            const isAgreementAccepted =
              result.entity.agreementAccepted === true;
            const isActive = result.entity.isActive === true;

            const shouldShow = hasStarted && isAgreementAccepted && isActive;

            return of(shouldShow);
          } else {
            return of(false);
          }
        }),
        catchError(() => {
          return of(false);
        }),
      );
    }

    return of(false);
  }

  private initializeChatbot(): void {
    const userId = parseInt(String(this.userDetail.userId || '0'));

    // Additional context based on user type
    const additionalContext: Partial<ChatbotContext> = {};

    if (this.userType === 'tenant' && this.tenantData) {
      // Add tenant-specific context with actual tenant ID, property ID, and landlord ID
      additionalContext.tenantId = this.tenantData.id;
      additionalContext.propertyId = this.tenantData.propertyId;
      additionalContext.landlordId = this.tenantData.landlordId; // ✅ Added landlordId for tenant
    } else if (this.userType === 'landlord') {
      // Add landlord-specific context
      additionalContext.landlordId = userId;
    }

    this.chatbotService.initializeChatbot(
      this.userType,
      userId,
      additionalContext,
    );
  }

  private subscribeToChatMessages(): void {
    this.chatbotService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages) => {
        this.messages = messages;
        this.cd$.detectChanges();
        // Multiple attempts to ensure scroll happens after render
        setTimeout(() => this.scrollToBottom(), 0);
        setTimeout(() => this.scrollToBottom(), 100);
        setTimeout(() => this.scrollToBottom(), 300);
      });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement as HTMLElement;
        container.scrollTop = container.scrollHeight;
        // Also try smooth scroll behavior
        container.scroll({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      // Silently fail if scroll fails
    }
  }
}
