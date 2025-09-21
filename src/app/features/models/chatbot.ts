export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'quick_reply' | 'action' | 'issue_creation';
  metadata?: {
    quickReplies?: QuickReply[];
    actions?: ChatAction[];
    issueData?: IssueCreationData;
  };
}

export interface QuickReply {
  id: string;
  text: string;
  payload: string;
}

export interface ChatAction {
  id: string;
  text: string;
  action:
    | 'create_issue'
    | 'view_property'
    | 'view_payments'
    | 'download_agreement'
    | 'contact_support';
  data?: unknown;
}

export interface IssueCreationData {
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCategory: string;
  suggestedPriority: string;
}

export interface ChatbotContext {
  userType: 'tenant' | 'landlord';
  userId: number;
  propertyId?: number;
  tenantId?: number;
  landlordId?: number;
  currentTopic?: string;
  conversationHistory: ChatMessage[];
}

export interface ChatbotResponse {
  message: string;
  quickReplies?: QuickReply[];
  actions?: ChatAction[];
  followUpQuestions?: string[];
  issueCreation?: IssueCreationData;
}

export interface ChatbotRequest {
  message: string;
  context: ChatbotContext;
}

// Predefined intents for better AI understanding
export enum ChatIntent {
  GREETING = 'greeting',
  TENANCY_INFO = 'tenancy_info',
  PROPERTY_INFO = 'property_info',
  PAYMENT_INFO = 'payment_info',
  ISSUE_CREATION = 'issue_creation',
  MAINTENANCE_REQUEST = 'maintenance_request',
  AGREEMENT_INFO = 'agreement_info',
  CONTACT_INFO = 'contact_info',
  HELP = 'help',
  GOODBYE = 'goodbye',
}

// Chatbot configuration
export interface ChatbotConfig {
  maxHistoryLength: number;
  enableQuickReplies: boolean;
  enableIssueCreation: boolean;
  enablePropertyInsights: boolean;
  aiProvider: 'openai' | 'azure' | 'custom';
  model: string;
}
