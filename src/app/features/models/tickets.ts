import { IProperty } from "./property";
import { ITenant } from "./tenant";

export interface ITicket {
  id?: number; // BaseEntity
  landlordId: number;
  tenantGroupId: number;
  propertyId: number;
  category: string;
  description: string;
  dateCreated: Date | string;

  status?: TicketStatus[];
  tenantId: number;
  tenant?: ITenant;
  property?: IProperty;
}

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
