import * as React from 'react';

export interface SidebarItem {
  key?: string;
  label?: React.ReactNode;
  /** Lucide icon name. */
  icon?: string;
  /** Trailing count, right-aligned in tabular numerals. */
  count?: number;
  /** Set instead of key/label to render an uppercase section heading. */
  section?: string;
}

/**
 * 248px app sidebar on the sunken surface with a right hairline.
 */
export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: SidebarItem[];
  value?: string;
  onSelect?: (key: string) => void;
  /** Wordmark text; there is no logo mark. */
  brand?: string;
  footer?: React.ReactNode;
}

export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
