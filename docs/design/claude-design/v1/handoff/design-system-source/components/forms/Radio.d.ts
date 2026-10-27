import * as React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  /** Second line of quiet explanatory text. */
  description?: React.ReactNode;
  checked?: boolean;
}

export declare function Radio(props: RadioProps): JSX.Element;
