import * as React from 'react';

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Quiet uppercase micro-label above the number. */
  label: React.ReactNode;
  /** Pre-formatted: "284 500 kr", "18 %", "4 h 30 min". */
  value: React.ReactNode;
  unit?: React.ReactNode;
  /** e.g. "↑ 4 %" — direction as a unicode arrow, no icon. */
  delta?: React.ReactNode;
  deltaTone?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export declare function Metric(props: MetricProps): JSX.Element;
