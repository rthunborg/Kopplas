import * as React from 'react';

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Maps to a semantic colour. active = signal yellow ("pågår"). */
  status?: 'draft' | 'planned' | 'active' | 'waiting' | 'done' | 'deviation';
  /** The word. Always present in product UI — the dot alone is not a status. */
  label?: React.ReactNode;
  /** Dot diameter, default 6. */
  size?: number;
}

export declare function StatusDot(props: StatusDotProps): JSX.Element;
