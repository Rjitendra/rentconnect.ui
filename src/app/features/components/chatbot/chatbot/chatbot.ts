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
  NgButton,
  NgCardComponent,
  NgIconComponent,
  NgInputComponent,
} from 'shared';

import {
  IUserDetail,
  OauthService,
} from '../../../oauth/service/oauth.service';
import {
  ChatAction,
  ChatMessage,
  ChatbotContext,
  QuickReply,
} from '../../models/chatbot';
import { ChatbotService } from '../../service/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgButton,
    NgInputComponent,
    NgIconComponent,
    NgCardComponent,
  ],
  template: `
    <div class="chatbot-container" [class.expanded]="isExpanded">
      <!-- Chatbot Toggle Button -->
      <ng-button
        *ngIf="!isExpanded"
        [type]="'fab'"
        [icon]="'chat'"
        [cssClass]="'chatbot-toggle'"
        [tooltip]="'Open AI Assistant'"
        (buttonClick)="toggleChatbot()"
      />

      <!-- Chatbot Interface -->
      <div *ngIf="isExpanded" class="chatbot-interface">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="header-content">
            <div class="bot-avatar">
              <ng-icon [icon]="'smart_toy'" />
            </div>
            <div class="bot-info">
              <h3>AI Assistant</h3>
              <span class="bot-status" [class.online]="isOnline">
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <ng-button
              [type]="'icon'"
              [icon]="'clear_all'"
              [tooltip]="'Clear Chat'"
              (buttonClick)="clearChat()"
            />
            <ng-button
              [type]="'icon'"
              [icon]="'minimize'"
              [tooltip]="'Minimize'"
              (buttonClick)="toggleChatbot()"
            />
          </div>
        </div>

        <!-- Messages Container -->
        <div #messagesContainer class="messages-container">
          <div class="messages-list">
            @for (message of messages; track message.id) {
              <div class="message-wrapper" [class]="message.sender">
                <div class="message-bubble" [class]="message.sender">
                  <div class="message-content">
                    {{ message.content }}
                  </div>
                  <div class="message-time">
                    {{ message.timestamp | date: 'HH:mm' }}
                  </div>
                </div>

                <!-- Quick Replies -->
                @if (
                  message.metadata?.quickReplies && message.sender === 'bot'
                ) {
                  <div class="quick-replies">
                    @for (
                      reply of message.metadata.quickReplies;
                      track reply.id
                    ) {
                      <ng-button
                        [type]="'outlined'"
                        [label]="reply.text"
                        [cssClass]="'quick-reply-btn'"
                        (buttonClick)="handleQuickReply(reply)"
                      />
                    }
                  </div>
                }

                <!-- Action Buttons -->
                @if (message.metadata?.actions && message.sender === 'bot') {
                  <div class="action-buttons">
                    @for (action of message.metadata.actions; track action.id) {
                      <ng-button
                        [type]="'filled'"
                        [label]="action.text"
                        [cssClass]="'action-btn'"
                        (buttonClick)="handleAction(action)"
                      />
                    }
                  </div>
                }

                <!-- Issue Creation Interface -->
                @if (message.metadata?.issueData && message.sender === 'bot') {
                  <div class="issue-creation-card">
                    <ng-card>
                      <div class="issue-preview">
                        <h4>🔧 Create Issue</h4>
                        <div class="issue-details">
                          <p>
                            <strong>Title:</strong>
                            {{ message.metadata.issueData.suggestedTitle }}
                          </p>
                          <p>
                            <strong>Description:</strong>
                            {{
                              message.metadata.issueData.suggestedDescription
                            }}
                          </p>
                          <p>
                            <strong>Category:</strong>
                            {{ message.metadata.issueData.suggestedCategory }}
                          </p>
                          <p>
                            <strong>Priority:</strong>
                            {{ message.metadata.issueData.suggestedPriority }}
                          </p>
                        </div>
                        <div class="issue-actions">
                          <ng-button
                            [type]="'filled'"
                            [label]="'Create Issue'"
                            [icon]="'add'"
                            (buttonClick)="
                              createIssue(message.metadata.issueData)
                            "
                          />
                          <ng-button
                            [type]="'outlined'"
                            [label]="'Modify'"
                            (buttonClick)="
                              modifyIssue(message.metadata.issueData)
                            "
                          />
                        </div>
                      </div>
                    </ng-card>
                  </div>
                }
              </div>
            }

            <!-- Typing Indicator -->
            @if (isTyping) {
              <div class="message-wrapper bot">
                <div class="message-bubble bot typing">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <div class="input-container">
            <ng-input
              [placeholder]="'Type your message...'"
              [disabled]="isTyping"
              [(ngModel)]="currentMessage"
              (keyup.enter)="sendMessage()"
            />
            <ng-button
              [type]="'icon'"
              [icon]="'send'"
              [disabled]="!currentMessage.trim() || isTyping"
              [tooltip]="'Send Message'"
              (buttonClick)="sendMessage()"
            />
          </div>
        </div>

        <!-- Suggested Questions (shown when chat is empty) -->
        @if (messages.length <= 1) {
          <div class="suggested-questions">
            <h4>💡 Try asking:</h4>
            <div class="suggestions">
              @for (suggestion of getSuggestedQuestions(); track suggestion) {
                <ng-button
                  [type]="'outlined'"
                  [label]="suggestion"
                  [cssClass]="'suggestion-btn'"
                  (buttonClick)="sendSuggestedMessage(suggestion)"
                />
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private readonly chatbotService = inject(ChatbotService);
  private readonly oauthService = inject(OauthService);
  private readonly destroy$ = new Subject<void>();

  // UI State
  isExpanded = false;
  isOnline = true;
  isTyping = false;
  currentMessage = '';

  // Chat Data
  messages: ChatMessage[] = [];
  userDetail: Partial<IUserDetail> = {};
  userType: 'tenant' | 'landlord' = 'tenant';

  ngOnInit(): void {
    this.initializeUser();
    this.subscribeToChatMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeUser(): Promise<void> {
    try {
      this.userDetail = await this.oauthService.getUserDetail();

      // Determine user type based on role or other criteria
      this.userType = this.determineUserType(this.userDetail);

      // Initialize chatbot with user context
      this.initializeChatbot();
    } catch (error) {
      console.error('Error initializing user for chatbot:', error);
    }
  }

  private determineUserType(
    userDetail: Partial<IUserDetail>,
  ): 'tenant' | 'landlord' {
    // Logic to determine if user is tenant or landlord
    // This could be based on roles, user type, or other criteria
    if (userDetail.role?.toLowerCase().includes('tenant')) {
      return 'tenant';
    }
    return 'landlord'; // Default to landlord for now
  }

  private initializeChatbot(): void {
    const userId = parseInt(this.userDetail.userId || '0');

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
        next: (response) => {
          this.isTyping = false;
        },
        error: (error) => {
          console.error('Error sending message:', error);
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
        error: (error) => {
          console.error('Error handling quick reply:', error);
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
          console.log('Action executed:', result);
          // Handle action result (e.g., show success message)
        },
        error: (error) => {
          console.error('Error executing action:', error);
        },
      });
  }

  createIssue(issueData: any): void {
    // Navigate to issue creation or handle inline
    console.log('Creating issue:', issueData);

    // You can either:
    // 1. Navigate to the issues page with pre-filled data
    // 2. Create the issue directly through the chatbot service

    const action: ChatAction = {
      id: 'create_issue_action',
      text: 'Create Issue',
      action: 'create_issue',
      data: issueData,
    };

    this.handleAction(action);
  }

  modifyIssue(issueData: any): void {
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
        'How do I download my tenancy agreement?',
      ];
    } else {
      return [
        'Show me my property portfolio',
        'Which tenants have pending rent?',
        'What maintenance requests are open?',
        'Generate a rent collection report',
        'Show me tenant contact information',
      ];
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}
