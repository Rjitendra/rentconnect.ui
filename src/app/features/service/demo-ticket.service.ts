import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { ResultStatusType } from '../../common/enums/common.enums';
import { Result } from '../../common/models/common';
import { IProperty } from '../models/property';
import { ITenant } from '../models/tenant';
import {
  CreatedByType,
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
export class DemoTicketService {
  private mockTickets: ITicket[] = [
    {
      id: 1,
      ticketNumber: 'TKT-2024-001',
      landlordId: 1,
      propertyId: 101,
      category: TicketCategory.Plumbing,
      title: 'Kitchen Sink Leaking',
      description:
        'The kitchen sink has been leaking for the past two days. Water is dripping from the faucet and pooling under the sink. This needs immediate attention as it could cause water damage.',
      priority: TicketPriority.High,
      currentStatus: TicketStatusType.Open,
      createdBy: 1,
      createdByType: CreatedByType.Tenant,
      dateCreated: '2024-01-15T10:30:00Z',
      dateModified: '2024-01-15T10:30:00Z',
      property: {
        id: 101,
        title: 'Sunset Apartments - Unit 2A',
        city: 'Mumbai',
        state: 'Maharashtra',
        landlordId: 1,
      } as IProperty,
      tenant: {
        id: 201,
        name: 'John Doe',
        email: 'john.doe@email.com',
      } as ITenant,
    },
    {
      id: 2,
      ticketNumber: 'TKT-2024-002',
      landlordId: 1,
      propertyId: 102,
      category: TicketCategory.Electricity,
      title: 'Power Outage in Living Room',
      description:
        'The electrical outlets in the living room stopped working yesterday evening. The circuit breaker seems fine, but none of the outlets are providing power.',
      priority: TicketPriority.Medium,
      currentStatus: TicketStatusType.InProgress,
      createdBy: 1,
      createdByType: CreatedByType.Landlord,
      dateCreated: '2024-01-14T14:20:00Z',
      dateModified: '2024-01-15T09:15:00Z',
      property: {
        id: 102,
        title: 'Green Valley Complex - Unit 1B',
        city: 'Pune',
        state: 'Maharashtra',
        landlordId: 1,
      } as IProperty,
      tenant: {
        id: 202,
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
      } as ITenant,
    },
    {
      id: 3,
      ticketNumber: 'TKT-2024-003',
      landlordId: 1,
      propertyId: 101,
      category: TicketCategory.Rent,
      title: 'Rent Payment Clarification',
      description:
        'Need clarification on the rent calculation for this month. There seems to be a discrepancy in the maintenance charges that were added.',
      priority: TicketPriority.Low,
      currentStatus: TicketStatusType.Resolved,
      createdBy: 1,
      createdByType: CreatedByType.Tenant,
      dateCreated: '2024-01-10T11:45:00Z',
      dateModified: '2024-01-12T16:30:00Z',
      dateResolved: '2024-01-12T16:30:00Z',
      property: {
        id: 101,
        title: 'Sunset Apartments - Unit 2A',
        city: 'Mumbai',
        state: 'Maharashtra',
        landlordId: 1,
      } as IProperty,
      tenant: {
        id: 201,
        name: 'John Doe',
        email: 'john.doe@email.com',
      } as ITenant,
    },
  ];

  private mockComments: ITicketComment[] = [
    {
      id: 1,
      ticketId: 1,
      comment:
        'I have reported this issue. The leak is getting worse and I am concerned about water damage to my belongings.',
      addedBy: 201,
      addedByName: 'John Doe',
      addedByType: CreatedByType.Tenant,
      dateCreated: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      ticketId: 1,
      comment:
        'Thank you for reporting this. I have contacted our plumber and they will visit tomorrow morning between 9-11 AM. Please ensure someone is available.',
      addedBy: 1,
      addedByName: 'Property Manager',
      addedByType: CreatedByType.Landlord,
      dateCreated: '2024-01-15T14:20:00Z',
    },
    {
      id: 3,
      ticketId: 2,
      comment:
        'I noticed this issue during my routine inspection. Will arrange for an electrician to check the wiring.',
      addedBy: 1,
      addedByName: 'Property Manager',
      addedByType: CreatedByType.Landlord,
      dateCreated: '2024-01-14T14:20:00Z',
    },
    {
      id: 4,
      ticketId: 2,
      comment:
        'Electrician has identified the issue. It is a faulty GFCI outlet that needs replacement. Work will be completed by end of day.',
      addedBy: 1,
      addedByName: 'Property Manager',
      addedByType: CreatedByType.Landlord,
      dateCreated: '2024-01-15T09:15:00Z',
    },
    {
      id: 5,
      ticketId: 3,
      comment:
        'The maintenance charges include the monthly cleaning service and garden maintenance as per the lease agreement.',
      addedBy: 1,
      addedByName: 'Property Manager',
      addedByType: CreatedByType.Landlord,
      dateCreated: '2024-01-12T16:30:00Z',
    },
  ];

  /**
   * Get demo tickets for landlord
   */
  getLandlordTickets(landlordId: number): Observable<Result<ITicket[]>> {
    console.log('Demo Service - Getting tickets for landlordId:', landlordId);
    console.log('Available mock tickets:', this.mockTickets.length);

    // For demo purposes, return all tickets regardless of landlordId
    // In production, this should filter by landlordId
    const filteredTickets = this.mockTickets; // Show all tickets for demo

    console.log('Returning tickets (demo mode):', filteredTickets.length);

    const result: Result<ITicket[]> = {
      success: true,
      status: ResultStatusType.Success,
      message: 'Success',
      entity: filteredTickets,
    };
    return of(result).pipe(delay(500)); // Simulate API delay
  }

  /**
   * Get demo ticket by ID
   */
  getTicketById(ticketId: number): Observable<Result<ITicket>> {
    const ticket = this.mockTickets.find((t) => t.id === ticketId);
    const result: Result<ITicket> = {
      success: !!ticket,
      status: ticket ? ResultStatusType.Success : ResultStatusType.NotFound,
      message: ticket ? 'Success' : 'Not found',
      entity: ticket || ({} as ITicket),
    };
    return of(result).pipe(delay(300));
  }

  /**
   * Get demo comments for ticket
   */
  getTicketComments(ticketId: number): Observable<Result<ITicketComment[]>> {
    const comments = this.mockComments.filter((c) => c.ticketId === ticketId);
    const result: Result<ITicketComment[]> = {
      success: true,
      status: ResultStatusType.Success,
      message: 'Success',
      entity: comments,
    };
    return of(result).pipe(delay(200));
  }

  /**
   * Create demo ticket
   */
  createTicket(formData: FormData): Observable<ITicketSaveResponse> {
    // Simulate creating a new ticket
    const newTicket: ITicket = {
      id: this.mockTickets.length + 1,
      ticketNumber: `TKT-2024-${String(this.mockTickets.length + 1).padStart(3, '0')}`,
      landlordId: 1,
      propertyId: Number(formData.get('propertyId')),
      category: Number(formData.get('category')) as TicketCategory,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: Number(formData.get('priority')) as TicketPriority,
      currentStatus: TicketStatusType.Open,
      createdBy: Number(formData.get('createdBy')),
      createdByType: Number(formData.get('createdByType')) as CreatedByType,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      property: {
        id: Number(formData.get('propertyId')),
        title: 'Demo Property',
        city: 'Demo City',
        state: 'Demo State',
        landlordId: 1,
      } as IProperty,
    };

    this.mockTickets.push(newTicket);

    const response: ITicketSaveResponse = {
      success: true,
      message: 'Ticket created successfully!',
      entity: newTicket,
    };

    return of(response).pipe(delay(800));
  }

  /**
   * Add demo comment
   */
  addComment(
    ticketId: number,
    comment: string,
    addedBy: number,
    addedByType: CreatedByType,
  ): Observable<Result<ITicketComment>> {
    const newComment: ITicketComment = {
      id: this.mockComments.length + 1,
      ticketId,
      comment,
      addedBy,
      addedByName:
        addedByType === CreatedByType.Landlord
          ? 'Property Manager'
          : 'Tenant User',
      addedByType,
      dateCreated: new Date().toISOString(),
    };

    this.mockComments.push(newComment);

    const result: Result<ITicketComment> = {
      success: true,
      status: ResultStatusType.Success,
      message: 'Success',
      entity: newComment,
    };

    return of(result).pipe(delay(400));
  }

  /**
   * Update demo ticket status
   */
  updateTicketStatus(
    ticketId: number,
    status: TicketStatusType,
    comment?: string,
  ): Observable<Result<ITicket>> {
    const ticket = this.mockTickets.find((t) => t.id === ticketId);

    if (ticket) {
      ticket.currentStatus = status;
      ticket.dateModified = new Date().toISOString();

      if (
        status === TicketStatusType.Resolved ||
        status === TicketStatusType.Closed
      ) {
        ticket.dateResolved = new Date().toISOString();
      }

      // Add status change comment if provided
      if (comment) {
        const statusComment: ITicketComment = {
          id: this.mockComments.length + 1,
          ticketId,
          comment: `Status changed to ${status}. ${comment}`,
          addedBy: 1,
          addedByName: 'Property Manager',
          addedByType: CreatedByType.Landlord,
          dateCreated: new Date().toISOString(),
        };
        this.mockComments.push(statusComment);
      }
    }

    const result: Result<ITicket> = {
      success: !!ticket,
      status: ticket ? ResultStatusType.Success : ResultStatusType.NotFound,
      message: ticket ? 'Success' : 'Not found',
      entity: ticket || ({} as ITicket),
    };

    return of(result).pipe(delay(500));
  }
}
