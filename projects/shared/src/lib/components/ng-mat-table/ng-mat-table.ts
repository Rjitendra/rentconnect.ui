import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  viewChild,
  output
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
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
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NgMatTable {
  @Input() columns: TableColumn[] = [];
  @Input() data: model[] = [];
  @Input() options: TableOptions = {};
  @Input() headerCheckbox = false; // show checkbox in header
  @Input() rowCheckbox = false; // show checkbox in rows
  @Input() isPaginator = false; // enable paginator
  @Input() expandableRows = false; // enable expandable rows
  @Input() expandedRowTemplate?: TemplateRef<any>; // template for expanded content
  @Input() expandKey?: string; // key to use for expansion tracking

  readonly rowClick = output<model>();
  readonly selectionChange = output<model[]>();
  readonly columnClick = output<string>();
  readonly rowSelect = output<model>();
  readonly rowExpand = output<model>();

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<model> = new MatTableDataSource<model>();
  selection!: SelectionModel<model>;
  selectedColumn: string | null = null;
  selectedRow: model | null = null;
  expandedRows: Set<any> = new Set(); // Track expanded rows

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

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
      this.dataSource.paginator = this.paginator();
    }
    if (this.options.sortable) {
      this.dataSource.sort = this.sort();
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

  /** Column click */
  onColumnClick(columnKey: string) {
    // Toggle column selection
    if (this.selectedColumn === columnKey) {
      this.selectedColumn = null;
    } else {
      this.selectedColumn = columnKey;
    }
    this.columnClick.emit(columnKey);
  }

  /** Row selection */
  onRowSelect(row: model) {
    // Toggle row selection
    if (this.selectedRow === row) {
      this.selectedRow = null;
    } else {
      this.selectedRow = row;
    }
    this.rowSelect.emit(row);
  }

  /** Cell click - handles both row click and cell-specific actions */
  onCellClick(event: Event, row: model) {
    // Stop propagation to prevent row selection when clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a') || target.closest('ng-icon')) {
      event.stopPropagation();
      return;
    }
    
    // Emit row click for backward compatibility
    this.rowClick.emit(row);
  }

  /** Checkbox aria-label */
  checkboxLabel(row?: model): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /** Expandable row methods */
  toggleRowExpansion(row: model, expandKey?: string): void {
    const key = expandKey ? row[expandKey] : row;
    if (this.expandedRows.has(key)) {
      this.expandedRows.delete(key);
    } else {
      this.expandedRows.add(key);
    }
    this.rowExpand.emit(row);
  }

  isRowExpanded(row: model, expandKey?: string): boolean {
    const key = expandKey ? row[expandKey] : row;
    return this.expandedRows.has(key);
  }

  // Function for template use - predicate for when to show expanded detail row
  isRowExpandedFn = (index: number, row: model) => {
    return this.isRowExpanded(row, this.expandKey);
  };
}
