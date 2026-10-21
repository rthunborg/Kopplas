import * as React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  label?: React.ReactNode;
  /** Right-aligned formatted value, e.g. "62 %" or "184 / 300 h". */
  valueLabel?: React.ReactNode;
  tone?: 'ink' | 'signal' | 'ok' | 'risk';
  height?: number;
}

export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
