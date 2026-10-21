import * as React from 'react';

export interface TimelineItem { time: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; tone?: 'default' | 'active' }

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items?: TimelineItem[];
}

export declare function Timeline(props: TimelineProps): JSX.Element;
