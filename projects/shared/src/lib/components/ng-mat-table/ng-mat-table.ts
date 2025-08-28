import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { TableColumn, TableOptions } from '../../models/mat-table';
import { model } from '../../models/view-model';

@Component({
  selector: 'ng-mat-table',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './ng-mat-table.html',
  styleUrl: './ng-mat-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgMatTable {
  readonly columns = input<TableColumn[]>([]);
  readonly data = input<model[]>([]);
  readonly options = input<TableOptions>({});
  readonly headerCheckbox = input(false);
  readonly rowCheckbox = input(false);
  readonly isPaginator = input(false);
  readonly expandableRows = input(false);
  readonly expandedRowTemplate = input<TemplateRef<any>>();
  readonly expandKey = input<string>();

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

  public expandedRow = signal<model | null>(null);

  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);
  ngOnInit() {
    this.displayedColumns = [
      ...(this.headerCheckbox() || this.rowCheckbox() ? ['select'] : []),
      ...(this.expandableRows() ? ['expand'] : []),
      ...this.columns().map((c) => c.key),
    ];

    this.dataSource = new MatTableDataSource(this.data());
    this.selection = new SelectionModel<model>(
      this.options().multiSelect ?? true,
      [],
    );
  }

  /** Checkbox logic */
  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
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

  onRowClick(row: model) {
    this.rowClick.emit(row);
  }

  onColumnClick(columnKey: string) {
    this.selectedColumn = this.selectedColumn === columnKey ? null : columnKey;
    this.columnClick.emit(columnKey);
  }

  onRowSelect(row: model) {
    this.selectedRow = this.selectedRow === row ? null : row;
    this.rowSelect.emit(row);
  }

  onCellClick(event: Event, row: model) {
    const target = event.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('ng-icon')
    ) {
      event.stopPropagation();
      return;
    }
    this.rowClick.emit(row);
  }

  checkboxLabel(row?: model): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /** Expandable row methods (single expand/collapse) */
  toggleRowExpansion(row: model, expandKey?: string): void {
    const key = expandKey ? row[expandKey] : row;
    const wasExpanded = this.expandedRow() === key;

    if (wasExpanded) {
      // Close currently expanded row
      this.expandedRow.set(null);
    } else {
      // Close previous and expand new row
      this.expandedRow.set(key);
    }

    this.rowExpand.emit(row);
  }

  isRowExpanded(row: model, expandKey?: string): boolean {
    const key = expandKey ? row[expandKey] : row;
    return this.expandedRow() === key;
  }

  isRowExpandedFn = (index: number, row: model) => {
    return this.isRowExpanded(row, this.expandKey());
  };

  /** Checks whether an element is expanded. */
  isExpanded(element: model) {
    const key = this.expandKey() ? element[this.expandKey()!] : element;
    return this.expandedRow() === key;
  }

  /** Toggles the expanded state of an element. */
  toggle(element: model) {
    const key = this.expandKey() ? element[this.expandKey()!] : element;
    this.expandedRow.set(this.isExpanded(element) ? null : key);
  }
}
