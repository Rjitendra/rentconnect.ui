/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ResultStatusType } from '../../common/enums/common.enums';
import { Result } from '../../common/models/common';
import {
  ChatAction,
  ChatMessage,
  ChatbotContext,
  ChatbotRequest,
  ChatbotResponse,
  IssueCreationData,
  QuickReply,
} from '../models/chatbot';

import { PropertyService } from './property.service';
import { TenantService } from './tenant.service';
import { TicketService } from './ticket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly propertyService = inject(PropertyService);
  private readonly ticketService = inject(TicketService);

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public messages$ = this.messagesSubject.asObservable();

  private contextSubject = new BehaviorSubject<ChatbotContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public context$ = this.contextSubject.asObservable();

  // Initialize chatbot with user context
  initializeChatbot(
    userType: 'tenant' | 'landlord',
    userId: number,
    additionalContext?: Partial<ChatbotContext>,
  ): void {
    const context: ChatbotContext = {
      userType,
      userId,
      conversationHistory: [],
      currentTopic: undefined,
      ...additionalContext,
    };

    this.contextSubject.next(context);

    // Add welcome message
    this.addWelcomeMessage(userType);
  }

  // Send message to chatbot
  sendMessage(message: string): Observable<ChatMessage> {
    const context = this.contextSubject.value;
    if (!context) {
      throw new Error('Chatbot not initialized');
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    this.addMessage(userMessage);

    // Process message and get bot response
    return this.processMessage(message, context).pipe(
      map((response) => {
        const botMessage: ChatMessage = {
          id: this.generateMessageId(),
          content: response.message,
          sender: 'bot',
          timestamp: new Date(),
          type: this.getBotMessageType(response),
          metadata: {
            quickReplies: response.quickReplies,
            actions: response.actions,
            issueData: response.issueCreation,
          },
        };

        this.addMessage(botMessage);
        return botMessage;
      }),
      catchError(() => {
        const errorMessage: ChatMessage = {
          id: this.generateMessageId(),
          content:
            'I apologize, but I encountered an error. Please try again or contact support.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
        };
        this.addMessage(errorMessage);
        return of(errorMessage);
      }),
    );
  }
  // Clear chat history
  clearChat(): void {
    this.messagesSubject.next([]);
    const context = this.contextSubject.value;
    if (context) {
      context.conversationHistory = [];
      this.contextSubject.next(context);
    }
  }

  // Get current messages
  getCurrentMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  // Handle quick reply selection
  handleQuickReply(payload: string): Observable<ChatMessage> {
    const context = this.contextSubject.value;
    if (!context) {
      throw new Error('Chatbot not initialized');
    }

    // Convert payload to appropriate message
    const message = this.payloadToMessage(payload);
    return this.sendMessage(message);
  }

  // Handle action execution
  executeAction(
    action: ChatAction,
  ): Observable<{ success: boolean; message: string; data?: unknown }> {
    switch (action.action) {
      case 'create_issue':
        return this.createIssueFromChat(action.data as IssueCreationData);
      case 'view_property':
        return this.getPropertyInfo();
      case 'view_payments':
        return this.getPaymentInfo();
      case 'download_agreement':
        return this.downloadAgreement();
      default:
        return of({ success: false, message: 'Unknown action' });
    }
  }

  // Process user message and generate AI response
  private processMessage(
    message: string,
    context: ChatbotContext,
  ): Observable<ChatbotResponse> {
    // First, try to handle with local logic for common queries
    const localResponse = this.handleLocalQueries(message, context);
    if (localResponse) {
      return of(localResponse);
    }

    // For complex queries, use AI service
    const request: ChatbotRequest = {
      message,
      context: {
        ...context,
        conversationHistory: this.getRecentHistory(5), // Last 5 messages for context
      },
    };

    return this.http
      .post<
        Result<ChatbotResponse>
      >(`${environment.apiBaseUrl}Chatbot/process`, request)
      .pipe(
        map((result) => {
          if (result.status === ResultStatusType.Success && result.entity) {
            return result.entity;
          }
          throw new Error('Failed to get chatbot response');
        }),
      );
  }

  // Handle common queries locally for faster response
  private handleLocalQueries(
    message: string,
    context: ChatbotContext,
  ): ChatbotResponse | null {
    const lowerMessage = message.toLowerCase();

    // Greeting
    if (
      this.matchesIntent(lowerMessage, [
        'hello',
        'hi',
        'hey',
        'good morning',
        'good evening',
      ])
    ) {
      return this.createGreetingResponse(context);
    }

    // Help request
    if (
      this.matchesIntent(lowerMessage, [
        'help',
        'what can you do',
        'commands',
        'options',
      ])
    ) {
      return this.createHelpResponse(context);
    }

    // Quick property info for tenants
    if (
      context.userType === 'tenant' &&
      this.matchesIntent(lowerMessage, [
        'property',
        'address',
        'rent amount',
        'due date',
      ])
    ) {
      return this.createQuickPropertyResponse(context);
    }

    // Quick issue creation
    if (
      this.matchesIntent(lowerMessage, [
        'create issue',
        'report problem',
        'maintenance',
        'repair',
      ])
    ) {
      return this.createIssueCreationResponse(context);
    }

    return null; // Let AI handle complex queries
  }

  // Create contextual responses
  private createGreetingResponse(context: ChatbotContext): ChatbotResponse {
    const userTypeText = context.userType === 'tenant' ? 'tenant' : 'landlord';

    return {
      message: `Hello! I'm your AI assistant. I'm here to help you with your ${userTypeText} needs. What would you like to know about today?`,
      quickReplies: this.getContextualQuickReplies(context),
      followUpQuestions: [
        `How can I assist you with your ${context.userType === 'tenant' ? 'tenancy' : 'properties'} today?`,
      ],
    };
  }

  private createHelpResponse(context: ChatbotContext): ChatbotResponse {
    const capabilities =
      context.userType === 'tenant'
        ? [
            '📋 Get tenancy information (rent amount, due dates, agreement details)',
            '🏠 Property details and address information',
            '💳 Payment history and upcoming payments',
            '🔧 Create and track maintenance issues',
            '📄 Download tenancy agreement',
            '📞 Contact landlord information',
          ]
        : [
            '🏘️ Property portfolio overview',
            '👥 Tenant information and status',
            '💰 Rent collection and payment tracking',
            '🔧 Maintenance requests and status',
            '📊 Property performance insights',
            '📋 Generate reports',
          ];

    return {
      message: `Here's what I can help you with:\n\n${capabilities.join('\n')}\n\nJust ask me anything in natural language!`,
      quickReplies: this.getContextualQuickReplies(context),
    };
  }

  private createQuickPropertyResponse(
    context: ChatbotContext,
  ): ChatbotResponse {
    return {
      message:
        // eslint-disable-next-line prettier/prettier
        "I'd be happy to help you with property information! Let me fetch your current details...",
      actions: [
        {
          id: 'view_property',
          text: 'View Property Details',
          action: 'view_property',
        },
        {
          id: 'view_payments',
          text: 'View Payment Info',
          action: 'view_payments',
        },
      ],
      quickReplies: [
        {
          id: 'rent_amount',
          // eslint-disable-next-line prettier/prettier
          text: "What's my rent amount?",
          payload: 'rent_amount',
        },
        { id: 'due_date', text: 'When is rent due?', payload: 'due_date' },
        {
          id: 'property_address',
          text: 'Property address',
          payload: 'property_address',
        },
      ],
    };
  }

  private createIssueCreationResponse(
    context: ChatbotContext,
  ): ChatbotResponse {
    return {
      message:
        'I can help you create a maintenance issue. What type of problem are you experiencing?',
      quickReplies: [
        {
          id: 'plumbing',
          text: 'Plumbing Issue',
          payload: 'create_issue_plumbing',
        },
        {
          id: 'electrical',
          text: 'Electrical Problem',
          payload: 'create_issue_electrical',
        },
        { id: 'ac_heating', text: 'AC/Heating', payload: 'create_issue_ac' },
        {
          id: 'general',
          text: 'General Maintenance',
          payload: 'create_issue_general',
        },
        {
          id: 'custom',
          text: 'Describe Custom Issue',
          payload: 'create_issue_custom',
        },
      ],
      followUpQuestions: [
        'Can you describe the issue in detail?',
        'Is this urgent or can it wait for scheduled maintenance?',
      ],
    };
  }

  // Get contextual quick replies based on user type and conversation
  private getContextualQuickReplies(context: ChatbotContext): QuickReply[] {
    if (context.userType === 'tenant') {
      return [
        {
          id: 'property_info',
          text: 'Property Info',
          payload: 'property_info',
        },
        {
          id: 'payment_info',
          text: 'Payment Details',
          payload: 'payment_info',
        },
        { id: 'create_issue', text: 'Report Issue', payload: 'create_issue' },
        { id: 'agreement', text: 'Agreement Info', payload: 'agreement' },
      ];
    } else {
      return [
        {
          id: 'tenant_overview',
          text: 'Tenant Overview',
          payload: 'tenant_overview',
        },
        {
          id: 'property_performance',
          text: 'Property Performance',
          payload: 'property_performance',
        },
        {
          id: 'maintenance_requests',
          text: 'Maintenance Requests',
          payload: 'maintenance_requests',
        },
        {
          id: 'rent_collection',
          text: 'Rent Collection',
          payload: 'rent_collection',
        },
      ];
    }
  }

  // Create issue from chatbot conversation
  private createIssueFromChat(
    issueData: IssueCreationData,
  ): Observable<{ success: boolean; message: string; data?: unknown }> {
    const context = this.contextSubject.value;
    if (!context || context.userType !== 'tenant') {
      return of({ success: false, message: 'Only tenants can create issues' });
    }

    // Convert chatbot issue data to ticket format
    const ticketData = {
      title: issueData.suggestedTitle,
      description: issueData.suggestedDescription,
      category: this.mapCategoryToEnum(issueData.suggestedCategory),
      priority: this.mapPriorityToEnum(issueData.suggestedPriority),
      tenantId: context.tenantId || context.userId,
    };

    return this.ticketService.createTicketFromChatbot(ticketData).pipe(
      map((result) => ({
        success: result.status === ResultStatusType.Success,
        message: Array.isArray(result.message)
          ? result.message.join(', ')
          : result.message,
        data: result.entity,
      })),
    );
  }

  // Utility methods
  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);

    // Update context with conversation history
    const context = this.contextSubject.value;
    if (context) {
      context.conversationHistory.push(message);
      this.contextSubject.next(context);
    }
  }

  private addWelcomeMessage(userType: 'tenant' | 'landlord'): void {
    const welcomeText =
      userType === 'tenant'
        ? 'Welcome to your Tenant Assistant! I can help you with tenancy information, property details, payments, and maintenance requests. How can I assist you today?'
        : 'Welcome to your Landlord Assistant! I can help you manage your properties, track tenant information, monitor rent collection, and handle maintenance requests. What would you like to know?';

    const welcomeMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: welcomeText,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        quickReplies: this.getContextualQuickReplies({
          userType,
          userId: 0,
          conversationHistory: [],
        }),
      },
    };

    this.addMessage(welcomeMessage);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBotMessageType(response: ChatbotResponse): ChatMessage['type'] {
    if (response.issueCreation) return 'issue_creation';
    if (response.actions && response.actions.length > 0) return 'action';
    if (response.quickReplies && response.quickReplies.length > 0)
      return 'quick_reply';
    return 'text';
  }

  private getRecentHistory(count: number): ChatMessage[] {
    const messages = this.messagesSubject.value;
    return messages.slice(-count);
  }

  private matchesIntent(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.includes(keyword));
  }

  private payloadToMessage(payload: string): string {
    const payloadMap: { [key: string]: string } = {
      property_info: 'Tell me about my property',
      payment_info: 'Show me my payment information',
      create_issue: 'I want to create a maintenance issue',
      agreement: 'Tell me about my tenancy agreement',
      rent_amount: 'What is my monthly rent amount?',
      due_date: 'When is my rent due?',
      property_address: 'What is my property address?',
      create_issue_plumbing: 'I have a plumbing issue',
      create_issue_electrical: 'I have an electrical problem',
      create_issue_ac: 'I have an AC or heating issue',
      create_issue_general: 'I need general maintenance',
      create_issue_custom: 'I want to describe a custom issue',
    };

    return payloadMap[payload] || payload;
  }

  private mapCategoryToEnum(category: string): number {
    const categoryMap: { [key: string]: number } = {
      plumbing: 0,
      electrical: 1,
      ac_heating: 2,
      general: 3,
      cleaning: 4,
      security: 5,
    };
    return categoryMap[category.toLowerCase()] || 3; // Default to general
  }

  private mapPriorityToEnum(priority: string): number {
    const priorityMap: { [key: string]: number } = {
      low: 0,
      medium: 1,
      high: 2,
      urgent: 3,
    };
    return priorityMap[priority.toLowerCase()] || 1; // Default to medium
  }

  // API integration methods (to be implemented)
  private getPropertyInfo(): Observable<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    const context = this.contextSubject.value;
    if (!context)
      return of({ success: false, message: 'No context available' });

    if (context.propertyId) {
      return this.propertyService.getPropertyById(context.propertyId).pipe(
        map((result) => ({
          success: result.status === ResultStatusType.Success,
          message: Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message,
          data: result.entity,
        })),
      );
    }
    return of({ success: false, message: 'No property ID available' });
  }

  private getPaymentInfo(): Observable<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    // Implementation for payment info retrieval
    return of({ success: true, message: 'Payment information retrieved' });
  }

  private downloadAgreement(): Observable<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    // Implementation for agreement download
    return of({ success: true, message: 'Agreement download initiated' });
  }
}
