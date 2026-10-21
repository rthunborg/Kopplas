import * as React from 'react';

/**
 * Hairline container. No shadow at rest — shadow belongs to floating layers only.
 */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  /** Optional header title; renders a hairline-separated header row. */
  title?: React.ReactNode;
  /** Right-aligned header slot, usually a ghost Button or IconButton. */
  action?: React.ReactNode;
  /** CSS length for body padding. Default 24px. */
  padding?: string;
  /** Border darkens on hover; use for cards that navigate. */
  interactive?: boolean;
}

export declare function Card(props: CardProps): JSX.Element;
