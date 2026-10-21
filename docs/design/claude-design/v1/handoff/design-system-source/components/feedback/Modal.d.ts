import * as React from 'react';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned action row on an inset footer. */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** Max width in px. Default 520. */
  width?: number;
}

export declare function Modal(props: ModalProps): JSX.Element;
