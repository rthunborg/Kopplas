import * as React from 'react';

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: React.ReactNode;
  /** Quiet second line, e.g. the project number in mono. */
  subtitle?: React.ReactNode;
  /** Right-aligned cluster of controls. */
  actions?: React.ReactNode;
  /** Glass + blur over scrolled content. Default true. */
  sticky?: boolean;
  children?: React.ReactNode;
}

export declare function TopBar(props: TopBarProps): JSX.Element;
