// table.models.ts
import { TemplateRef } from '@angular/core';

export type TableCellType = 'text' | 'link' | 'custom' | 'checkbox';

export interface TableColumn {
  key: string; // property name in data
  label: string; // header text
  type?: TableCellType; // cell type
  width?: string; // ex: '150px' or '15%'
  color?: string; // text color
  sortable?: boolean; // enable sorting
  template?: TemplateRef<unknown>; // custom cell template
  visible?: boolean; // can hide column dynamically
  sticky?: boolean; // for sticky column
  headerTemplate?: TemplateRef<unknown>; // custom header template
  /** Text color or CSS class */

  className?: string;
}

export interface TableOptions {
  pageSize?: number;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  sortable?: boolean;
  showCheckbox?: boolean;
  multiSelect?: boolean;
}
