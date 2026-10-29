/** Neutral type chip; the Swedish label carries the customer classification. */
import { customerTypeLabel } from "./customer-presentation";

export function CustomerTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-chip bg-sunken px-2 py-0.5 text-caption font-medium text-text-secondary">
      {customerTypeLabel(type)}
    </span>
  );
}
