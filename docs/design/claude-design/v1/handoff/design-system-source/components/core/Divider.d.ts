import * as React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLSpanElement> {
  vertical?: boolean;
  /** Renders an uppercase micro-label followed by the rule. */
  label?: React.ReactNode;
}

export declare function Divider(props: DividerProps): JSX.Element;
