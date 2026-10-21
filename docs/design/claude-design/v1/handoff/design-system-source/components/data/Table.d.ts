import * as React from 'react';

export interface TableColumn {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  /** Allow the cell to wrap; default is nowrap. */
  wrap?: boolean;
  /** Custom cell renderer, e.g. row => <StatusDot … />. */
  render?: (row: any) => React.ReactNode;
}

/**
 * Dense hairline data table. No zebra striping — rows separate by hairline and hover.
 */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  columns?: TableColumn[];
  rows?: any[];
  onRowClick?: (row: any) => void;
  selectedId?: string | number;
  dense?: boolean;
}

export declare function Table(props: TableProps): JSX.Element;
