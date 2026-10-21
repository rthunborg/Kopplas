import * as React from 'react';

export interface SegmentedOption { value: string; label: string }

export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 2–4 short options. More than that: use Select. */
  options?: Array<string | SegmentedOption>;
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
