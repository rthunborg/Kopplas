import * as React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Renders a remove affordance when provided. */
  onRemove?: () => void;
  icon?: string;
}

export declare function Tag(props: TagProps): JSX.Element;
