// table.models.ts
import { TemplateRef } from '@angular/core';

export type TableCellType = 'text' | 'link' | 'custom' | 'checkbox';

export interface TableColumn {
  key: string; // property name in data
  label: string; // header text
  type?: TableCellType; // cell type
  width?: string; // ex: '150px', '15%', 'auto'
  minWidth?: string; // minimum width
  maxWidth?: string; // maximum width
  color?: string; // text color
  sortable?: boolean; // enable sorting
  template?: TemplateRef<unknown>; // custom cell template
  visible?: boolean; // can hide column dynamically
  sticky?: boolean; // for sticky column
  headerTemplate?: TemplateRef<unknown>; // custom header template
  className?: string; // CSS class
  wrapText?: boolean; // allow text wrapping
  truncateText?: boolean; // truncate with ellipsis
  align?: 'left' | 'center' | 'right'; // text alignment
  headerAlign?: 'left' | 'center' | 'right'; // header alignment
  iconClass?: string; // CSS class for icon styling (e.g., 'icon-view', 'icon-edit')
  iconColor?: string; // Direct color for icons
}

export interface TableOptions {
  pageSize?: number;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  sortable?: boolean;
  showCheckbox?: boolean;
  multiSelect?: boolean;
  responsive?: boolean; // enable responsive behavior
  autoWidth?: boolean; // auto adjust column widths
  fixedLayout?: boolean; // use fixed table layout
  stickyHeader?: boolean; // sticky header
  stickyPaginator?: boolean; // sticky paginator
}
