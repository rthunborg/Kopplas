import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Lucide 0.542.0 name, kebab-case: "zap", "file-text", "circle-check". Unknown names render nothing. */
  name: string;
  /** Pixel box. 14 inline, 16 default UI, 20 sidebar/toolbar, 24 field/mobile. */
  size?: number;
  /** Stroke weight. 1.75 default; 1.5 at small sizes, 2 at 24px+. */
  strokeWidth?: number;
  /** Accessible label. Omit for decorative icons (then aria-hidden). */
  title?: string;
}

export declare function Icon(props: IconProps): JSX.Element | null;

/** Every embedded icon name. */
export declare const iconNames: string[];
