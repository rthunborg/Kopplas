import * as React from 'react';

/**
 * Action trigger. Primary is black — colour is information, black is action.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** primary = black ink. signal = the yellow accent, marketing CTA only. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'signal' | 'danger';
  /** 28 / 34 / 44px. Use lg for field & mobile touch targets. */
  size?: 'sm' | 'md' | 'lg';
  /** Lucide icon name before the label. */
  icon?: string;
  /** Lucide icon name after the label. */
  iconAfter?: string;
  loading?: boolean;
  fullWidth?: boolean;
  /** Render as another element, e.g. "a". */
  as?: 'button' | 'a';
}

export declare function Button(props: ButtonProps): JSX.Element;
