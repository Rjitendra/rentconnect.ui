export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type:
    | 'text'
    | 'quick_reply'
    | 'action'
    | 'issue_creation'
    | 'document_list'
    | 'image_gallery';
  metadata?: {
    quickReplies?: QuickReply[];
    actions?: ChatAction[];
    issueData?: IssueCreationData;
    documents?: DocumentItem[];
    images?: ImageItem[];
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
    | 'view_issues'
    | 'navigate_issues'
    | 'view_property'
    | 'view_payments'
    | 'download_agreement'
    | 'contact_support'
    | 'view_documents'
    | 'view_property_images'
    | 'download_document';
  data?: unknown;
}

export interface DocumentItem {
  id: number;
  name: string;
  type: 'agreement' | 'receipt' | 'inspection' | 'other';
  url: string;
  fileType: string; // e.g., 'pdf', 'docx', 'jpg'
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

export interface ImageItem {
  id: number;
  title: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  category: 'property' | 'room' | 'amenity' | 'issue' | 'other';
  uploadedAt: Date;
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

// AI Configuration for dynamic chat
export interface AiChatConfig {
  id?: number;
  provider: 'openai' | 'azure';
  apiKey: string;
  model: string; // e.g., 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'
  maxTokens: number;
  temperature: number;
  azureEndpoint?: string; // Only for Azure
  azureDeploymentName?: string; // Only for Azure
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// AI Chat Request
export interface AiChatRequest {
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context?: {
    userType: 'tenant' | 'landlord';
    userId: number;
    propertyId?: number;
    tenantId?: number;
    landlordId?: number;
  };
  systemPrompt?: string;
}

// AI Chat Response
export interface AiChatResponse {
  message: string;
  tokensUsed?: number;
  model?: string;
}
