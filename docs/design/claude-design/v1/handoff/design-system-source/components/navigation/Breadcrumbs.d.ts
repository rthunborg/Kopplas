import * as React from 'react';

export interface Crumb { label: React.ReactNode; href?: string }

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items?: Array<string | Crumb>;
}

export declare function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
