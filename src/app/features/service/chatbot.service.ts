/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ResultStatusType } from '../../common/enums/common.enums';
import { Result } from '../../common/models/common';
import {
  AiChatRequest,
  AiChatResponse,
  ChatAction,
  ChatMessage,
  ChatbotContext,
  ChatbotResponse,
  IssueCreationData,
  QuickReply,
} from '../models/chatbot';

import { AiConfigService } from './ai-config.service';
import { PropertyService } from './property.service';
import { TenantService } from './tenant.service';
import { TicketService } from './ticket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  // AI availability (online/offline) observable
  public aiOnline$!: Observable<boolean>;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);
  private readonly propertyService = inject(PropertyService);
  private readonly ticketService = inject(TicketService);
  private readonly aiConfigService = inject(AiConfigService);

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public messages$ = this.messagesSubject.asObservable();

  private contextSubject = new BehaviorSubject<ChatbotContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public context$ = this.contextSubject.asObservable();

  // Flag to enable/disable AI-powered responses
  private useAiResponses = true;
  private aiOnlineSubject!: BehaviorSubject<boolean>;

  constructor() {
    // Initialize AI availability subjects
    this.aiOnlineSubject = new BehaviorSubject<boolean>(true);
    this.aiOnline$ = this.aiOnlineSubject.asObservable();
  }

  // Initialize chatbot with user context
  initializeChatbot(
    userType: 'tenant' | 'landlord',
    userId: number,
    additionalContext?: Partial<ChatbotContext>,
  ): void {
    // Determine AI availability before initialization
    this.checkAiAvailability();
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
      case 'view_issues':
        return this.viewIssuesList();
      case 'navigate_issues':
        return this.navigateToIssues();
      case 'view_property':
        return this.getPropertyInfo();
      case 'view_payments':
        return this.getPaymentInfo();
      case 'download_agreement':
        return this.downloadAgreement();
      case 'view_documents':
        return this.viewDocuments();
      case 'view_property_images':
        return this.viewPropertyImages();
      case 'download_document':
        return this.downloadDocument(action.data);
      default:
        return of({ success: false, message: 'Unknown action' });
    }
  }

  /**
   * Check AI availability based on active configuration
   */
  private checkAiAvailability(): void {
    this.aiConfigService
      .getActiveConfig()
      .pipe(
        map((cfg) => !!cfg && cfg.isActive === true),
        catchError(() => of(false)),
      )
      .subscribe((isActive) => {
        this.aiOnlineSubject.next(isActive);
        this.useAiResponses = isActive;
      });
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

    // For complex queries, use AI service if enabled
    if (this.useAiResponses) {
      return this.getAiResponse(message, context);
    }

    // Fallback to simple response
    return of({
      message:
        "I'm here to help! You can ask me about your property, rent, payments, or report maintenance issues.",
      quickReplies: this.getContextualQuickReplies(context),
    });
  }

  // Get AI-powered response from backend
  private getAiResponse(
    message: string,
    context: ChatbotContext,
  ): Observable<ChatbotResponse> {
    // Prepare conversation history for AI
    const conversationHistory = this.getRecentHistory(10).map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // Create system prompt based on user type
    const systemPrompt = this.generateSystemPrompt(context);

    // Prepare AI chat request
    const aiRequest: AiChatRequest = {
      message,
      conversationHistory,
      context: {
        userType: context.userType,
        userId: context.userId,
        propertyId: context.propertyId,
        tenantId: context.tenantId,
        landlordId: context.landlordId,
      },
      systemPrompt,
    };

    // Call backend AI endpoint
    return this.http
      .post<
        Result<AiChatResponse>
      >(`${environment.apiBaseUrl}Chatbot/ai-chat`, aiRequest)
      .pipe(
        map((result) => {
          if (result.status === ResultStatusType.Success && result.entity) {
            // Convert AI response to ChatbotResponse
            return this.parseAiResponse(result.entity, context);
          }
          throw new Error('Failed to get AI response');
        }),
        catchError((error) => {
          console.error('AI response error:', error);
          // Fallback to basic response
          return of({
            message:
              "I'm having trouble processing your request right now. Please try again or use the quick options below.",
            quickReplies: this.getContextualQuickReplies(context),
          });
        }),
      );
  }

  // Generate system prompt based on user context
  private generateSystemPrompt(context: ChatbotContext): string {
    const basePrompt = `You are an AI assistant for a property rental management system called RentConnect. 
Your role is to help users with their rental-related queries in a friendly, professional manner.`;

    if (context.userType === 'tenant') {
      return `${basePrompt}

Current User Type: Tenant
User ID: ${context.userId}
${context.propertyId ? `Property ID: ${context.propertyId}` : ''}
${context.tenantId ? `Tenant ID: ${context.tenantId}` : ''}

You can help tenants with:
- Viewing their property details and rent information
- Checking payment history and upcoming payments
- Reporting maintenance issues and tracking them
- Downloading their tenancy agreement
- Contacting their landlord
- General questions about their tenancy

When suggesting actions:
- If they want to view issues, mention they can use the "View My Issues" option
- If they want to report problems, guide them to create a maintenance issue
- Always be empathetic and helpful
- Keep responses concise and actionable

IMPORTANT: 
- Do NOT make up or fabricate specific data (rent amounts, dates, etc.)
- If specific data is needed, suggest they check the relevant section or ask them to use quick actions
- Focus on guidance and support rather than providing specific numbers unless you have them from the context`;
    } else {
      return `${basePrompt}

Current User Type: Landlord
User ID: ${context.userId}
${context.landlordId ? `Landlord ID: ${context.landlordId}` : ''}

You can help landlords with:
- Managing their property portfolio
- Viewing tenant information and status
- Tracking rent collection and payments
- Managing maintenance requests
- Generating reports and insights
- Property performance metrics

When suggesting actions:
- Guide them to relevant sections of the platform
- Provide insights on property management best practices
- Keep responses professional and data-focused

IMPORTANT:
- Do NOT make up or fabricate specific data
- If specific data is needed, suggest they check the relevant reports or dashboard
- Focus on guidance and actionable insights`;
    }
  }

  // Parse AI response and add appropriate quick replies/actions
  private parseAiResponse(
    aiResponse: AiChatResponse,
    context: ChatbotContext,
  ): ChatbotResponse {
    const response: ChatbotResponse = {
      message: aiResponse.message,
    };

    // Check if the AI response suggests certain actions
    const messageLower = aiResponse.message.toLowerCase();

    // Add contextual quick replies based on the response content
    if (
      messageLower.includes('issue') ||
      messageLower.includes('maintenance') ||
      messageLower.includes('repair')
    ) {
      response.quickReplies = [
        {
          id: 'create_issue',
          text: 'Report an Issue',
          payload: 'create_issue',
        },
        {
          id: 'view_issues',
          text: 'View My Issues',
          payload: 'view_issues',
        },
      ];
    } else if (
      messageLower.includes('property') ||
      messageLower.includes('rent') ||
      messageLower.includes('payment')
    ) {
      response.quickReplies = [
        {
          id: 'property_info',
          text: 'Property Details',
          payload: 'property_info',
        },
        {
          id: 'payment_info',
          text: 'Payment Info',
          payload: 'payment_info',
        },
      ];
    } else {
      // Default quick replies
      response.quickReplies = this.getContextualQuickReplies(context);
    }

    return response;
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

    // Identity queries
    if (
      this.matchesIntent(lowerMessage, [
        'what is my name',
        "what's my name",
        'who am i',
        'my name',
      ])
    ) {
      const displayName = context.userName || 'I do not have your name yet.';
      return {
        message: `Your name is ${displayName}.`,
        quickReplies: this.getContextualQuickReplies(context),
      };
    }

    if (
      this.matchesIntent(lowerMessage, [
        'what is my email',
        "what's my email",
        'my email',
        'email address',
      ])
    ) {
      const email = context.userEmail || 'not available';
      return {
        message: `Your email is ${email}.`,
        quickReplies: this.getContextualQuickReplies(context),
      };
    }

    // View issues
    if (
      context.userType === 'tenant' &&
      this.matchesIntent(lowerMessage, [
        'view issues',
        'my issues',
        'show issues',
        'list issues',
        'see issues',
      ])
    ) {
      // Trigger the view issues action
      this.viewIssuesList().subscribe();
      return null; // Return null to let the action handle the response
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

    // View documents
    if (
      this.matchesIntent(lowerMessage, [
        'view documents',
        'show documents',
        'my documents',
        'see documents',
        'documents',
        'files',
        'agreement',
      ])
    ) {
      // Trigger the view documents action
      this.viewDocuments().subscribe();
      return null; // Return null to let the action handle the response
    }

    // View property images
    if (
      this.matchesIntent(lowerMessage, [
        'view images',
        'show images',
        'property images',
        'property photos',
        'see images',
        'photos',
        'pictures',
      ])
    ) {
      // Trigger the view property images action
      this.viewPropertyImages().subscribe();
      return null; // Return null to let the action handle the response
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
            '📄 View and download documents (agreements, receipts, etc.)',
            '🖼️ View property images and photos',
            '📞 Contact landlord information',
          ]
        : [
            '🏘️ Property portfolio overview',
            '👥 Tenant information and status',
            '💰 Rent collection and payment tracking',
            '🔧 Maintenance requests and status',
            '📄 View property documents',
            '🖼️ View property images',
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
    // Trigger auto-fetch of property details if available
    if (context.propertyId) {
      this.getPropertyInfo().subscribe();
    }

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
          id: 'view_documents',
          text: 'View Documents',
          payload: 'view documents',
        },
        {
          id: 'view_images',
          text: 'Property Images',
          payload: 'view images',
        },
        {
          id: 'view_issues',
          text: 'My Issues',
          payload: 'view_issues',
        },
        { id: 'create_issue', text: 'Report Issue', payload: 'create_issue' },
      ];
    } else {
      return [
        {
          id: 'tenant_overview',
          text: 'Tenant Overview',
          payload: 'tenant_overview',
        },
        {
          id: 'view_documents',
          text: 'Documents',
          payload: 'view documents',
        },
        {
          id: 'view_images',
          text: 'Property Images',
          payload: 'view images',
        },
        {
          id: 'maintenance_requests',
          text: 'Maintenance',
          payload: 'maintenance_requests',
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
      map((result) => {
        if (result.status === ResultStatusType.Success) {
          // Add a bot message confirming the issue creation
          const successMessage: ChatMessage = {
            id: this.generateMessageId(),
            content: `✅ Issue created successfully! Ticket #${result.entity?.ticketId || 'N/A'}. Redirecting you to the issues page...`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
          };
          this.addMessage(successMessage);

          // Automatically navigate to issues page after a brief delay
          setTimeout(() => {
            this.router.navigate(['/tenant/issues']);
          }, 1500);
        }

        return {
          success: result.status === ResultStatusType.Success,
          message: Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message,
          data: result.entity,
        };
      }),
    );
  }

  private viewIssuesList(): Observable<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    const context = this.contextSubject.value;
    if (!context || context.userType !== 'tenant' || !context.tenantId) {
      return of({
        success: false,
        message: 'Unable to fetch issues. Please ensure you are logged in.',
      });
    }

    return this.ticketService.getTenantTickets(context.tenantId).pipe(
      map((result) => {
        if (
          result.status === ResultStatusType.Success &&
          result.entity &&
          result.entity.length > 0
        ) {
          const issuesList = result.entity
            .slice(0, 5)
            .map(
              (ticket, index) =>
                `${index + 1}. **${ticket.title}** - ${ticket.currentStatus} (Priority: ${ticket.priority})`,
            )
            .join('\n');

          const message = `📋 **Your Recent Issues:**\n\n${issuesList}\n\n${result.entity.length > 5 ? `...and ${result.entity.length - 5} more issues.\n\n` : ''}Click "Go to Issues Page" to see all details.`;

          // Add bot message with the list
          const listMessage: ChatMessage = {
            id: this.generateMessageId(),
            content: message,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
            metadata: {
              actions: [
                {
                  id: 'navigate_issues',
                  text: 'Go to Issues Page',
                  action: 'navigate_issues',
                },
                {
                  id: 'create_new_issue',
                  text: 'Create New Issue',
                  action: 'create_issue',
                },
              ],
            },
          };
          this.addMessage(listMessage);

          return {
            success: true,
            message: 'Issues loaded successfully',
            data: result.entity,
          };
        } else {
          const noIssuesMessage: ChatMessage = {
            id: this.generateMessageId(),
            content:
              "✅ You don't have any reported issues. Everything looks good! Would you like to create a new issue?",
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
            metadata: {
              quickReplies: [
                {
                  id: 'create_issue',
                  text: 'Create New Issue',
                  payload: 'create_issue',
                },
              ],
            },
          };
          this.addMessage(noIssuesMessage);

          return {
            success: true,
            message: 'No issues found',
          };
        }
      }),
      catchError(() => {
        return of({
          success: false,
          message: 'Failed to load issues. Please try again later.',
        });
      }),
    );
  }

  private navigateToIssues(): Observable<{
    success: boolean;
    message: string;
  }> {
    // Navigate to issues page using Angular Router
    this.router.navigate(['/tenant/issues']).then(() => {
      // Add a message to indicate navigation
      const navMessage: ChatMessage = {
        id: this.generateMessageId(),
        content: '✅ Navigating to the Issues page...',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };
      this.addMessage(navMessage);
    });

    return of({
      success: true,
      message: 'Navigating to issues page...',
    });
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
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
      view_issues: 'Show me my issues',
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
        map((result) => {
          const success = result.status === ResultStatusType.Success;
          if (success && result.entity) {
            const prop = result.entity as {
              title?: string;
              addressLine1?: string;
              addressLine2?: string;
              city?: string;
              state?: string;
              pinCode?: string;
              monthlyRent?: number;
              securityDeposit?: number;
              carpetAreaSqFt?: number;
            };

            const lines: string[] = [];
            if (prop.title) lines.push(`🏠 ${prop.title}`);
            const addr = [
              prop.addressLine1,
              prop.addressLine2,
              [prop.city, prop.state].filter(Boolean).join(', '),
              prop.pinCode,
            ]
              .filter((x) => !!x && String(x).trim() !== '')
              .join('\n');
            if (addr) lines.push(addr);
            if (prop.carpetAreaSqFt)
              lines.push(`Area: ${prop.carpetAreaSqFt} sq.ft`);
            if (typeof prop.monthlyRent === 'number')
              lines.push(`Rent: ₹${prop.monthlyRent}`);
            if (typeof prop.securityDeposit === 'number')
              lines.push(`Deposit: ₹${prop.securityDeposit}`);

            const content = lines.join('\n');
            const detailMessage: ChatMessage = {
              id: this.generateMessageId(),
              content: content || 'Property details loaded.',
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
              metadata: {
                actions: [
                  {
                    id: 'view_property',
                    text: 'View Property Details',
                    action: 'view_property',
                  },
                  {
                    id: 'view_documents',
                    text: 'View Documents',
                    action: 'view_documents',
                  },
                ],
              },
            };
            this.addMessage(detailMessage);
          }

          return {
            success,
            message: Array.isArray(result.message)
              ? result.message.join(', ')
              : result.message,
            data: result.entity,
          };
        }),
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

  // View tenant/property documents
  private viewDocuments(): Observable<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    const context = this.contextSubject.value;
    if (!context) {
      return of({
        success: false,
        message: 'Unable to fetch documents. Please ensure you are logged in.',
      });
    }

    // For tenants, get tenant documents
    if (context.userType === 'tenant' && context.tenantId) {
      return this.tenantService.getTenantDocuments(context.tenantId).pipe(
        map((result) => {
          if (
            result.status === ResultStatusType.Success &&
            result.entity &&
            result.entity.length > 0
          ) {
            // Convert IDocument[] to DocumentItem[]
            const documents = result.entity.map((doc) => ({
              id: doc.id || 0,
              name: doc.name || 'Unknown Document',
              type: this.mapDocumentType(doc.category),
              url: doc.url || '',
              fileType: this.getFileExtension(doc.name || ''),
              fileSize: doc.size,
              uploadedBy: this.getDocumentUploader(
                doc.ownerType,
                doc.ownerId,
                context,
              ),
              uploadedAt: doc.uploadedOn
                ? new Date(doc.uploadedOn)
                : new Date(),
              description: doc.description,
            }));

            const message = `📄 **Your Documents:**\n\nI found ${documents.length} document(s) for you. Click on any document below to view or download it.`;

            // Add bot message with documents
            const docMessage: ChatMessage = {
              id: this.generateMessageId(),
              content: message,
              sender: 'bot',
              timestamp: new Date(),
              type: 'document_list',
              metadata: {
                documents,
              },
            };
            this.addMessage(docMessage);

            return {
              success: true,
              message: 'Documents loaded successfully',
              data: documents,
            };
          } else {
            const noDocsMessage: ChatMessage = {
              id: this.generateMessageId(),
              content:
                "📄 You don't have any documents uploaded yet. Your landlord can upload documents like agreements, receipts, and inspection reports.",
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
            };
            this.addMessage(noDocsMessage);

            return {
              success: true,
              message: 'No documents found',
            };
          }
        }),
        catchError(() => {
          return of({
            success: false,
            message: 'Failed to load documents. Please try again later.',
          });
        }),
      );
    }

    // For landlords, get property documents
    if (context.userType === 'landlord' && context.propertyId) {
      return this.propertyService.getPropertyDocuments(context.propertyId).pipe(
        map((result) => {
          if (
            result.status === ResultStatusType.Success &&
            result.entity &&
            result.entity.length > 0
          ) {
            const documents = result.entity.map((doc) => ({
              id: doc.id || 0,
              name: doc.name || 'Unknown Document',
              type: this.mapDocumentType(doc.category),
              url: doc.url || '',
              fileType: this.getFileExtension(doc.name || ''),
              fileSize: doc.size,
              uploadedBy: this.getDocumentUploader(
                doc.ownerType,
                doc.ownerId,
                context,
              ),
              uploadedAt: doc.uploadedOn
                ? new Date(doc.uploadedOn)
                : new Date(),
              description: doc.description,
            }));

            const message = `📄 **Property Documents:**\n\nFound ${documents.length} document(s) for this property.`;

            const docMessage: ChatMessage = {
              id: this.generateMessageId(),
              content: message,
              sender: 'bot',
              timestamp: new Date(),
              type: 'document_list',
              metadata: {
                documents,
              },
            };
            this.addMessage(docMessage);

            return {
              success: true,
              message: 'Documents loaded successfully',
              data: documents,
            };
          } else {
            const noDocsMessage: ChatMessage = {
              id: this.generateMessageId(),
              content:
                '📄 No documents found for this property. You can upload documents through the property management section.',
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
            };
            this.addMessage(noDocsMessage);

            return {
              success: true,
              message: 'No documents found',
            };
          }
        }),
        catchError(() => {
          return of({
            success: false,
            message: 'Failed to load documents. Please try again later.',
          });
        }),
      );
    }

    return of({
      success: false,
      message:
        'Unable to load documents. Missing tenant or property information.',
    });
  }

  // View property images
  private viewPropertyImages(): Observable<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    const context = this.contextSubject.value;
    if (!context) {
      return of({
        success: false,
        message: 'Unable to fetch images. Please ensure you are logged in.',
      });
    }

    if (!context.propertyId) {
      return of({
        success: false,
        message: 'No property information available.',
      });
    }

    // Get landlordId from context - should be set for both tenants and landlords
    if (!context.landlordId) {
      return of({
        success: false,
        message:
          'Unable to fetch property images. Landlord information not available.',
      });
    }

    return this.propertyService
      .getPropertyImagesUrl(context.landlordId, context.propertyId)
      .pipe(
        map((result) => {
          if (
            result.status === ResultStatusType.Success &&
            result.entity &&
            result.entity.length > 0
          ) {
            // Convert IDocument[] to ImageItem[]
            const images = result.entity.map((doc) => ({
              id: doc.id || 0,
              title: doc.name || 'Property Image',
              url: doc.url || '',
              thumbnailUrl: doc.url, // Use same URL for thumbnail
              description: doc.description,
              category: 'property' as const,
              uploadedAt: doc.uploadedOn
                ? new Date(doc.uploadedOn)
                : new Date(),
            }));

            const message = `🏠 **Property Images:**\n\nFound ${images.length} image(s) of your property. Click on any image to view it in full size.`;

            // Add bot message with images
            const imageMessage: ChatMessage = {
              id: this.generateMessageId(),
              content: message,
              sender: 'bot',
              timestamp: new Date(),
              type: 'image_gallery',
              metadata: {
                images,
              },
            };
            this.addMessage(imageMessage);

            return {
              success: true,
              message: 'Images loaded successfully',
              data: images,
            };
          } else {
            const noImagesMessage: ChatMessage = {
              id: this.generateMessageId(),
              content:
                '🏠 No property images available yet. Images help showcase the property better!',
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
            };
            this.addMessage(noImagesMessage);

            return {
              success: true,
              message: 'No images found',
            };
          }
        }),
        catchError(() => {
          return of({
            success: false,
            message: 'Failed to load images. Please try again later.',
          });
        }),
      );
  }

  // Download specific document
  private downloadDocument(data: unknown): Observable<{
    success: boolean;
    message: string;
  }> {
    if (typeof data === 'object' && data !== null && 'url' in data) {
      const url = (data as { url: string }).url;
      // Open document in new tab for download
      window.open(url, '_blank');
      return of({
        success: true,
        message: 'Document download started',
      });
    }
    return of({
      success: false,
      message: 'Invalid document data',
    });
  }

  // Helper methods for documents/images
  private mapDocumentType(
    category: number | undefined,
  ): 'agreement' | 'receipt' | 'inspection' | 'other' {
    // Map document categories to types based on actual enum values
    // DocumentCategory enum: Aadhaar=0, PAN=1, OwnershipProof=2, UtilityBill=3,
    // NoObjectionCertificate=4, BankProof=5, PropertyImages=6, RentalAgreement=7, etc.
    switch (category) {
      case 7: // RentalAgreement
        return 'agreement';
      case 3: // UtilityBill
      case 5: // BankProof
        return 'receipt';
      case 13: // PropertyCondition
        return 'inspection';
      case 0: // Aadhaar
      case 1: // PAN
      case 2: // OwnershipProof
      case 4: // NoObjectionCertificate
      case 6: // PropertyImages
      case 8: // AddressProof
      case 9: // IdProof
      case 10: // ProfilePhoto
      case 11: // EmploymentProof
      case 12: // PersonPhoto
      case 14: // Other
      default:
        return 'other';
    }
  }

  private getDocumentUploader(
    ownerType: string | undefined,
    ownerId: number | undefined,
    context: ChatbotContext,
  ): string {
    if (!ownerType) return 'Unknown';

    // Determine who uploaded based on ownerType
    const ownerTypeLower = ownerType.toLowerCase();

    if (ownerTypeLower.includes('landlord')) {
      // Check if it's the current user
      if (context.userType === 'landlord' && ownerId === context.userId) {
        return 'You';
      }
      return 'Landlord';
    } else if (ownerTypeLower.includes('tenant')) {
      // Check if it's the current user
      if (context.userType === 'tenant' && ownerId === context.userId) {
        return 'You';
      }
      return 'Tenant';
    }

    return 'System';
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'unknown';
  }
}
