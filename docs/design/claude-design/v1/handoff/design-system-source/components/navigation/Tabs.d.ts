import * as React from 'react';

export interface TabItem { key: string; label: React.ReactNode; count?: number }

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: Array<string | TabItem>;
  value?: string;
  onChange?: (key: string) => void;
}

export declare function Tabs(props: TabsProps): JSX.Element;
