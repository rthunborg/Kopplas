import * as React from 'react';

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Right-aligned cluster. */
  right?: React.ReactNode;
  dense?: boolean;
}

export declare function Toolbar(props: ToolbarProps): JSX.Element;
