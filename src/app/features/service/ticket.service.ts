import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import {
  ITicket,
  ITicketComment,
  ITicketSaveResponse,
  TicketCategory,
  TicketPriority,
  TicketStatusType,
} from '../models/tickets';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private _http = inject(HttpClient);

  /**
   * Get all tickets for a landlord
   */
  getLandlordTickets(landlordId: number): Observable<Result<ITicket[]>> {
    return this._http.get<Result<ITicket[]>>(
      `${environment.apiBaseUrl}Ticket/landlord/${landlordId}`,
    );
  }

  /**
   * Get all tickets for a tenant
   */
  getTenantTickets(tenantId: number): Observable<Result<ITicket[]>> {
    return this._http.get<Result<ITicket[]>>(
      `${environment.apiBaseUrl}Ticket/tenant/${tenantId}`,
    );
  }

  /**
   * Get tickets by property
   */
  getPropertyTickets(propertyId: number): Observable<Result<ITicket[]>> {
    return this._http.get<Result<ITicket[]>>(
      `${environment.apiBaseUrl}Ticket/property/${propertyId}`,
    );
  }

  /**
   * Get ticket by ID with full details including comments
   */
  getTicketById(ticketId: number): Observable<Result<ITicket>> {
    return this._http.get<Result<ITicket>>(
      `${environment.apiBaseUrl}Ticket/${ticketId}`,
    );
  }

  /**
   * Create a new ticket
   */
  createTicket(formData: FormData): Observable<ITicketSaveResponse> {
    return this._http.post<ITicketSaveResponse>(
      `${environment.apiBaseUrl}Ticket/create`,
      formData,
    );
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(
    ticketId: number,
    status: TicketStatusType,
    comment?: string,
    updatedBy?: number,
  ): Observable<Result<ITicket>> {
    const payload = {
      ticketId,
      status,
      comment,
      updatedBy,
    };
    return this._http.put<Result<ITicket>>(
      `${environment.apiBaseUrl}Ticket/${ticketId}/status`,
      payload,
    );
  }

  /**
   * Add comment to ticket
   */
  addComment(
    ticketId: number,
    comment: string,
    addedBy: number,
    addedByType: 'landlord' | 'tenant',
    attachments?: File[],
  ): Observable<Result<ITicketComment>> {
    const formData = new FormData();
    formData.append('ticketId', ticketId.toString());
    formData.append('comment', comment);
    formData.append('addedBy', addedBy.toString());
    formData.append('addedByType', addedByType);

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this._http.post<Result<ITicketComment>>(
      `${environment.apiBaseUrl}Ticket/${ticketId}/comment`,
      formData,
    );
  }

  /**
   * Get ticket comments
   */
  getTicketComments(ticketId: number): Observable<Result<ITicketComment[]>> {
    return this._http.get<Result<ITicketComment[]>>(
      `${environment.apiBaseUrl}Ticket/${ticketId}/comments`,
    );
  }

  /**
   * Delete ticket (soft delete)
   */
  deleteTicket(ticketId: number): Observable<Result<boolean>> {
    return this._http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}Ticket/${ticketId}`,
    );
  }

  /**
   * Convert ticket form data to FormData for API submission
   */
  convertTicketToFormData(
    ticket: Partial<ITicket>,
    attachments?: File[],
  ): FormData {
    const formData = new FormData();

    // Add ticket properties
    if (ticket.landlordId)
      formData.append('landlordId', ticket.landlordId.toString());
    if (ticket.propertyId)
      formData.append('propertyId', ticket.propertyId.toString());
    if (ticket.tenantId)
      formData.append('tenantId', ticket.tenantId.toString());
    if (ticket.category) formData.append('category', ticket.category);
    if (ticket.title) formData.append('title', ticket.title);
    if (ticket.description) formData.append('description', ticket.description);
    if (ticket.priority) formData.append('priority', ticket.priority);
    if (ticket.createdBy)
      formData.append('createdBy', ticket.createdBy.toString());
    if (ticket.createdByType)
      formData.append('createdByType', ticket.createdByType);
    if (ticket.assignedTo)
      formData.append('assignedTo', ticket.assignedTo.toString());

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return formData;
  }

  /**
   * Get category options for dropdown
   */
  getCategoryOptions() {
    return [
      { value: TicketCategory.Electricity, label: 'Electricity' },
      { value: TicketCategory.Plumbing, label: 'Plumbing' },
      { value: TicketCategory.Rent, label: 'Rent Issues' },
      { value: TicketCategory.Maintenance, label: 'General Maintenance' },
      { value: TicketCategory.Appliances, label: 'Appliances' },
      { value: TicketCategory.Security, label: 'Security' },
      { value: TicketCategory.Cleaning, label: 'Cleaning' },
      { value: TicketCategory.Pest, label: 'Pest Control' },
      { value: TicketCategory.Noise, label: 'Noise Complaints' },
      { value: TicketCategory.Parking, label: 'Parking' },
      { value: TicketCategory.Internet, label: 'Internet/Cable' },
      { value: TicketCategory.Heating, label: 'Heating' },
      { value: TicketCategory.AirConditioning, label: 'Air Conditioning' },
      { value: TicketCategory.Other, label: 'Other' },
    ];
  }

  /**
   * Get priority options for dropdown
   */
  getPriorityOptions() {
    return [
      { value: TicketPriority.Low, label: 'Low', color: 'green' },
      { value: TicketPriority.Medium, label: 'Medium', color: 'orange' },
      { value: TicketPriority.High, label: 'High', color: 'red' },
      { value: TicketPriority.Urgent, label: 'Urgent', color: 'purple' },
    ];
  }

  /**
   * Get status options for dropdown
   */
  getStatusOptions() {
    return [
      { value: TicketStatusType.Open, label: 'Open', color: 'blue' },
      {
        value: TicketStatusType.InProgress,
        label: 'In Progress',
        color: 'orange',
      },
      { value: TicketStatusType.Pending, label: 'Pending', color: 'yellow' },
      { value: TicketStatusType.Resolved, label: 'Resolved', color: 'green' },
      { value: TicketStatusType.Closed, label: 'Closed', color: 'gray' },
      { value: TicketStatusType.Cancelled, label: 'Cancelled', color: 'red' },
    ];
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: TicketCategory): string {
    switch (category) {
      case TicketCategory.Electricity:
        return 'electrical_services';
      case TicketCategory.Plumbing:
        return 'plumbing';
      case TicketCategory.Rent:
        return 'payments';
      case TicketCategory.Maintenance:
        return 'build';
      case TicketCategory.Appliances:
        return 'kitchen';
      case TicketCategory.Security:
        return 'security';
      case TicketCategory.Cleaning:
        return 'cleaning_services';
      case TicketCategory.Pest:
        return 'pest_control';
      case TicketCategory.Noise:
        return 'volume_up';
      case TicketCategory.Parking:
        return 'local_parking';
      case TicketCategory.Internet:
        return 'wifi';
      case TicketCategory.Heating:
        return 'thermostat';
      case TicketCategory.AirConditioning:
        return 'ac_unit';
      default:
        return 'help_outline';
    }
  }

  /**
   * Get priority color class
   */
  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.Low:
        return 'priority-low';
      case TicketPriority.Medium:
        return 'priority-medium';
      case TicketPriority.High:
        return 'priority-high';
      case TicketPriority.Urgent:
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  }

  /**
   * Get status color class
   */
  getStatusClass(status: TicketStatusType): string {
    switch (status) {
      case TicketStatusType.Open:
        return 'status-open';
      case TicketStatusType.InProgress:
        return 'status-in-progress';
      case TicketStatusType.Pending:
        return 'status-pending';
      case TicketStatusType.Resolved:
        return 'status-resolved';
      case TicketStatusType.Closed:
        return 'status-closed';
      case TicketStatusType.Cancelled:
        return 'status-cancelled';
      default:
        return 'status-open';
    }
  }
}
