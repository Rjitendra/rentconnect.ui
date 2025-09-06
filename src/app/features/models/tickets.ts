import { IProperty } from './property';
import { ITenant } from './tenant';

export interface ITicket {
  id?: number; // BaseEntity
  ticketNumber?: string; // Auto-generated ticket number
  landlordId: number;
  tenantGroupId?: string;
  propertyId: number;
  category: TicketCategory;
  title: string; // Header/title of the ticket
  description: string;
  priority: TicketPriority;
  currentStatus: TicketStatusType;
  createdBy: number; // User ID who created the ticket
  createdByType: 'landlord' | 'tenant'; // Who created it
  assignedTo?: number; // User ID assigned to handle the ticket
  dateCreated: Date | string;
  dateModified?: Date | string;
  dateResolved?: Date | string;

  // Navigation properties
  statusHistory?: ITicketStatus[];
  tenantId?: number;
  tenant?: ITenant;
  property?: IProperty;
  comments?: ITicketComment[];
}

export interface ITicketComment {
  id?: number;
  ticketId: number;
  comment: string;
  addedBy: number;
  addedByName: string;
  addedByType: 'landlord' | 'tenant';
  dateCreated: Date | string;
  attachments?: ITicketAttachment[];
}

export interface ITicketAttachment {
  id?: number;
  commentId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: number;
  dateUploaded: Date | string;
}

export interface ITicketStatus {
  id?: number; // BaseEntity
  ticketId: number;
  status: TicketStatusType;
  comment?: string;
  addedBy: number;
  addedByName: string;
  addedByType: 'landlord' | 'tenant';
  dateCreated: Date | string;
}

// Legacy interface for backward compatibility
export interface TicketHistory {
  status: string;
  comment: string;
  name: string;
  createdDate: Date | string;
}

export interface TicketStatus {
  id?: number; // BaseEntity
  ticketId: number;
  status: string;
  comment: string;
  addedBy: number;
  dateModified?: Date | string;
  dateCreated: Date | string;
}

// Enums
export enum TicketCategory {
  Electricity = 'electricity',
  Plumbing = 'plumbing',
  Rent = 'rent',
  Maintenance = 'maintenance',
  Appliances = 'appliances',
  Security = 'security',
  Cleaning = 'cleaning',
  Pest = 'pest',
  Noise = 'noise',
  Parking = 'parking',
  Internet = 'internet',
  Heating = 'heating',
  AirConditioning = 'air_conditioning',
  Other = 'other',
}

export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export enum TicketStatusType {
  Open = 'open',
  InProgress = 'in_progress',
  Pending = 'pending',
  Resolved = 'resolved',
  Closed = 'closed',
  Cancelled = 'cancelled',
}

// API Response interfaces
export interface ITicketSaveResponse {
  success: boolean;
  message?: string;
  entity?: ITicket;
  errors?: string[];
}

export interface ITicketListResponse {
  success: boolean;
  message?: string;
  entity?: ITicket[];
  errors?: string[];
}
