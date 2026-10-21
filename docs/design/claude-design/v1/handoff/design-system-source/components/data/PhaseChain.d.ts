import * as React from 'react';

export interface Phase { key?: string; label: string; meta?: React.ReactNode }

/**
 * The five-phase spine: prospektering → projektering → genomförande → dokumentering → fakturering.
 * Completed phases are ink, the current phase is signal yellow, future phases are grey.
 */
export interface PhaseChainProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Defaults to the five Kopplas phases. */
  phases?: Phase[];
  /** Index of the phase in progress. */
  current?: number;
  onSelect?: (index: number, phase: Phase) => void;
  compact?: boolean;
}

export declare function PhaseChain(props: PhaseChainProps): JSX.Element;
