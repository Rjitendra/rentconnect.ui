import { Component, OnInit, TemplateRef, viewChild } from '@angular/core';

import {
  NgMatTable,
  TableColumn,
} from '../../../../../projects/shared/src/public-api';
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
@Component({
  selector: 'ng-home',
  imports: [NgMatTable],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
   readonly emailTemplate = viewChild.required<TemplateRef<unknown>>('emailTemplate');
  columns: TableColumn[] = [];
    

  users: User[] = [
    {
      id: 1,
      name: 'Jitendra Behera',
      email: 'jitendra@example.com',
      role: 'Admin',
    },
    { id: 2, name: 'John Doe', email: 'john@example.com', role: 'User' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'Moderator' },
  ];

  tableOptions = {
    showCheckbox: true,
    sortable: true,
    multiSelect: true,
    serverSide: false,
  };
ngOnInit(): void {
    this.columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name', width: '150px' },
    { key: 'email', label: 'Email', type: 'custom', template: this.emailTemplate() },
    { key: 'role', label: 'Role' },
  ];
}
  onRowClick(row: unknown) {
    console.log('Row clicked:', row);
  }

  onSelectionChange(selected: unknown[]) {
    console.log('Selected rows:', selected);
  }
}
