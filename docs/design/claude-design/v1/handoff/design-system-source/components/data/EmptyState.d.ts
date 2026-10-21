import * as React from 'react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon name, rendered at 28px in tertiary grey. */
  icon?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** One action, usually a primary Button. */
  action?: React.ReactNode;
}

export declare function EmptyState(props: EmptyStateProps): JSX.Element;
