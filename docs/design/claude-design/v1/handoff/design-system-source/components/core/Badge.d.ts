import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  tone?: 'neutral' | 'ink' | 'ok' | 'warn' | 'risk' | 'info' | 'signal';
}

export declare function Badge(props: BadgeProps): JSX.Element;
