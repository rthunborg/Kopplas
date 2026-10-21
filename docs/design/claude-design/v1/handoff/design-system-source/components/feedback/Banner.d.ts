import * as React from 'react';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'neutral' | 'ok' | 'warn' | 'risk' | 'info';
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Usually a ghost or secondary Button, size sm. */
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export declare function Banner(props: BannerProps): JSX.Element;
