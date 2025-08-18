import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TableColumn, TableOptions } from '../../models/mat-table';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { model } from '../../models/view-model';
@Component({
  selector: 'ng-mat-table',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    CommonModule,
  ],
  templateUrl: './ng-mat-table.html',
  styleUrl: './ng-mat-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgMatTable {
  @Input() columns: TableColumn[] = [];
  @Input() data: model[] = [];
  @Input() options: TableOptions = {};
  @Input() headerCheckbox = false; // show checkbox in header
  @Input() rowCheckbox = false; // show checkbox in rows
  @Input() isPaginator = false; // enable paginator

  @Output() rowClick = new EventEmitter<model>();
  @Output() selectionChange = new EventEmitter<model[]>();

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<model> = new MatTableDataSource<model>();
  selection!: SelectionModel<model>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    // Setup columns
    this.displayedColumns = [
      ...(this.headerCheckbox || this.rowCheckbox ? ['select'] : []),
      ...this.columns.map((c) => c.key),
    ];

    this.dataSource = new MatTableDataSource(this.data);

    // Initialize selection
    this.selection = new SelectionModel<model>(
      this.options.multiSelect ?? true,
      []
    );
  }

  ngAfterViewInit() {
    if (!this.options.serverSide) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.options.sortable) {
      this.dataSource.sort = this.sort;
    }
  }

  /** Checkbox logic */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: model) {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }

  /** Row click */
  onRowClick(row: model) {
    this.rowClick.emit(row);
  }

  /** Checkbox aria-label */
  checkboxLabel(row?: model): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
}
