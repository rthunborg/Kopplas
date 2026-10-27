import * as React from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: React.ReactNode;
  tone?: 'neutral' | 'ok' | 'risk';
  /** Inline undo-style action; render as a link-like button in white. */
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export declare function Toast(props: ToastProps): JSX.Element;
