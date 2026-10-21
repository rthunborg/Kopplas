import * as React from 'react';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  /** Quiet helper text below the control. */
  hint?: React.ReactNode;
  /** Replaces hint and turns risk-coloured. */
  error?: React.ReactNode;
  /** Appends "(obligatorisk)" — Kopplas marks required, never optional, and never with an asterisk. */
  required?: boolean;
  htmlFor?: string;
  children?: React.ReactNode;
}

export declare function Field(props: FieldProps): JSX.Element;
