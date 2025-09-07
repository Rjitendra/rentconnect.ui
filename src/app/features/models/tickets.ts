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
  createdByType: CreatedByType; // Who created it
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
  addedByType: CreatedByType;
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
  addedByType: CreatedByType;
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
  Electricity = 0,
  Plumbing = 1,
  Rent = 2,
  Maintenance = 3,
  Appliances = 4,
  Security = 5,
  Cleaning = 6,
  Pest = 7,
  Noise = 8,
  Parking = 9,
  Internet = 10,
  Heating = 11,
  AirConditioning = 12,
  Other = 13,
}

export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3,
}

export enum TicketStatusType {
  Open = 0,
  InProgress = 1,
  Pending = 2,
  Resolved = 3,
  Closed = 4,
  Cancelled = 5,
}

export enum CreatedByType {
  Landlord = 0,
  Tenant = 1,
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
