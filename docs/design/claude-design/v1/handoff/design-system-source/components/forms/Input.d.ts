import * as React from 'react';

/**
 * Single-line text input.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Lucide icon name inside the field, left. */
  icon?: string;
  /** Trailing static text, e.g. "kr" or "h". */
  suffix?: React.ReactNode;
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export declare function Input(props: InputProps): JSX.Element;
