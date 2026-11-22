"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatOreAsKronor } from "@/lib/money";
import type { DashboardDescriptor } from "@/server/read-models/dashboard";
import { WidgetCard } from "./WidgetCard";

// DESIGN type sizes converted at the 16px root baseline so user text enlargement scales.
// Existing role utilities still supply the approved line-height and tracking.
export interface QuotePipelineWidgetProps {
  readonly state: "loading" | "loaded" | "empty" | "error";
  readonly descriptor?: DashboardDescriptor;
  readonly completedAt?: string;
  readonly onRetry?: () => void;
}
function MaskedValue() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  const stop = () => { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
      setOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button type="button" aria-label="Dolt för din roll" aria-describedby={open ? id : undefined} aria-expanded={open}
      title="Din roll ser inte belopp" onClick={() => setOpen(true)}
      onBlur={() => { stop(); setOpen(false); }}
      onPointerDown={() => { stop(); timer.current = setTimeout(() => setOpen(true), 450); }}
      onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop}
      onFocus={() => setOpen(true)}
      className="inline-flex min-h-control-lg min-w-control-lg items-center gap-ds-4 rounded-control text-label font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" style={{ fontSize: "0.8125rem" }}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg><span>Dold</span><span className="sr-only">Dolt för din roll</span>
    </button>
    {open && <span id={id} role="tooltip" aria-label="Din roll ser inte belopp" className="absolute bottom-full left-0 z-10 w-ds-15 rounded-control bg-inverse-surface p-ds-4 text-ds-11 font-medium text-inverse-text" style={{ fontSize: "0.6875rem" }}>Din roll ser inte belopp</span>}
  </span>;
}

/** Presentation consumes projected data and never role names or entitlement overrides. */
export function QuotePipelineWidget({ state, descriptor, completedAt, onRetry }: QuotePipelineWidgetProps) {
  if (state === "loading") return <WidgetCard title="Offertpipeline" href="/quotes" busy>
    <div role="status" aria-live="polite" aria-busy="true" className="min-h-ds-15">
      <span className="sr-only">Läser offertpipeline</span>
      <div aria-hidden="true" className="h-ds-7 w-ds-15 max-w-full rounded-control bg-sunken" />
      <div aria-hidden="true" className="mt-ds-8 grid grid-cols-1 gap-ds-8 sm:grid-cols-3">
        {[1, 2, 3].map(key => <div key={key} className="h-ds-12 rounded-control bg-sunken" />)}
      </div>
    </div>
  </WidgetCard>;
  if (state === "error" || !descriptor || !completedAt) return <WidgetCard title="Offertpipeline" href="/quotes">
    <div role="alert" className="rounded-card bg-sunken p-ds-6 text-body text-text-secondary" style={{ fontSize: "0.9375rem" }}><p>Kunde inte läsa offertpipeline</p><p className="mt-ds-4">Kontrollera anslutningen och försök igen.</p></div>
    <button type="button" onClick={onRetry} className="mt-ds-6 min-h-control-lg min-w-control-lg rounded-control border border-border-strong bg-card px-ds-6 text-label font-medium text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" style={{ fontSize: "0.8125rem" }}>Försök igen</button>
  </WidgetCard>;
  const { data, entitlements } = descriptor;
  const empty = data.sentCount === 0 && data.acceptedCount === 0 && data.lostCount === 0;
  return <WidgetCard title="Offertpipeline" href="/quotes">
    <div aria-live="polite" role="status">
      <p className="break-words text-label text-text-tertiary" style={{ fontSize: "0.8125rem" }}>Period: {data.period.from} – {data.period.to}</p>
      {empty && <p className="mt-ds-6 rounded-card bg-sunken p-ds-6 text-body text-text-secondary" style={{ fontSize: "0.9375rem" }}>Inga offerthändelser under perioden</p>}
      <dl className="mt-ds-8 grid grid-cols-1 gap-ds-8 sm:grid-cols-3">
        {[["Skickade", data.sentCount], ["Accepterade", data.acceptedCount], ["Förlorade", data.lostCount]].map(([label, count]) =>
          <div key={label} className="min-w-0"><dt className="text-label font-medium text-text-tertiary" style={{ fontSize: "0.8125rem" }}>{label}</dt><dd aria-label={String(label)} className="mt-ds-4 break-words text-metric font-semibold tabular-nums text-text-primary" style={{ fontSize: "2.375rem" }}>{count}</dd></div>)}
        <div className="min-w-0"><dt className="text-label font-medium text-text-tertiary" style={{ fontSize: "0.8125rem" }}>Träffgrad</dt><dd aria-label="Träffgrad" className="mt-ds-4 break-words text-heading font-medium tabular-nums text-text-primary" style={{ fontSize: "1.25rem" }}>
          {data.hitRate === null ? "Ingen träffgrad ännu" : new Intl.NumberFormat("sv-SE", { style: "percent", maximumFractionDigits: 1 }).format(data.hitRate)}
        </dd></div>
        <div className="min-w-0 sm:col-span-2"><dt className="text-label font-medium text-text-tertiary" style={{ fontSize: "0.8125rem" }}>Accepterat värde</dt><dd aria-label="Accepterat värde" className="mt-ds-4 break-words text-heading font-medium tabular-nums text-text-primary" style={{ fontSize: "1.25rem" }}>
          {entitlements.withheld.includes("acceptedValueOre") ? <MaskedValue /> : data.acceptedValueOre !== undefined ? formatOreAsKronor(data.acceptedValueOre) + " kr" : "Kunde inte läsa offertpipeline"}
        </dd></div>
      </dl>
      <p className="mt-ds-6 text-caption text-text-tertiary" style={{ fontSize: "0.75rem" }}>Accepterade / (accepterade + förlorade)</p>
      <p className="mt-ds-5 border-t border-border-subtle pt-ds-6 text-caption tabular-nums text-text-tertiary" style={{ fontSize: "0.75rem" }}>Hämtad <time dateTime={completedAt}>{new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(completedAt))}</time></p>
    </div>
  </WidgetCard>;
}
