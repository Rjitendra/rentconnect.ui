import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  AlertService,
  NgButton,
  NgCardComponent,
  NgInputComponent,
} from '../../../../../../projects/shared/src/public-api';
import {
  IUserDetail,
  OauthService,
} from '../../../../oauth/service/oauth.service';
import {
  ChatAction,
  ChatMessage,
  ChatbotContext,
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

  ngOnInit(): void {
    this.initializeUser();
    this.subscribeToChatMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  toggleChatbot(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const message = this.currentMessage.trim();
    this.currentMessage = '';
    this.isTyping = true;

    this.chatbotService
      .sendMessage(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTyping = false;
        },
        error: () => {
          this.alertService.error({
            errors: [{ message: 'Failed to send message. Please try again.' }],
          });
          this.isTyping = false;
        },
      });
  }

  sendSuggestedMessage(message: string): void {
    this.currentMessage = message;
    this.sendMessage();
  }

  handleQuickReply(reply: QuickReply): void {
    this.isTyping = true;

    this.chatbotService
      .handleQuickReply(reply.payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTyping = false;
        },
        error: () => {
          this.alertService.error({
            errors: [
              { message: 'Failed to process quick reply. Please try again.' },
            ],
          });
          this.isTyping = false;
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
        },
        error: () => {
          this.alertService.error({
            errors: [
              { message: 'Failed to execute action. Please try again.' },
            ],
          });
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
  }

  getSuggestedQuestions(): string[] {
    if (this.userType === 'tenant') {
      return [
        "What's my monthly rent amount?",
        'When is my rent due?',
        'Show me my property details',
        'I need to report a maintenance issue',
        'How do I contact my landlord?',
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
  private async initializeUser(): Promise<void> {
    try {
      this.userDetail = this.oauthService.getUserInfo();

      // Determine user type based on role
      this.userType = this.determineUserType(this.userDetail);

      // Check if chatbot should be shown
      const shouldShow = await this.shouldShowChatbot();

      if (shouldShow) {
        this.showChatbot = true;
        // Initialize chatbot with user context
        this.initializeChatbot();
      }
    } catch (error) {
      this.alertService.error({
        errors: [
          { message: 'Failed to initialize chatbot. Please refresh the page.' },
        ],
      });
    }
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

  private async shouldShowChatbot(): Promise<boolean> {
    // Always show for landlords
    if (this.userType === 'landlord') {
      return true;
    }

    // For tenants, check if they have started tenancy
    if (this.userType === 'tenant') {
      try {
        const email = this.userDetail.email;
        if (!email) {
          return false;
        }

        // Get tenant data
        const result = await this.tenantService
          .getTenantByEmail(email)
          .pipe(takeUntil(this.destroy$))
          .toPromise();

        if (result?.status === 0 && result.entity) {
          this.tenantData = result.entity;

          // Check if tenant has started tenancy
          const today = new Date();
          const tenancyStartDate = new Date(result.entity.tenancyStartDate);

          // Show chatbot only if:
          // 1. Tenancy has started (start date is today or in the past)
          // 2. Agreement is accepted
          // 3. Tenant is active
          const hasStarted = tenancyStartDate <= today;
          const isAgreementAccepted = result.entity.agreementAccepted === true;
          const isActive = result.entity.isActive !== false;

          return hasStarted && isAgreementAccepted && isActive;
        }
      } catch (error) {
        // Silently fail - don't show chatbot if we can't verify tenant status
        return false;
      }
    }

    return false;
  }

  private initializeChatbot(): void {
    const userId = parseInt(String(this.userDetail.userId || '0'));

    // Additional context based on user type
    const additionalContext: Partial<ChatbotContext> = {};

    if (this.userType === 'tenant') {
      // Add tenant-specific context
      additionalContext.tenantId = userId;
      // You can add propertyId if available
    } else {
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
        setTimeout(() => this.scrollToBottom(), 100);
      });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}
