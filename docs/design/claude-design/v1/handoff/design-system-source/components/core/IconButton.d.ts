import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name. */
  icon: string;
  /** Required — becomes aria-label and the tooltip. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
  active?: boolean;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
