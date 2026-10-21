import * as React from 'react';

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** One sentence, no period. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  placement?: 'top' | 'bottom';
}

export declare function Tooltip(props: TooltipProps): JSX.Element;
