import * as React from 'react';

export interface SelectOption { value: string; label: string }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Strings or {value,label} pairs. */
  options?: Array<string | SelectOption>;
  /** Rendered as an empty-value first option. */
  placeholder?: string;
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export declare function Select(props: SelectProps): JSX.Element;
